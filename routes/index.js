const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
//const authy = require("authy")("ha8lM5Mj5JuCI6adHAPWWeEf7itHjWZJ");
const authy = require("authy")("u8E1R1Qm2NJeK6p2GawDhGREW4lYqJjX");
const events = require("events");
const fetch = require("node-fetch");
let crypto = require("crypto");
const jwt = require("jsonwebtoken");
const secret = "MnYusErVoE9eY4f";
//mail transfer
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);
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
router.post("/register", async (req, res) => {
  let mykey = await crypto.createCipher("aes-128-cbc", req.body.password);
  let mystr = await mykey.update(req.body.password, "utf8", "hex");
  mystr += await mykey.final("hex");
  req.body.password = mystr;
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
  console.log("body", req.body);
  let otp = req.body.otp;
  let phone = req.body.phone;
  authy
    .phones()
    .verification_check(phone, "+91", otp, (err, statusResponse) => {
      console.log("err", err);
      if (err) return err;
      console.log("status", statusResponse);
      if (statusResponse) {
        let data1 = { phone: req.body.phone };
        let data2 = { $set: { twilioStatus: "true" } };
        userController.findOneAndUpdate(data1, data2, (err, updateResult) => {
          if (err) throw err;
          console.log("update result", updateResult);
          if (updateResult.twilioStatus) {
            // Mailtransfer event FIRING
            eventEmitter.emit(
              "mailtransfer",
              updateResult.email,
              updateResult.fullName
            );
            console.log("hello", updateResult.email);
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
                Authorization: "Bearer fum2yrleTk1WX55gnFbXwn7hQPLU",
                "Content-Type": "application/json"
              }
            })
              .then(res => res.json())
              .then(response => {
                console.log("response", response);
                res.send(response);
              });
          }
        });
      }
    });
});
router.post("/login", (req, res) => {
  console.log("email", req.body.email);
  userController.findOne({ email: req.body.email }, (err, user) => {
    console.log("password", user.password);
    if (!user) {
      console.log("No user found");
    }
    let mykey = crypto.createDecipher("aes-128-cbc", req.body.password);
    let mystr = mykey.update(user.password, "hex", "utf8");

    mystr += mykey.final("utf8");
    console.log(mystr);

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
router.get("/auth2", async (req, res) => {
  const clientId = "0fb9cdf0-6668-48d8-90cf-215e4d393d59";
  const clientSecret = "vSB9bo18YvPj4NSDo4qQjA";
  const redirectURI = "http://localhost:3001/test";
  const baseURL = "https://api.cc.email/v3/idfed";
  const authURL =
    baseURL +
    "?client_id=" +
    clientId +
    "&scope=contact_data&response_type=token" +
    "&redirect_uri=" +
    redirectURI;
  res.redirect(authURL);
});
router.get("/test", (req, res) => {
  //console.log(req);
  //fum2yrleTk1WX55gnFbXwn7hQPLU
});
module.exports = router;
