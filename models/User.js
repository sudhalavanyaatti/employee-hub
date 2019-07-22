let mongoose = require("mongoose");
let SChema = mongoose.Schema;
const User = new SChema({
  fullName: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  category: {type: String, required: true},
  phone: {type: String, unique: true, required: true},
  twilioStatus: {type: Boolean, default: false},
  latitude: {type: Number},
  longitude: {type: Number},
  date_of_birth: {type: String},
  blood_Group: {type: String,default: 'none'},
  language: {type: String,default: 'none'},
  company_name: {type: String,default: 'none'},
  experience: {type: Number},
  join_date: {type: Date, default: Date.now},
  gender: {type: String},
  city: { type: String },
  state: { type: String },
  zip: { type: Number },
  profilePic: {type: String,default:'Photo'}
});
const Users = mongoose.model("user", User);
module.exports = Users;
