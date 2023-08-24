// 19f950bf51846033bd10caf2870ee3bf
// 28°36'43.9"N 77°25'31.2"E
const ejs = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const mongoose = require('mongoose');
const app = express();
const gamerNamer = require('gamer-namer');
const rn = require('random-number');
const session = require('express-session');
const flash = require('connect-flash');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-devansh:Devansh69@sharez.bnxxxos.mongodb.net/?retryWrites=true&w=majority");

const shareSchema = new mongoose.Schema({
  message: String,
  username: String,
  pin: String
});

const Share = mongoose.model("Share", shareSchema);

var options = {
  min: 100000,
  max: 999999,
  integer: true
}

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/create", function(req, res) {
  res.render("create");
});

app.get("/access", function(req, res) {
  res.render("access", {
    error: ""
  });
});

app.get("/share/:username/:pin", function(req, res) {
  // var action = req.body.action;
  var username = req.params.username;
  // var message = req.body.message;
  var pin = req.params.pin;

  Share.findOne({
    'username': username,
    'pin': pin
  }, function(err, share) {

    if (!err) {
      if (share) {
        res.render("share", {
          username: share.username,
          message: share.message,
          pin: share.pin
        });
      } else {
        res.render("home", {
          error: "Invalid Credentials!"
        });
      }
    } else {
      res.render("home", {
        error: "Invalid Credentials!"
      });
    }
  });
});


app.post("/share", function(req, res) {
  var action = req.body.action;
  var username = req.body.username;
  var message = req.body.message;
  var pin = req.body.pin;
  if (action == "delete") {
    Share.findOneAndDelete({
      'username': username,
      'pin': pin
    }, function(err) {
      if (!err) {
        res.redirect("/");
      }
    });
  } else if (action == "update") {
    Share.findOneAndUpdate({
      'username': username,
      'pin': pin
    }, {
      $set: {
        'message': message
      }
    }, function(err) {
      if (!err) {
        Share.findOne({
          'username': username,
          'pin': pin
        }, function(err, share) {

          if (!err) {
            if (share) {
              res.render("share", {
                username: share.username,
                message: share.message,
                pin: share.pin
              });
            } else {
              res.render("access");
            }
          } else {
            res.render("access");
          }
        });
      }
    });
  }
  else if(action=="download"){
    var text=message;
    res.setHeader('Content-type', "application/octet-stream");
    res.setHeader('Content-disposition', 'attachment; filename=file.txt');
    res.send(text);
  }
});

app.post("/create", function(req, res) {
  var message = req.body.message;
  var username = gamerNamer.generateName();
  var pin = rn(options);
  var url = "http://sharezbydevansh.herokuapp.com/share/"+username+"/"+pin;

  const shareDoc = new Share({
    message: message,
    username: username,
    pin: pin
  });


  shareDoc.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("confirmation", {
        username: username,
        pin: pin,
        url:url
      });
    }
  });
});


////////////////////////////////////////////////OLD/////////////////////////////

app.post("/access", function(req, res) {

  var username = req.body.username;
  var pin = req.body.pin;

  Share.findOne({
    'username': username,
    'pin': pin
  }, function(err, share) {

    if (!err) {
      if (share) {
        res.render("share", {
          username: share.username,
          message: share.message,
          pin: share.pin
        });
      } else {
        res.render("access", {
          error: "Invalid Credentials!"
        });
      }
    } else {
      res.render("access", {
        error: "Invalid Credentials!"
      });
    }
  });
});

////////////////////////////////////////////NEW/////////////////////////////////







app.listen(process.env.PORT || 3000, function() {
  console.log("CONNECTED AT 3000");
});
