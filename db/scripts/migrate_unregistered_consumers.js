/**
 * Import -
 * Will try and import all data from goodybag mongodb database into the
 * Goodybag postgres database. Assumes the postgres goodybag database is ready
 * to go.
 */

var
  mongo       = require('mongode')
, pg          = require('pg')
, db          = require('../index')
, config      = require('../../config')
, Transaction = require('pg-transaction')

, startOffset = +process.argv[2] || 0
, batchSize   = +process.argv[3] || 50

, mongoDB     = mongo.connect('mongodb://goodybag:g00dybag@e-mongos0.objectrocket.com:10000/goodybag')//config.mongoConnStr)

, onError = function(error, more){
    // Just throw for now
    console.log(error, more);
    throw error;
  }

, onComplete = function(){
    console.log('Finished');
    process.exit(0);
  }

, mapBusinessId = function(id) {
    return bizIdMap[id];
  }

, run = {
    consumers: function(client, callback){
      console.log("Consumers");
      var counter=0;
      mongoDB.unclaimedbarcodestatistics.distinct('barcodeId', function(error, unclaimedCardids) {
        if (error) return onError(error, 'on consumers find for mongo');
        unclaimedCardids = unclaimedCardids.slice(startOffset, startOffset+batchSize);
        var numUnclaimedCardids=unclaimedCardids.length;

        var handleNextCard = function() {
          console.log('---',++counter,'of',numUnclaimedCardids);
          var unclaimedCardId = unclaimedCardids.pop();
          if (!unclaimedCardId) return callback();

          var tryToFindConsumer = function() {
            db.api.users.findOne({ cardId:unclaimedCardId }, function(error, existingUser) {
              if (error) return onError(error, 'on user find for prod');

              if (existingUser)
                return handleNextCard(), console.log('SKIP', unclaimedCardId); // already exists, migrated by `migrate_registered_consumer.js`

              console.log('#', unclaimedCardId);

              db.procedures.registerUser('consumer', {cardId:unclaimedCardId}, function(error, result) {
                if (error) return onError(error, 'on consumer insert to prod');
                transferLoyalty(result);
              });
            });
          };
          var transferLoyalty = function(consumerRecord) {
            // get all the possible stats for the consumer
            mongoDB.unclaimedbarcodestatistics.find({ barcodeId:unclaimedCardId, 'org.type':'business' }).toArray(function(error, stats) {
                 if (error) return onError(error, 'on unclaimed stats find for mongo');
                console.log(stats);

                var mkAddPunchesFn = function (deltaPunches, businessId) {
                  return function(cb) {
                    console.log('^', businessId);
                    db.procedures.updateUserLoyaltyStats(client, tx, consumerRecord.id, businessId, deltaPunches, cb);
                  };
                };

                // build a list of punch additions to execute
                var punchAdds = [];
                stats.forEach(function(stat) {

                  if (!stat.data.karmaPoints) {
                    console.log('WARNING: no karmaPoints structure on: ', stat);
                    return;
                  }
                  
                  var karma = stat.data.karmaPoints.remaining;
                  var deltaPunches = Math.floor(karma / 10);
                  var businessId = mapBusinessId(stat.org.id);

                  if (!businessId) {
                    console.log('WARNING: Failed to map old business id to DB: '+stat.org.id);
                    return;
                  }

                  // add the punches one-at-a-time to make sure rewards and elite are correctly counted
                  for (var i = 0; i < deltaPunches; i++)
                    punchAdds.push(mkAddPunchesFn(1, businessId));
                });

                if (punchAdds.length === 0)
                  return finishConsumer();

                var tx = new Transaction(client);
                tx.begin(function() {

                  // run through the queue
                  var nextPunch = function(error) {
                    if (error)
                      return onError(error, 'on update stats to prod');
                    var fn = punchAdds.pop();
                    if (!fn)
                      return tx.commit(finishConsumer);
                    fn(nextPunch);
                  };
                  nextPunch();
                });
              });
            // });
          };
          var finishConsumer = handleNextCard;
          tryToFindConsumer();
        };
        db.getClient(function(err, client_) {
          client = client_;
          handleNextCard();
        });
      });
    }
  }
