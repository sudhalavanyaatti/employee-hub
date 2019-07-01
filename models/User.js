let mongoose = require("mongoose");
let SChema = mongoose.Schema;
const User = new SChema({
  FullName: { type: String, required: true },
  Email: { type: String, unique: true },
  Password: { type: String, required: true },
  Category: { type: String, required: true },
  Phone: { type: String, required: true },
  Address: { type: String, required: true }
});
const Users = mongoose.model("Details", User);
module.exports = Users;
