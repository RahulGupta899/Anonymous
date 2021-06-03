require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static("public"));
app.listen("3000",function(){
  console.log("Server is running at port 3000...");
  console.log(process.env.API_KEY);
  console.log(process.env.SECRET);
})

/////////// Mongoose Connections , Schemas, Models ////////////////////////////////////////
mongoose.connect("mongodb://localhost:27017/secretsDB",{urlNewUrlParser:true});
const userSchema = new mongoose.Schema({
  email:String,
  password:String
})

const secret="Thisisalongstringorwecansayencryptionkey";
userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});

const User = mongoose.model("User",userSchema);

///////////////////////////// HTTP request verbs //////////////////////////////////////////////////////////


app.get("/",function(req,res){
  res.render("home");
})

app.get("/register",function(req,res){
  res.render("register");
})
app.post("/register",function(req,res){
  const newUser = new User({
    email:req.body.username,
    password:req.body.password
  })
  newUser.save(function(err){
    if(err){
      console.log("something went wrong");
    }
    else{
      res.render("secrets");     // Note : we haven't created any separate app.get("/secrets")
    }                           // , because we only want to access secret page when user is signed in.
  })
})

app.get("/login",function(req,res){
  res.render("login");
})
app.post("/login",function(req,res){
  const userEmail = req.body.username;
  const userPass  = req.body.password;

  User.findOne({email:userEmail},function(err,foundUser){
    if(err){
      console.log("something went wrong");
    }
    else{
      if(foundUser.password == userPass){
        res.render("secrets");
      }
      else{
        console.log("user does not exists");
      }
    }
  })
})

app.get("/logout",function(req,res){
  res.redirect("/");
})

app.get("/submit",function(req,res){
  res.render("submit");
})
