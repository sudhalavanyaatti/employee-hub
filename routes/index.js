const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authy = require('authy')('ha8lM5Mj5JuCI6adHAPWWeEf7itHjWZJ');

router.get('/', (req, res, next) => {
  res.render('index', {title: 'Express'});
});
router.get('/validate', (req, res, next) => {
  res.render('validate');
});
router.post('/register', (req, res) => {
  userController.create(req.body, (err, userResponse) => {
    if (err) throw err;
    //write twilio code here
    let phone = userResponse.phone;
    authy
      .phones()
      .verification_start(
        phone,
        '+91',
        {via: 'sms', locale: 'en', code_length: '6'},
        (err, otpResponse) => {
          if (err) throw err;
        }
      );
  });
  res.json({
    details: data
  });
});
router.post('/validate-otp', (req, res) => {
  let otp = req.body.otp;
  let phone = req.body.phone;
  authy
    .phones()
    .verification_check(phone, '+91', otp, (err, statusResponse) => {
      if (err) throw err;
      console.log(statusResponse);
      if (statusResponse) {
        let data1 = {phone: req.body.phone};
        let data2 = {$set: {twilioStatus: 'true'}};
        userController.findOneAndUpdate(data1, data2, (err, updateResult) => {
          if (err) throw err;
        });
      }
    });
});
module.exports = router;