;

// Mongo Collections
mongoDB.consumers = mongoDB.collection('consumers');
mongoDB.statistics = mongoDB.collection('statistics');
mongoDB.unclaimedbarcodestatistics = mongoDB.collection('unclaimedbarcodestatistics');

module.exports = function(callback){

  // monkey-patch PG to output all queries
  var orgSubmitFn = pg.Query.prototype.submit;
  pg.Query.prototype.submit = function() {
    console.log(this.text, this.values);
    if (/^SELECT/i.test(this.text) === false) { // run selects as usual
      this.text = 'SELECT \'[THE RETURNED ID]\' as id, \'[THE RETURNED ID]\' as "userId"';
      this.values = [];
    }
    return orgSubmitFn.apply(this, arguments);
  };

  config.postgresConnStr = {
    database: 'd667o5g3bjinoe',
    host: 'ec2-54-235-145-50.compute-1.amazonaws.com',
    user: 'u31nsa8iqfv6ju',
    password: 'pakeoe34l0kuej41qpa64f3b3b8',
    port: 5442,
    ssl: true
  };

  pg.on('error', function(error) {
    console.log('PG ERRER', error);
  });

  console.log("Running batch, offset", startOffset, "batch size", batchSize);
  console.log("Connecting to postgres database");
  pg.connect(config.postgresConnStr, function(error, client){
    if (error) return onError(error);
    console.log('...connected', config.postgresConnStr);

    // Setup batch
    var
      batch = []
    , cb = function() {
        if (batch.length === 0) onComplete();
        else batch.pop().call(undefined, client, cb);
      }
    ;

    for (var key in run){
      batch.push(run[key]);
    }

    // Kick off!
    batch.pop().call(undefined, client, cb);
  });
};

// Application behavior
// (when run from the command-line, exec)
if (require.main === module) {
  module.exports  ();
}


