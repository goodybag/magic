var
  setup = require('./setup-db')
// , importData = require('./import')

, onError = function(error){
    throw error;
  }
;

setup(function(error){
  if (error) return onError(error);
  console.log('complete!');
  process.exit(0);
});