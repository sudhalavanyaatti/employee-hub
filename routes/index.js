const express = require("express");
const fetch = require("node-fetch");
const constantContact = require("node-constantcontact");
const queryString = require("query-string");
const request = require("request");

var router = express.Router();
const Usermodel = require("../models/User");
// const cc = new constantContact({
//   apiKey: "rzk34aynvyhy33vtktyzj8hu",
//   accessToken: "8c05b166-af06-488d-80f8-0ed7a599c1d4"
// });

router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});
router.post("/register", function(req, res) {
  Usermodel.create(req.body, function(err, data) {
    if (err) {
      throw err;
    }
    console.log(data);
    //write twilio code here

    res.json({
      details: data
    });
  });
});

// var options = {
//   method: "GET",
//   url: "https://api.constantcontact.com/v2/account/verifiedemailaddresses",
//   qs: { status: "ALL", api_key: "rzk34aynvyhy33vtktyzj8hu" },
//   headers: {
//     "cache-control": "no-cache",
//     Authorization: "Bearer 612596bb-560f-459d-825f-2606c452fe0f"
//   }
// };

// request(options, function(error, response, body) {
//   if (error) throw new Error(error);

//   console.log(body);
// });

// fetch("https://api.constantcontact.com/v2/account/info", {
//   method: "GET",
//   queryString: { api_key: "rzk34aynvyhy33vtktyzj8hu", "": "" },
//   headers: {
//     Authorization: "Bearer 612596bb-560f-459d-825f-2606c452fe0f",
//     "cache-control": "no-cache"
//   }
// })
//   .then(res => res.json())
//   .then(data => console.log(data));
//  const contact = [{ email_address: "xcxcxcxccccc@gmail.com" }];

//   cc.contacts.create(
//     contact,
//     { action_by: "ACTION_BY_OWNER" },
//     (err, result) => {
//       if (err) {
//         throw err;
//       }
//       console.log(result);

//       res.json({
//         data: result
//       });
//     }
//   );
// });
// router.get("/find", function(req, res) {
//   cc.contacts.find({ email: "jayanthaditya1@gmail.com" }, (err, data) => {
//     if (err) {
//       console.log(err);
//     }
//     console.log(data);
//     res.json({
//       details: data
//     });
//   });
// });
// router.post("/constantcontact", (req, res) => {
//   contacts = req.body;
//   cc.contacts.create(
//     contacts,
//     { action_by: "ACTION_BY_OWNER" },
//     (err, data) => {
//       if (err) {
//         console.log(err);
//       }
//       console.log(data);
//       res.json({
//         contacts: data
//       });
//     }
//   );
// });

// router.get("/auth", (req, res) => {
//   // Create authorization URL
//   const baseURL = "https://api.cc.email/v3/idfed";
//   const authURL =
//     baseURL +
//     "?client_id=0fb9cdf0-6668-48d8-90cf-215e4d393d59&scope=contact_data&response_type=token&redirect_uri=http://localhost:3000/auth1";
//   fetch(authURL, {
//     method: "get"
//   }).then(response => {
//     console.log(response);
//     res.send(response);
//   });
// });

// router.get("/auth1", (req, res) => {
//   // Create authorization URL
//   console.log(req);
// });

router.post("/test", (req, res) => {
  fetch("https://api.cc.email/v3/contacts", {
    method: "post",
    body: JSON.stringify(req.body),
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
});

module.exports = router;
