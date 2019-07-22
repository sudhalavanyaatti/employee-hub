class BaseController {
  constructor(model, name) {
    this.model = model;
    this.name = name;
  }
  create(params, callback) {
    this.model.create(params, (err, dbNewObject) => {
      if (err) {
        return callback(err);
      }

      return callback(null, dbNewObject);
    });
  }
  findOneAndUpdate(data1, data2, callback) {
    this.model.findOneAndUpdate(
      data1,
      data2,
      { new: true },
      (err, dbNewObject) => {
        if (err) {
          return callback(err);
        }
        return callback(null, dbNewObject);
      }
    );
  }
  findByIdAndUpdate(data, data1, callback) {
    this.model.findByIdAndUpdate(
      data,
      data1,
      {new: true},
      (err, dbNewObject) => {
        if (err) {
          return callback(err);
        }
        return callback(null, dbNewObject);
      }
    );
  }
  findOne(params, callback) {
    this.model.findOne(params, (err, dbNewObject) => {
      if (err) {
        return callback(err);
      }

      return callback(null, dbNewObject);
    });
  }
  findById(params, callback) {
    this.model.findById(params, (err, dbNewObject) => {
      if (err) {
        return callback(err);
      }
      return callback(null, dbNewObject);
    });
  }

  find(params, callback) {
    this.model.find(params, (err, dbNewObject) => {
      if (err) {
        return callback(err);
      }
      return callback(null, dbNewObject);
    });
  }
}
module.exports = BaseController;
