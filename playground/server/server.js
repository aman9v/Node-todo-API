/*jshint esversion: 6 */
// server.js is just going to be used for creating routes.

require('./config/config');

const _ = require('lodash');
const express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var authenticate = require('./middleware/authenticate').authenticate;
var app = express();

const port = process.env.PORT;

app.use(bodyParser.json()); // .json() is returned that is used as middleware

app.post('/todos', authenticate, (req, res) => { // callback can be a middleware function
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  todo.save().then((todo) => {
     res.status(200).send(todo);
  }, (error) => {
    res.status(400).send(error);
  });
});

//  making a route private is same as getting access to user and token properties of a request.
app.get('/todos', authenticate, (req, res) => {
  Todo.find({_creator: req.user._id}).then((docs) => {
    res.status(200).send({docs}); // sending an object allows to add more properties to response like custom status codes.
  }, (error) => {
    res.status(400).send(error);
  });
});

app.get('/todos/:id', authenticate,  (req, res) => {
  var id = req.params.id; // params contains key value pairs

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((doc) => { //success callback
    if (!doc) {
      return res.status(404).send();
    }
    res.send({doc});
  }).catch((e) => {
    res.status(400).send();
  });
}); // url parameters

app.delete('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.sendStatus(404);
  }

  Todo.findOneAndRemove({
    _id : id,
    _creator: req.user._id
  }).then((doc) => {
    if (!doc) {
      return res.sendStatus(404);
    }
    res.send({doc}); // passed with the same name "doc"
  }).catch((error) => {
    res.sendStatus(400);
  });
});

app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);
  // pick takes req.body and if text and completed exist, picks them up
  if (!ObjectID.isValid(id)) {
    return res.sendStatus(404);
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, { $set: body}, {new: true}).then((doc) => {
    if (!doc) {
      return res.sendStatus(404);
    }
    res.send({doc});
  }).catch((error) => res.sendStatus(400));
});

// model methods are called on Model object like Users and
// instance methods are called on model instance like user.
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  // User.findByToken(); // custom model method
  // user.genereteAuthToken // generates a token for every user document
  user.save().then((user) => {
    return user.generateAuthToken(); //this returns the token from the returned promise
    // res.send({doc});
  })
  .then((token) => { // token is the success argument from user.js file
    res.header('x-auth', token).send(user); // header takes key value pairs
  }) // x before - means a custom header, not necessarily a header that HTTP supports by default
  .catch((error) => res.status(400).send(error));
});

// we could break out the below code in a middleware function so that it's available for other routes
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post("/users/login", (req, res) => { // we don't use authenticate middleware as the whole purpose of this route is to get a new token.
  var body = _.pick(req.body, ['email', 'password']);
  res.send(body);
  User.findByCredentials(body.email, body.password).then((user) => { //this is where a new token is created in response to an http request
    res.send(user);
  }).catch((error) => {
    res.sendStatus(400);
  });
});

app.delete("/users/me/token", authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.sendStatus(200);
  }, (error) => {
    res.sendStatus(400);
  });
}); // delete token from the currently logged in user.

app.listen(port, () => {
  console.log(`Server up on port ${port}`);
});

module.exports = {app};
