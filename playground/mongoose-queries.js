const {ObjectID} = require('mongodb');
const {mongoose} = require("./server/db/mongoose");
const {Todo} = require("./server/models/todo");
const {User} = require("./server/models/user")
var id = '59bc1dcbd87b1406c4f08f2c'; // will throw a cast error if id isn't a valid one
//
// if (!ObjectID.isValid(id)) {
//   console.log("id not valid");
// }
//
// Todo.find({
//   _id: id,
// }).then((docs) => {
//   console.log('Todos', docs);
// });
//
// Todo.findOne({
//   _id: id,
// }).then((doc) => {
//   console.log('Todo', doc);
// });

// when id doesn't match any document in the database no error is thrown. Instead,
// null or empty array is returned. Consequently, having an error callback inside then()
// won't get executed as success callback has already exectued. So, we have to check for
// any error manually just like below
// Todo.findById(id).then((doc) => { // success callback
//   if (!doc) {
//     return console.log('Invalid id supplied')
//   }
//   console.log('Todo by Id', doc);
// }, (e) => {
//   console.log(e);
// });


Todo.findById({
  _id: id
}).then((doc) => {
  if (!doc) {
    return console.log('unable to find user');
  }
  console.log(JSON.stringify(doc, undefined, 2));
}, (error) => {
  console.log(error);
});
