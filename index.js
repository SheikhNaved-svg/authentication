import express from "express";
import ejs from "ejs";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
//import authenticate from "./middleware/middleware.js";
import mongoose from "mongoose";
import Signup from "./models/user.js";
import jwt from "jsonwebtoken";
const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(cookieParser());

mongoose
  .connect("mongodb://127.0.0.1:27017/formDB")
  .then(() => {
    console.log("db connected");
  })
  .then((error) => {
    console.log("error:", error);
  });

  const authenticate= async (req,res,next)=>{
    const {token}=req.cookies;
    if(token){
        const decode=jwt.verify(token,'passkey')
        req.user= await Signup.findById(decode._id)
        next();
    }
    else{
        res.render('login')
    }
}

//middleware
app.get("/", authenticate, (req, res) => {
    
  res.render("logout" ,{name:req.user.name});
});

app.post('/register',async (req,res)=>{
    const {name,email,password}=req.body;

    const user= await Signup.findOne({email});
    if(user){
      return  res.send('user already register')
    }
    await Signup.create({
        name,
        email,
        password
    })
    res.redirect('/')
})


app.get('/register' ,(req,res)=>{
    res.render('register')
})
//post request to login
app.post("/login", async (req, res) => {
  const { name, email, password } = req.body;
  let user= await Signup.findOne({email})
  if(!user){
    return res.render('register')
  }
  
  const ismatch= password===user.password;

  if(!ismatch){
    return res.render('login',{email,message:"inccorect password"})
  }
    
      const token = jwt.sign({ _id: user._id }, "passkey");
    
      res.cookie("token", token, { httpOnly: true });
    
  
  

  res.redirect("/");
});

//get request for logout
app.get("/logout", (req, res) => {
  res.cookie("token", null, { httpOnly: true, expires: new Date(Date.now()) });
  res.redirect("/");
});

//port listen
app.listen(port, (req, res) => {
  console.log("hey list server at port : 4000");
});
