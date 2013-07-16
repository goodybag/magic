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
              }

              // Partial Match
            , partial: {
                search_analyzer: 'prod_biz_name_analyzer'
              , index_analyzer:  'prod_biz_name_partial_analyzer'
              , type:            'string'
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
              }

              // Partial Match
            , partial: {
                search_analyzer: 'prod_biz_name_analyzer'
              , index_analyzer:  'prod_biz_name_partial_analyzer'
              , type:            'string'
              }
            }
          }
        }
      }
    }

  , settings: {
      analysis: {
        filter: {
          name_ngrams: {
            side:     'front'
          , max_gram:  50
          , min_gram:  2
          , type:     'edgeNGram'
          }

        , word_delimiter_2: {
            type: 'word_delimiter'
          , stem_english_possessive: false
          , catenate_all: true
          }

        , remove_singles: {
            type: 'length'
          , min:   2
          }
        }

      , char_filter: {
          remove_apostrophes: {
            type:     'mapping'
          , mappings: ["'=>"]
          }
        }

      , analyzer: {
          full_name: {
            type:       'custom'
          , tokenizer:  'standard'
          , filter: [
              'standard'
            , 'lowercase'
            , 'word_delimiter_2'
            , 'remove_singles'
            , 'asciifolding'
            ]
          }

        , partial_name: {
            type:       'custom'
          , tokenizer:  'standard'
          , filter: [
              'standard'
            , 'lowercase'
            , 'asciifolding'
            , 'word_delimiter_2'
            , 'remove_singles'
            , 'name_ngrams'
            ]
          }

        , my_analyzer: {
            type:     'snowball'
          , language: 'English'
          }

        , prod_biz_name_analyzer: {
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
            , 'name_ngrams'
            ]
          , char_filter: ['remove_apostrophes']
          }
        }
      }
    }
  }
});