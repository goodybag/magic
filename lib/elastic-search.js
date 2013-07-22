var child   = require('child_process');
var config  = require('../config');
var Elastic = require('./elastic-client');

var elastic = module.exports = new Elastic({
  host:   config.elasticsearch.host
, port:   config.elasticsearch.port
, index:  config.elasticsearch.index

, indexProperties: {
    mappings: {
      product: {
        properties: {

          // Property: name
          //////////////////
          name: {
            type: 'multi_field'
          , fields: {

              // Name analyzer for full product name searching
              name: {
                type:     'string'
              , analyzer: 'prod_biz_name_analyzer'
              , boost:    10
              }

              // Partial Match
            , partial: {
                // analyzer: 'prod_biz_name_partial_analyzer'
                index_analyzer: 'prod_biz_name_partial_analyzer'
              , search_analyzer: 'prod_biz_name_analyzer'
              , type:     'string'
              }
            }
          }

          // Property: businessName
          //////////////////////////
        , businessName: {
            type: 'multi_field'
          , fields: {

              // Name analyzer for full business name searching
              businessName: {
                type:     'string'
              , analyzer: 'prod_biz_name_analyzer'
              , boost:    10
              }

              // Partial Match
            , partial: {
                // analyzer: 'prod_biz_name_partial_analyzer'
                index_analyzer: 'prod_biz_name_partial_analyzer'
              , search_analyzer: 'prod_biz_name_analyzer'
              , type:     'string'
              }
            }
          }
        }
      }
    }

  , settings: {
      analysis: {
        filter: {
          name_ngrams_front: {
            side:     'front'
          , max_gram:  12
          , min_gram:  2
          , type:     'edgeNGram'
          }

        , name_ngrams_back: {
            side:     'back'
          , max_gram:  12
          , min_gram:  2
          , type:     'edgeNGram'
          }
        }

      , char_filter: {
          remove_apostrophes: {
            type:     'mapping'
          , mappings: ["'=>"]
          }
        }

      , analyzer: {
          prod_biz_name_analyzer: {
            type:         'custom'
          , tokenizer:    'standard'
          , filter: [
              'standard'
            , 'lowercase'
            , 'asciifolding'
            ]
          , char_filter: ['remove_apostrophes']
          }

        , prod_biz_name_partial_analyzer: {
            type:         'custom'
          , tokenizer:    'standard'
          , filter: [
              'standard'
            , 'lowercase'
            , 'asciifolding'
            , 'name_ngrams_front'
            , 'name_ngrams_back'
            ]
          , char_filter: ['remove_apostrophes']
          }
        }
      }
    }
  }
});