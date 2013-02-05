module.exports = {
  'consumers.registered':
  function(consumer){
    console.log("Consumer registered!", consumer.id);
  }

, 'consumers.donation':
  function(consumer){
    console.log("Consumer donation!", consumer.id);
  }

, 'consumers.visit':
  function(consumer){
    console.log("Consumer visit!", consumer.id);
  }

, 'consumers.becameElite':
  function(consumer){
    console.log("Consumer becameElite!", consumer.id);
  }
};