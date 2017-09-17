// server.js is just going to be used for creating routes.
const express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

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
    res.send({docs}); // sending an object allows to add more properties to response like custom status codes.
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
    res.status(200).send({doc});
  }).catch((e) => {
    res.status(400).send();
  })
}) // url parameters


app.listen(3000, () => {
  console.log("Server up on port 3000");
})

module.exports = {app};
