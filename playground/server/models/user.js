/*jshint esversion: 6 */
// each model maps to a collection in the database.
// calling save returns a Promise.
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs')

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

// The purpose of the toObject method is to convert the complex mongoose document into a simplified JavaScript object.
// It removes everything that's not part of the document such as mongoose methods/props. It's not needed in generateAuthToken because
// we do want to keep the full mongoose object around.

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
  }, process.env.JWT_SECRET).toString(); // returns a string token

// The second save call is not creating a new user, it's simply saving the updates to the current user.
// This is why we don't get an error about duplicate email addresses.
  user.tokens.push({access, token});
  return user.save().then(() => { // this return from the generateAuthToken function.
    // this returns a promise object which when resolved i.e. the success callback returns a token value as below.
    return token; // passed as the success argument for the next then call.
  }); // this return is from the resolved  prmoise
};

UserSchema.methods.removeToken = function(token) {
  // $pull operator is a mongoDB lets you remove an item that matches a certain criteria from an array
  var user = this;
  return user.update({
    $pull: { // takes an object that we want to pull from
// The $pull expression applies the condition to each element of the results array as though it were a top-level document.
      tokens: {token}
    }
  });
};
// we cannot add custom methods using the way we have done up above.
// So , we have to use schema for that.
// Model methods get called with Model as this binding
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded; //
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET); // throws an error if the token is invalid or does not match
  } catch (error) {
    // return new Promise((resolve, reject) => {
    //   reject();
    // }); // if this code runs, don't run the code just below it
    return Promise.reject(); // does the exact same thing as the code just above it.
  } // whatever is passed to reject will be passed to catch or error callback

// successfully decoded the token passed in the header
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth' // to query a nested document, we use key in quotes
  });
}; // anything added to statics object gets added as a Model method as opposed to an instance method

// return an object with promise or an error if the user doesn't exist
UserSchema.statics.findByCredentials = function(email, password) {
  var User = this;
  User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject(); // automatically triggers the catch call just below it.
    }
    return new Promise((resolve, reject)=> {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res === true) {
          resolve(user);
        } else {
          reject(); // triggers catch call inside of server.js
        }
      });
    });
  }).catch();
};

UserSchema.pre('save', function (next) { // pre save hook to hash password before saving it to the db.
  var user = this;

  if (user.isModified) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash; // password is just plain text.
        next();
      });
    });

  }
}); // function is used as we have to the this binding.


var User = mongoose.model('User', UserSchema);

module.exports = {User};
