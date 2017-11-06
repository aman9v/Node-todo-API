/*jshint esversion:6*/
const {User} = require('./../models/user');
var authenticate = function (req, res, next) { // this will be used as the middleware function to make routes private
  // the actual route is not going to run until next() is called inside the middleware function
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

// The end method is only used when we make a call with supertest. This is the method name they picked to allow us to attach a callback and do something with the err/response.
// The catch method is used when working with promises. Promises don't support end. Supertest doesn't support catch.
// If we need to run some custom code such as querying the database, a custom function will be passed to end. If we don't need to query the database, done can be used as the callback. It will get called with an error, if any.
// If there is no error, done will get called normally and the test will pass. If there is an error, done will be called with it and the test will fail.
