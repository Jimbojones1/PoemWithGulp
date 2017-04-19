var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
 username: String,
 password: String,
 email: String,
 picture: String,
 poems: [{
  timestamp: String,
  poemers: [],
  poem: String
 }]
})





module.exports = mongoose.model('UserSchema', UserSchema)
