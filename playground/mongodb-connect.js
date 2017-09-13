// var MongoClient = require('mongodb').MongoClient;
// creates a new variable MongoClient, setting it equal to MongoClient property of mongodb
var {MongoClient, ObjectID} = require('mongodb');
// const expect = require('expect');
// ES6 destructuring creates new variables from object properties.
// var user = {name: "Aman", age: 23 };
// var {name} = user;
// var obj = new ObjectID(); // using this we can inject object id wherever we like.
// console.log(obj)

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {

  if (err){
    return console.log("Unable to connect to MongoDB server");
  } // return is used to prevent the rest of the program from executing.
  console.log('connected to MongoDB server');

  // db.collection('Todos').insertOne({
  //   text: "Something to do",
  //   completed: false,
  // }, (err, res) => {
  //   if (err) {
  //     return console.log('Unable to insert the document');
  //   }
  //   console.log(JSON.stringify(res.ops, undefined, 2));
  // })
  // db.collection('Users').insertOne({
  //   name: "Aman",
  //   age: 25,
  //   location: 'Mumbai',
  // }, (err, res) => {
  //   if (err) {
  //     return console.log("Error creating a new document");
  //   }
  //   console.log(JSON.stringify(res.ops[0]._id.getTimestamp(), undefined, 2));
  // });

//deleting by id

  db.collection('Users').findOneAndDelete({_id: new ObjectID("59b8454f1541b40b519954f7")})
    .then((result) => {
      console.log(result);
    });


  // db.collection("Todos").findOneAndDelete({completed: false})
  //   .then((result) => {
  //     console.log(result);
  //   });

  // db.close();
});
