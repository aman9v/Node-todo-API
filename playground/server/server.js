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

var app = express();

const port = process.env.PORT ;

app.use(bodyParser.json()); // .json() is returned that is used as middleware

app.post('/todos', (req, res) => { // callback can be a middleware function
  var todo = new Todo({
    text: req.body.text,
  });
  todo.save().then((todo) => {
     res.status(200).send(todo);
  }, (error) => {
    res.status(400).send(error);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((docs) => {
    res.status(200).send({docs}); // sending an object allows to add more properties to response like custom status codes.
  }, (error) => {
    res.status(400).send(error);
  });
});

app.get('/todos/:id', (req, res) => {
  var id = req.params.id; // params contains key value pairs

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then((doc) => { //success callback
    if (!doc) {
      return res.status(404).send();
    }
    res.send({doc});
  }).catch((e) => {
    res.status(400).send();
  });
}); // url parameters

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.sendStatus(404);
  }

  Todo.findByIdAndRemove(id).then((doc) => {
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
    return user.generateAuthToken();
    // res.send({doc});
  })
  .then((token) => { // token is the success argument from user.js file
    res.header('x-auth', token).send(user); // header takes key value pairs
  }) // x before - means a custom header, not necessarily a header that HTTP supports by default
  .catch((error) => res.status(400).send(error));
});

app.listen(port, () => {
  console.log(`Server up on port ${port}`);
});

module.exports = {app};
