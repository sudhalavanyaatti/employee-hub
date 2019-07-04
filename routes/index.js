const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authy = require("authy")("ha8lM5Mj5JuCI6adHAPWWeEf7itHjWZJ");
const events = require("events");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const secret = "MnYusErVoE9eY4f";

//mail transfer
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//mailtranfer event declaration
let eventEmitter = new events.EventEmitter();
let EventHandler = function mailtransfer(mail, name) {
  const msg = {
    to: mail,
    from: "sudhalova@gmail.com",
    template_id: "d-07430c527dce4e1d94938f446becb530",
    dynamic_template_data: {
      name: name
    }
  };
  sgMail.send(msg).then(function() {
    console.log("mail send successfully!!");
  });
};
eventEmitter.on("mailtransfer", EventHandler);

router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
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
          if (err) console.log(err);
          res.json({
            message: "success",
            response: otpResponse
          });
        }
      );
  });
});

router.post("/validate-otp", (req, res) => {
  console.log(req.body);
  let otp = req.body.otp;
  let phone = req.body.phone;
  authy
    .phones()
    .verification_check(phone, "+91", otp, (err, statusResponse) => {
      console.log(err);
      if (err) return err;
      console.log(statusResponse);
      if (statusResponse) {
        let data1 = { phone: req.body.phone };
        let data2 = { $set: { twilioStatus: "true" } };
        userController.findOneAndUpdate(data1, data2, (err, updateResult) => {
          if (err) throw err;
          console.log(updateResult);
          if (updateResult.twilioStatus) {
            // Mailtransfer event FIRING
            eventEmitter.emit(
              "mailtransfer",
              updateResult.email,
              updateResult.fullName
            );
            const data = {
              email_address: {
                address: updateResult.email,
                permission_to_send: "implicit"
              },
              create_source: "Account"
            };
            fetch("https://api.cc.email/v3/contacts", {
              method: "post",
              body: JSON.stringify(data),
              headers: {
                "cache-control": "no-cache",
                Authorization: "Bearer 5anDHuoU2mXhewL16yobo8fdHanV",
                "Content-Type": "application/json"
              }
            })
              .then(res => res.json())
              .then(response => {
                console.log(response);
                res.send(response);
              });
          }
        });
      }
    });
});
router.post("/login", (req, res) => {
  userController.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      console.log("No user found");
    }
    var token = jwt.sign({ id: user._id }, secret, {
      expiresIn: 86400
    });
    res.json({
      token: token,
      data: user
    });
  });
});
router.get("/details", (req, res) => {
  let token1 = req.headers["x-access-token"];

  if (!token1)
    return res.status(401).send({ auth: false, message: "No token provided." });
  jwt.verify(token1, secret, (err, data) => {
    if (err) {
      return res.send({ auth: false, message: "Token not matched" });
    }
    console.log(data);
    userController.findById(data.id, (err, details) => {
      console.log(details);
      res.json({
        details: details
      });
    });
  });
});

module.exports = router;