var bizIdMap = { '50b3ca469bba7897000007e8': 2079,
  '50114cdcff1f6b4c1900009d': 2037,
  '4fb208f8271239270d000cf2': 2038,
  '50070f752c99c3da0c00012e': 2055,
  '5034f020c2d84d1e34000090': 2056,
  '4fb20903fbfffd290d000b42': 2057,
  '4f50abc23dc2c28c6c000086': 2058,
  '5007191f0cd1d77e100000ab': 1241,
  '4f5085ffe51d3c896c00009d': 1876,
  '4f4f95f0d0fa10886c00001e': 1284,
  '4f4fa625e51d3c896c000052': 1281,
  '500715200cd1d77e10000035': 1287,
  '500da993ad2f27db1600006a': 2078,
  '4f71d817858491c017000333': 2017,
  '4f592142a618eec004000059': 1328,
  '4f732d6df1d759c117000532': 1985,
  '500714cf0cd1d77e1000002e': 1999,
  '50d49434dd68ea020000002c': 1900,
  '4f71ca89cc09afc21700032e': 2020,
  '4f7b380da0b199650a000041': 2067,
  '50114c6fff1f6b4c1900007b': 2029,
  '51190bb02057930200000027': 1907,
  '50072980e9ef9e04120001b8': 2030,
  '4f733bcdcc09afc217000418': 2021,
  '5007170a0cd1d77e1000006a': 2074,
  '4ffc7b74aa034e9e00000078': 1923,
  '511551e06f35ae020000012e': 2022,
  '4fb20a06271239270d000d24': 2084,
  '4f5a4e6b3ed1e17e0c00006a': 2024,
  '4f86ae2a0f237f79210002ae': 2053,
  '4ff1afeac39fb76e0100002d': 1933,
  '4f86adf10f237f79210002ab': 2026,
  '4f508a14e9ac4c8a6c000067': 1441,
  '500718e50cd1d77e1000009d': 1974,
  '4fb20a99fbfffd290d000c4c': 2039,
  '4f5cee7d0151463317000016': 2027,
  '4ffc7a83aa034e9e0000006a': 2065,
  '5007142d0cd1d77e10000019': 1940,
  '4ff1aecdd9386caf00000094': 2014,
  '4fb208f2fbfffd290d000b30': 1945,
  '50114f18ff1f6b4c1900014c': 2011,
  '50114e9fff1f6b4c19000128': 1947,
  '50c0c84a23c617a200000071': 2031,
  '51190fcc2057930200000032': 1945,
  '4fb20906fbfffd290d000b46': 2028,
  '50072c1be9ef9e04120001dd': 1487,
  '4f672d98e7d8a2c0000000e2': 1990,
  '500718a30cd1d77e10000090': 363,
  '4ff1b292c39fb76e010000c0': 2076,
  '50114e22ff1f6b4c19000100': 2018,
  '501151adff1f6b4c19000275': 2082,
  '4f7c5599a0b199650a00011e': 326,
  '50070ebf2c99c3da0c000116': 2000,
  '4fb208fdfbfffd290d000b36': 309,
  '4fb20a94fbfffd290d000c44': 2089,
  '4f86af3e0f237f79210002b4': 1989,
  '4f7b9f2ea0b199650a0000f1': 1564,
  '4f7b396e27a8d8660a00003b': 2060,
  '50114affad2f27db1600042f': 247,
  '500727efe9ef9e0412000149': 209,
  '50f4909db8f55502000004fb': 2081,
  '4f90253dba0f9d9732000705': 1548,
  '4f79b2a13793d4be0000015b': 2066,
  '501152d3ff1f6b4c190002e0': 158,
  '50115357ff1f6b4c19000324': 158,
  '5011526bff1f6b4c190002b9': 158,
  '4ff1b31fc39fb76e010000d3': 1541,
  '4f980745653046a453000062': 1540,
  '50099f23e9ef9e0412000389': 1984,
  '4fb20a8212afd8280d000de6': 2001,
  '4ffc81a8aa034e9e00000115': 130,
  '500718640cd1d77e10000086': 2083,
  '50ca557b23c617a200000514': 1536,
  '500da7cdad2f27db16000024': 1988,
  '4ffc8430aa034e9e00000162': 1987,
  '500da747ad2f27db16000010': 1986,
  '500da88fad2f27db16000042': 78,
  '50b3ea1f9bba789700000812': 1973,
  '510994563f1ba7020000001a': 1972,
  '4fb20a09fbfffd290d000ba4': 1981,
  '4ffb51cb44b618b202000365': 1520,
  '4f507d0d3dc2c28c6c000053': 1980,
  '4f59208e278416bf04000042': 2071,
  '4fb20a88fbfffd290d000c31': 1979,
  '4ffaec6d44b618b20200022f': 2034,
  '5007147f0cd1d77e10000020': 1977,
  '4fb20a9812afd8280d000df7': 1517,
  '4f508499e51d3c896c00009a': 58,
  '4fb20a0afbfffd290d000ba6': 1971,
  '4f86aedc20fd8177210002d3': 2035,
  '4fb20a42271239270d000d53': 1970,
  '4ff1b48ac39fb76e01000115': 1969,
  '4ff1aef7d9386caf000000a6': 1968,
  '4f4fa738e9ac4c8a6c00002d': 1967,
  '4f7b36eb722bef670a000050': 365,
  '4f5ceffa015146331700001a': 374,
  '4ff6ff3b44b618b2020001d8': 2077,
  '4ffc8154aa034e9e0000010a': 2080,
  '4f5cef74455bf73417000010': 1991,
  '500da850ad2f27db16000038': 1193,
  '4ffb534344b618b202000385': 1186,
  '500716a20cd1d77e1000005d': 2015,
  '4f5083c1e9ac4c8a6c000057': 1167,
  '500715930cd1d77e10000044': 1159,
  '4f5cf108342d48311700003e': 1983,
  '50070b342c99c3da0c0000c0': 2046,
  '50c0afaa23c617a200000012': 2059,
  '4f843b9a20fd817721000060': 2045,
  '500715de0cd1d77e1000004c': 2044,
  '4f50a18be9ac4c8a6c00007b': 903,
  '4fb20a0bfbfffd290d000ba8': 1770,
  '50114d3bff1f6b4c190000c4': 2043,
  '4f86ae890f237f79210002b1': 2042,
  '50070f202c99c3da0c000121': 2041,
  '4fb209f9fbfffd290d000b92': 2040,
  '500da78dad2f27db1600001a': 2010,
  '500da8cbad2f27db1600004c': 2052,
  '4f5cf078342d483117000035': 582,
  '4f672d1384bd36c10000010e': 2004,
  '4f732e3b54e60ac317000435': 2005,
  '5009adbae9ef9e0412000521': 2006,
  '4fb20a91fbfffd290d000c3e': 1685,
  '4fb20a37271239270d000d4b': 2007,
  '4fb208e1fbfffd290d000b25': 2047,
  '50070e7a2c99c3da0c00010f': 2048,
  '5007273ee9ef9e04120000f4': 1709,
  '4ff1b3a6c39fb76e010000f9': 682,
  '4ffc794eaa034e9e0000004e': 2050,
  '4f90259b8f56e79432000918': 2051,
  '4f86ad6120fd8177210002ca': 730,
  '50b52e699bba78970000089d': 2075,
  '501149c4ad2f27db160003e2': 1982,
  '4f85dde00f237f79210001fc': 2016,
  '4fb208e4fbfffd290d000b2a': 1122,
  '4f7b9eb6722bef670a00015d': 2062,
  '4fb20a11271239270d000d29': 1836,
  '4f50959dd0fa10886c00007a': 1104,
  '50115089ff1f6b4c190001e5': 1829,
  '4f508152e51d3c896c00008d': 1828,
  '4fb20a33271239270d000d44': 1830,
  '4ffc7f71aa034e9e000000d5': 2025,
  '4f86ad380b9a077c21000356': 2013,
  '4ffc7d37aa034e9e000000a1': 2086,
  '4f677f9ce7d8a2bf000001d9': 2012,
  '4ff6f12344b618b2020001d1': 2033,
  '5007110bc0472e4b10000025': 1805,
  '4f843b1f0f237f7921000051': 1801,
  '4fb20a8efbfffd290d000c34': 1799,
  '50070bb72c99c3da0c0000d5': 966,
  '4ff1ae32d9386caf00000072': 2085,
  '5101a518c573870200000028': 1998,
  '50070a5b2c99c3da0c0000a8': 958,
  '511514296f35ae020000009c': 958,
  '50eb527db2a11402000000fb': 1794,
  '4ff318cda08b666a020000b7': 1791,
  '5007196c0cd1d77e100000b3': 1975,
  '5011520aff1f6b4c19000297': 1672,
  '50072cc6e9ef9e04120001e7': 2070,
  '4f86adc1f582b878210002f7': 2069,
  '501150dcff1f6b4c19000209': 1671,
  '5011514aff1f6b4c19000248': 1671,
  '4f86bc1f0f237f79210002be': 2068,
  '4ffb46aa44b618b2020002df': 1997,
  '4f86af06f582b878210002fd': 1996,
  '4ff31619f47975a601000133': 2023,
  '50114f7aff1f6b4c19000175': 1995,
  '4ff60c6c44b618b20200013c': 2019,
  '4ff30f6df47975a6010000d4': 1993,
  '4f5cef0f342d48311700002d': 1994,
  '50bcee13c2e97b9b00000456': 446,
  '501149d5ad2f27db160003e3': 2073,
  '4f7b9d43a0b199650a0000ea': 1614,
  '4fb20a1012afd8280d000d7f': 1610,
  '4ff1af98c39fb76e01000016': 75 };