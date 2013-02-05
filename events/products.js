module.exports = {
  'products.try':
  function(consumer){
    console.log("Consumer !", consumer.id);
  }

, 'products.like':
  function(consumer){
    console.log("Consumer donation!", consumer.id);
  }

, 'products.want':
  function(consumer){
    console.log("Consumer visit!", consumer.id);
  }
};