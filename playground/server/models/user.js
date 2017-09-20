/*jshint esversion: 6 */
// each model maps to a collection in the database.
// calling save returns a Promise.
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

// each schema maps to a mongoDB collection and defines the shape of the documents
// within that collection.
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true, // doesn't allow duplicate email
    validate: {
      isAsync: false,
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email"
      },
    },
  password: {
      type: String,
      required: true,
      minlength: 6,
    },
  tokens: [{
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    }]
});

// controls what is sent back when a Mongoose Model is converted to JSON
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject(); // converts a mongoose variable(user) and converts it to
  // a regular object that stores
  // all the proerties that are available inside a user document
  return _.pick(userObject, ['_id', 'email']);
};

// ES6 methods are not used here as these don't bind the this keyword
// So, the function will have access to the document.
UserSchema.methods.generateAuthToken = function () {
  var user = this; // points to the document the method was called on. i.e "user" and Not User
  var access = 'auth';
  var token = jwt.sign({
    _id: user._id.toHexString(),
    access,
  }, 'abc123').toString(); // returns a string token

  user.tokens.push({access, token});
  return user.save().then(() => { // this return from the generateAuthToken function.
    return token; // passed as the success argument for the next then call.
  }); // this return is from the resolved  prmoise
};
// we cannot add custom methods using the way we have done up above.
// So , we have to use schema for that.
var User = mongoose.model('User', UserSchema);

module.exports = {User};
