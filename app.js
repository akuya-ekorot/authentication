//set up dotenv
require("dotenv").config();

//set up express
const express = require("express");
const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//set up ejs view engine
const ejs = require("ejs");
app.set("view engine", "ejs");

//set up session and passport
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//set up mongoose
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//handle req.secret deprecation warning from express-session
mongoose.set("useCreateIndex", true);

//mongoose schema and plugins
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

//mongoose model
const User = new mongoose.model("User", userSchema);

//passport strategy and de/serializa on the user model
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//home route
app
  .route("/")
  //get request
  .get((req, res) => {
    res.render("home");
  });

//register route
app
  .route("/register")
  //get request
  .get((req, res) => {
    res.render("register");
  })
  //post request
  .post((req, res) => {
    //register a user
    User.register(
      { username: req.body.username },
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          res.redirect("/login");
        } else {
          passport.authenticate("local")(req, res, () => {
            res.render("secrets");
          });
        }
      }
    );
  });

//login route
app
  .route("/login")
  //get request
  .get((req, res) => {
    res.render("login");
  })
  //post request
  .post((req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

    User.login(user, (err) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    });
  });

//secrets route
app
  .route("/secrets")
  //get request
  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render("secrets");
    } else {
      res.redirect("/login");
    }
  });

//logout route
app
  .route("/logout")
  //get request
  .get((req, res) => {
    req.logOut;
    res.redirect("/");
  });

//define port and listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
