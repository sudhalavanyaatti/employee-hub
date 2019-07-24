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
  experience: {type: Number},
  join_date: {type: Date, default: Date.now},
  city: { type: String },
  state: { type: String },
  zip: { type: Number },
  profilePic: {type: String,default:'http://localhost:3001/images/default.jpg'}
});
const Users = mongoose.model("user", User);
module.exports = Users;
