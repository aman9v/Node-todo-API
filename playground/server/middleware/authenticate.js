/*jshint esversion:6*/
const {User} = require('./../models/user');
var authenticate = function (req, res, next) { // this will be used as the middleware function to make routes private
  // the actual route will not going to run until next() is called inside the middleware function
  var token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject('Rejected Promise');
    }
    // res.send(user);
    // instead of sending response, we modify the req object so that every route recieves
    // a modified request inside the route
    req.user = user;
    req.token = token;
    next(); // without this the callback function for the route will never execute.
  }).catch((error) => { // error is the argument that is passed to the reject call inside of a promise
    // the findByToken will return a rejected promise. So, then() will
    // never execute but the catch block will.
    res.sendStatus(401); // authentication required i.e. HTTP 401
  });
};

module.exports.authenticate = authenticate;
