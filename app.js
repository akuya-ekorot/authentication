//set up dotenv
require("dotenv").config();

//set up md5 hash
const md5 = require('md5');

//set up express
const express = require("express");
const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//set up ejs view engine
const ejs = require("ejs");
app.set("view engine", "ejs");

//set up mongoose and mongoose-encryption
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
////mongoose schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

////mongoose model
const User = new mongoose.model("User", userSchema);

//home page
app
  .route("/")
  //get request
  .get((req, res) => {
    res.render("home");
  });

//register page
app
  .route("/register")
  //get request
  .get((req, res) => {
    res.render("register");
  })
  //post request
  .post((req, res) => {
    const newUser = new User({
      email: req.body.username,
      password: md5(req.body.password),
    });

    newUser.save((err) => {
      if (err) {
        console.error(err);
      } else {
        res.render("secrets");
      }
    });
  });

//login page
app
  .route("/login")
  //get request
  .get((req, res) => {
    res.render("login");
  })
  //post request
  .post((req, res) => {
    //check if user exists
    User.findOne({ email: req.body.username }, (err, user) => {
      if (err) {
        console.error(err);
      } else {
        if (user) {
          if (user.password === md5(req.body.password)) {
            res.render("secrets");
          } else {
            res.send("Invalid password");
          }
        } else {
          res.send("No user found");
        }
      }
    });
  });

//define port and listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
