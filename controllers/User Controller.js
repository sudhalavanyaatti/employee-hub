const BaseController = require("./Base Controller");
const UserModel = require("../models/User");
class User extends BaseController {
  constructor() {
    super(UserModel, User);
  }
}
module.exports = new Login();
