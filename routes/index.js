const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController');
const authy = require('authy')('onS7TJBOgOzEBMWagLWwuVqHuxx4vMAr');
//const authy = require('authy')('TT1FIbNDt6DnbSvZeKNG1nMcpeiTEBWn');
const multer = require('multer');
const events = require('events');
let crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = 'MnYusErVoE9eY4f';
//mail transfer
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({storage: storage}).single('profilePic');

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
  
  });
};
eventEmitter.on('mailtransfer', EventHandler);

router.post('/register', async (req, res) => {
  let mykey = await crypto.createCipher('aes-128-cbc', 'd6F3Efeq');
  let mystr = await mykey.update(req.body.password, 'utf8', 'hex');
  mystr += await mykey.final('hex');
  req.body.password = mystr;
  userController.create(req.body, (err, userResponse) => {
    if (err) {
      return res.send({response: err});
    }
    //write twilio code here
    let phone = userResponse.phone;
    authy
      .phones()
      .verification_start(
        phone,
        "+91",
        { via: "sms", locale: "en", code_length: "6" },
        (err, otpResponse) => {
          if (err) {
            return res.send({response: err});
          }
          res.send({
            response: otpResponse
          });
          
        }
      );
  });
});
router.post("/validate-otp", (req, res) => {
  //console.log("body", req.body);
  let otp = req.body.otp;
  let phone = req.body.phone;
  authy
    .phones()
    .verification_check(phone, '+91', otp, (err, statusResponse) => {
      if (err) {
        return res.send({response: err});
      }
      res.send({
        response: statusResponse
      });
      if (statusResponse) {
        let data1 = { phone: req.body.phone };
        let data2 = { $set: { twilioStatus: "true" } };
        userController.findOneAndUpdate(data1, data2, (err, updateResult) => {
          if (err) throw err;
          //console.log("update result", updateResult);
          if (updateResult.twilioStatus) {
            // Mailtransfer event FIRING
            eventEmitter.emit(
              "mailtransfer",
              updateResult.email,
              updateResult.fullName
            );
            //console.log('hello', updateResult.email);
            // const data = {
            //   email_address: {
            //     address: updateResult.email,
            //     permission_to_send: 'implicit'
            //   },
            //   create_source: 'Account'
            // };
            // fetch('https://api.cc.email/v3/contacts', {
            //   method: 'post',
            //   body: JSON.stringify(data),
            //   headers: {
            //     'cache-control': 'no-cache',
            //     Authorization: 'Bearer fum2yrleTk1WX55gnFbXwn7hQPLU',
            //     'Content-Type': 'application/json'
            //   }
            // })
            // .then(res => res.json())
            // .then(response => {
            //   res.send({response: response, otpResponse: statusResponse});
            //   //res.send(response);
            // })
            // .catch(err => {
            //   console.log('err123', err);
            // });
          }
        });
      }
    });
});
router.post('/login', (req, res) => {
  userController.findOne({phone: req.body.phone}, (err, user) => {
    if (err) console.log(err);
    if (!user) {
      console.log('No user found');
      res.json({
        data: user
      });
    } else {
      let mykey = crypto.createCipher('aes-128-cbc', 'd6F3Efeq');
      let mystr = mykey.update(req.body.password, 'utf8', 'hex');
      mystr += mykey.final('hex');
      if (mystr === user.password) {
        if (user.twilioStatus) {
          let token = jwt.sign({id: user._id}, secret, {
            expiresIn: 86400
          });
          res.json({
            token: token,
            data: user
          });
        } else {
          res.json({
            data: 'statusFalse'
          });
        }
      } else {
        res.json({
          data: 'incorrect'
        });
      }
    }
  });
});

router.get("/details", (req, res) => {
  userController.find({}, (err, details) => {
    res.json({
      details: details
    });
  });
});

router.get('/auth2', async (req, res) => {
  const clientId = '0fb9cdf0-6668-48d8-90cf-215e4d393d59';
  const clientSecret = 'vSB9bo18YvPj4NSDo4qQjA';
  const redirectURI = 'http://localhost:3001/test';
  const baseURL = 'https://api.cc.email/v3/idfed';
  const authURL =
    baseURL +
    "?client_id=" +
    clientId +
    "&scope=contact_data&response_type=token" +
    "&redirect_uri=" +
    redirectURI;
  res.redirect(authURL);
});
router.post('/forgot-password', (req, res) => {
  userController.findOne({phone: req.body.phone}, async (err, user) => {
    console.log(user);
    if (user) {
      let phone = req.body.phone;
      authy
        .phones()
        .verification_start(
          phone,
          '+91',
          {via: 'sms', locale: 'en', code_length: '6'},
          (err, passwordOtpResponse) => {
            if (err){
              return res.send({response: err});
            }
            res.send({
              response: passwordOtpResponse
            });
          }
        );
    } else {
      res.send({
        response: 'null'
      });
    }
  });
});

