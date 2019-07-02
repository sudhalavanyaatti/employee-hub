const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authy = require("authy")("ha8lM5Mj5JuCI6adHAPWWeEf7itHjWZJ");
const events = require("events");
//mail transfer
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//mailtranfer event declaration
let eventEmitter = new events.EventEmitter();
let EventHandler = function mailtransfer(mail, name) {
  const msg = {
    to: mail,
    from: "sudhalova@gmail.com",
    template_id: "d-cebc2e244bd6424f8dec3a091f25ac8a",
    dynamic_template_data: {
      name: name
    }
  };
  sgMail.send(msg).then(function() {
    console.log("message send successfully!!");
  });
};
eventEmitter.on("mailtransfer", EventHandler);

router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});
router.get("/validate", (req, res, next) => {
  res.render("validate");
});
router.post("/register", (req, res) => {
  userController.create(req.body, (err, userResponse) => {
    if (err) throw err;
    //write twilio code here
    let phone = userResponse.phone;
    authy
      .phones()
      .verification_start(
        phone,
        "+91",
        { via: "sms", locale: "en", code_length: "6" },
        (err, otpResponse) => {
          if (err) throw err;
        }
      );
  });
  res.json({
    details: data
  });
});
router.post("/validate-otp", (req, res) => {
  let otp = req.body.otp;
  let phone = req.body.phone;
  authy
    .phones()
    .verification_check(phone, "+91", otp, (err, statusResponse) => {
      if (err) throw err;
      console.log(statusResponse);
      if (statusResponse) {
        let data1 = { phone: req.body.phone };
        let data2 = { $set: { twilioStatus: "true" } };
        userController.findOneAndUpdate(data1, data2, (err, updateResult) => {
          if (err) throw err;
          console.log(updateResult);
           // Mailtransfer event FIRING
        eventEmitter.emit("mailtransfer", updateResult.email, updateResult.fullName);
        });
      }
    });
});
module.exports = router;
