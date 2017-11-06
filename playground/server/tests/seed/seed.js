/*jshint esversion:6*/
const {ObjectID} = require('mongodb'); //mongodb is a driver for node.js
const jwt = require('jsonwebtoken');
const {Todo} = require("./../../models/todo");
const {User} = require("./../../models/user");


const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: "new@example.com",
  password: "onetimepass",
  tokens: [{
    access: 'auth',
    token: jwt.sign({
      _id: userOneId,
      access: 'auth',
    }, 'abc123').toString()
  }],
}, {
  _id: userTwoId,
  email: "jen@example.com",
  password: "secontimepass",
  tokens: [{
    access: 'auth',
    token: jwt.sign({
      _id: userTwoId,
      access: 'auth',
    }, 'abc123').toString()
  }]
}];

const todos = [{
  _id: new ObjectID(),
  text: "first todo",
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: "second todo",
  completed: true,
  completedAt: 3321,
  _creator: userTwoId
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos); // returning the promise returned by calling insertMany(todos)
  }).then(() => done()); // removes all documents from the database.
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save(); // saving causes the middleware to run.
    var userTwo = new User(users[1]).save();
    // Since save returns a promise,  userOne, userTwo are now promise objects.
    // Promise.all takes an array of promises and the then callback will not fire until all the promises
    // in the array resolve i.e. userOne and userTwo were successfully saved to the database.
    // So, by calling save we are calling middleware to make sure that hashed passwords are stored in the database
    // and use promise to wait for the save to complete.
    return Promise.all([userOne, userTwo]);
  }).then(() => done());
  };


module.exports = {todos, users, populateTodos, populateUsers};