router.post('/update-number', (req, res) => {
  userController.findOne({phone: req.body.phone}, (err, user) => {
    if (!user) {
      let phone = req.body.phone;
      authy
        .phones()
        .verification_start(
          phone,
          '+91',
          {via: 'sms', locale: 'en', code_length: '6'},
          (err, updatedNumberResponse) => {
            if (err) {
              return res.send({response: err});
            }
            res.send({
              response: updatedNumberResponse
            });
          }
        );
    } else {
      res.send({
        response: 'null'
      });
    }
  });
});

router.post('/updateNumber-OtpVal', (req, res) => {
  
  let otp = req.body.otp;
  let phone = req.body.phone;
  authy.phones().verification_check(phone, '+91', otp, (err, numOtpResult) => {
    if (err) {
      return res.send({response: err});
    }
    if (numOtpResult) {
      let data = {_id: req.body.id};
      let data1 = {$set: {phone: req.body.phone}};
      userController.findOneAndUpdate(data, data1, (err, numUpdateResult) => {
        if (err) {
          return res.send({response: err});
        }
      });
    }
    res.json({
      response: numOtpResult
    });
  });
});
router.post('/password-OtpVal', (req, res) => {
  let otp = req.body.otp;
  let phone = req.body.phone;
  authy
    .phones()
    .verification_check(phone, '+91', otp, (err, passOtpResponse) => {
      if (err) {
        return res.send({response: err});
      }
      res.json({
        response: passOtpResponse
      });
      
    });
});
router.post('/update-password', async (req, res) => {
  let pass = req.body.confirmPassword;
  let mykey = await crypto.createCipher('aes-128-cbc', 'd6F3Efeq');
  let mystr = await mykey.update(pass, 'utf8', 'hex');
  mystr += await mykey.final('hex');

  let phone1 = req.body.phone;
  let data1 = {phone: phone1};
  let data2 = {$set: {password: mystr}};
  userController.findOneAndUpdate(data1, data2, (err, passwordUpdateResult) => {
    if (err) {
      return res.send({response: err});
    }
    res.send({
      response: passwordUpdateResult
    });
  });
});
router.post('/profile', (req, res) => {
  let token = req.body.token;
  let decoded = jwt.verify(token, secret);
  userController.findOne({_id: decoded.id}, (err, user) => {
    if (err) {
      return res.send({data: err});
    }
    res.send({
      data: user
    });
  });
});
router.post('/update-details', (req, res) => {
  let data = req.body.id;
  let data1 = req.body;
  
  userController.findByIdAndUpdate(data, data1, (err, updatedUser) => {
    if (err){
      return res.send({data: err});
    }
    res.send({
      data: updatedUser
    });
  });
});
router.post('/update-photo', (req, res) => {
  upload(req, res, err => {
    let data1 = {_id: req.body.id};
    let data2 = {
      $set: {profilePic: 'http://localhost:3001/images/' + req.file.filename}
    };
    userController.findOneAndUpdate(data1, data2, (err, updatedPhoto) => {
      if (err) {
        return res.send({data: err});
      }
      res.send({
        data: updatedPhoto
      });
    });
  });
});
router.post('/resend-otp', (req, res) => {
  let phone = req.body.phone;
  authy
    .phones()
    .verification_start(
      phone,
      '+91',
      {via: 'sms', locale: 'en', code_length: '6'},
      (err, passwordOtpResponse) => {
        if (err) {
          return res.send({
            response: err
          });
        }
        res.send({
          response: passwordOtpResponse
        });
      }
    );
});
router.post('/dec-password',(req, res) => {
  let mykey = crypto.createCipher('aes-128-cbc', 'd6F3Efeq');
      let mystr = mykey.update(req.body.password, 'utf8', 'hex');
      mystr += mykey.final('hex');
    res.send({
      data: mystr
    });
});
module.exports = router;
