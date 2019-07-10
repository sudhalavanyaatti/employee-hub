let mongoose = require('mongoose');
let SChema = mongoose.Schema;
const User = new SChema({
  fullName: {type: String, required: true},
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  category: {type: String, required: true},
  phone: {type: String, unique: true, required: true},
  address: {type: String},
  twilioStatus: {type: Boolean, default: false},
  latitude:{type:Number},
  longitude:{type:Number}
});
const Users = mongoose.model('user', User);
module.exports = Users;
