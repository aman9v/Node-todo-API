var mongoose = require('mongoose');
var Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    minlength: 1, // [value<NUMBER>, [custom erorr message]]
    trim: true // removes any leading or trailing whitespaces
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt:{
    type: Number,
    default: null,
  }
});

module.exports = {Todo};
