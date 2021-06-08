require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
// const md5 = require("MD5");
const session = require("express-session");
const passport = require("passport");            // these 3 packages are used for session authentication
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static("public"));
app.listen("3000",function(){
  console.log("Server is running at port 3000...");
  console.log(process.env.API_KEY);
  console.log(process.env.SECRET);
})

app.use(session({
  secret:"ourLOngstringsecretisThis.#okOITDMIBDOITDBD",
  resave:false,
  saveUninitialized:false
}))    // use the session package
app.use(passport.initialize());  // use passport and inititalize it
app.use(passport.session());  // use passport for dealing with session

/////////// Mongoose Connections , Schemas, Models ////////////////////////////////////////
mongoose.connect("mongodb://localhost:27017/secretsDB",{urlNewUrlParser:true});
const userSchema = new mongoose.Schema({
  username:String,
  password:String
})

     /// **** Required when you are encrypting password using mongoose-encryption
// const secret="Thisisalongstringorwecansayencryptionkey";
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});  // converts password

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser()); // to store credentials in cookies.
passport.deserializeUser(User.deserializeUser()); // to fetch credentials from cookies

///////////////////////////// HTTP request verbs //////////////////////////////////////////////////////////
app.get("/",function(req,res){
  res.render("home");
})
app.get("/register",function(req,res){
  res.render("register");
})
app.get("/login",function(req,res){
  res.render("login");
})
app.get("/logout",function(req,res){
  // if you are using browser authentication authenticate
  req.logout();
  res.redirect("/");
})
app.get("/submit",function(req,res){
  res.render("submit");
})


////////////////////////// POST METHODS ///////////////////////
  //** When we are encrypting through hashing or mongoose-encryption
// app.post("/register",function(req,res){
//   const newUser = new User({
//     email:req.body.username,
//     password:md5(req.body.password)  // Hash function will convert the original password into Hash code , which isimpossible to decrypt
//   })
//   newUser.save(function(err){
//     if(err){
//       console.log("something went wrong");
//     }
//     else{
//       res.render("secrets");     // Note : we haven't created any separate app.get("/secrets")
//     }                           // , because we only want to access secret page when user is signed in.
//   })
// })
// app.post("/login",function(req,res){
//   const userEmail = req.body.username;
//   const userPass  = md5(req.body.password);
//
//   User.findOne({email:userEmail},function(err,foundUser){
//     if(err){
//       console.log("something went wrong");
//     }
//     else{
//       if(foundUser.password == userPass){
//         res.render("secrets");
//       }
//       else{
//         console.log("user does not exists");
//       }
//     }
//   })
// })

// ** using session to store user data in cookies so that we can authenticate user in browser itself
app.get("/secrets",function(req,res){
  // check if user is authenticate or not , means f the user is already loggeed in then we simply render the page.
  // but if they are not logged in then we have redirect to login page.
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else{
    res.redirect("/login");
  }

})
app.post("/register",function(req,res){
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate("local") (req,res,function(){
        res.redirect("/secrets");
      })
    }
  })
})
app.post("/login",function(req,res){
  const user = new User({
    username:req.body.username,
    password:req.body.password
  })

  req.login(user,function(err){
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local") (req,res,function(){
        res.redirect("/secrets");
      })
    }
  })
})
