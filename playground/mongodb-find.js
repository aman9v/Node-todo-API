var {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('connected to server');

  // db.collection("Todos").find({}).count()
  // .then((count) => { // success callback for returned promise object
  //   console.log('Todos count:', count);
  // }, (error) => { // error callback
  //   console.log('Unable to fetch the objects', err);
  // });
  db.collection('Users').find({name: "Vishi"}).count().
    then((count) => {
      console.log(`User with name Aman: ${count}`);
    });
  // db.close();
});
