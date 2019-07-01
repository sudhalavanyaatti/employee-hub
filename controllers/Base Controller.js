class BaseController {
  constructor(model, name) {
    this.model = model;
    this.name = name;
  }
  create(params, callback) {
    this.model.create(params, function(err, dbNewObject) {
      if (err) {
        return callback(err);
      }

      return callback(null, dbNewObject);
    });
  }
}
module.exports = BaseController;
