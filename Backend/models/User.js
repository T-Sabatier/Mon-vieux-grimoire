const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },  // email unique
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator); // renvoie l'erreur si doublon

module.exports = mongoose.model('User', userSchema);