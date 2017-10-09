/* jshint esversion:6 */

const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var data = {
  id : 19,
};

// this is the value sent back to the clien when they sign up or login
var token = jwt.sign(data, "123abc"); // creates hash and returns the token
console.log(token);

var decoded = jwt.verify(token + 1, '123abc');
console.log('decoded', decoded);

// var message = "I am a user";
// var hash = SHA256(message).toString();
//
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// var data = {
//   id: 4,
// };
//
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString(),
// };
//
// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data)).toString();
// // hash + some randomly generated value = salt; makes sure that data doesn't change
// var resultHash = SHA256(JSON.stringify(token.data) + "somesecret").toString();
//
// if (resultHash === token.hash) {
//   console.log("No change in data");
// } else {
//   console.log('there has been some change in data');
// }
