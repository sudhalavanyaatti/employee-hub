let mongoose = require("mongoose");
let SChema = mongoose.Schema;
const User = new SChema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  category: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true }
});
const Users = mongoose.model("Details", User);
module.exports = Users;
