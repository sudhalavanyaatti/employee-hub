let mongoose = require('mongoose');
let SChema = mongoose.Schema;
const User = new SChema({
  fullName: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  category: {type: String, required: true},
  phone: {type: String, unique: true, required: true},
  address: {type: String},
  twilioStatus: {type: Boolean, default: false},
  latitude: {type: Number},
  longitude: {type: Number},
  date_of_birth: {type: String},
  blood_Group: {type: String},
  language: {type: String},
  company_name: {type: String},
  experience: {type: Number},
  join_date: {type: Date, default: Date.now},
  gender: {type: String}
});
const Users = mongoose.model('user', User);
module.exports = Users;
