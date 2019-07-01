var express = require("express");
var router = express.Router();
const Usermodel = require("../models/User");

router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});
router.post("/register", function(req, res) {
  Usermodel.create(req.body, function(err, data) {
    if (err) {
      console.log(err);
    }
    console.log(data);
    //write twilio code here
  });
  res.json({
    details: data
  });
});

module.exports = router;
