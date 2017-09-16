// server.js is just going to be used for creating routes.
const express = require('express');
var bodyParser = require('body-parser');

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
     res.send(todo);
  }, (error) => {
    res.status(400).send(error);
  });
});



app.listen(3000, () => {
  console.log("Server up on port 3000");
})
