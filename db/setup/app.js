var
  setup = require('./index')
// , importData = require('./import')

, onError = function(error){
    throw error;
  }
;

setup({ verbose:true }, function(error){
  if (error) return onError(error);
  console.log('complete!');
  process.exit(0);
});