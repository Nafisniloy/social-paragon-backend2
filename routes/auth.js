// const { Router } = require('express');
// const { json } = require('express');
const express = require("express");
const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const XMLHttpRequest = require('xhr2');
const path= require("path");
const UserVerification= require("../models/userVerification");
const router = express.Router();
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();
let transporter= nodemailer.createTransport({
  service:"gmail",
  auth:{
    // user: 'niloynafis234@gmail.com',
    // pass: 'Niloynafis111',
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  }
})
transporter.verify(
  (error,success)=>{
    if (error) {
      console.log(error)
    }
    if (success) {
      console.log(success)
    }
  }
)
const { body, validationResult } = require("express-validator");
const bycript = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const userVerForPass = require("../models/userVerForPass");
const JWT_SECRET = "@itistopsecrettoken$";
// Route:1 create a user using post "/api/auth/createuser"/ No login required

router.post(
  "/createuser",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be longer then 6 characters").isLength({
      min: 6,
    }),
    body("name", "Please enter a valid name").isLength({ min: 3 }),
    body("gender", "Please select your gender").exists(),
    body("dateOfBirth", "Please enter your Date Of Birth").exists()
  ],
  async (req, res) => {
    //if there are errors return bad request and the errors
    const errors = validationResult(req);
    let success= false;
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }else{
    //check if a user with this email already exist

    try {
      let user = await User.findOne({ email: req.body.email });
      
      if (user) {
        // let user = await User.findOne({ email: req.body.email });
        // const userforverfication=await UserVerification.findOne({ userId: user.id })
        // const userId=await userforverfication.userId
        // console.log(userforverfication)
        // console.log(userId)
        // // const id= userforverfication.id
        // const verified= await user.verified
        // const expiresAt= await userforverfication.expiresAt
        // if (verified==="true") {
          if(user.verified==="true"){

            return res
              .status(400)
              .json({success, error: "Sorry! A user with this email id already exists" });
            
          }else{
            return res
              .status(400)
              .json({success, error: "Please check your inbox to verify your email" });
          }
        // } else {
        //   if (expiresAt<Date.now()) {   
        // await UserVerification.deleteOne({ userId: userId  })
        // await  User.findByIdAndDelete(userId)
        //       res.send('You have not verified your previous signup and your verification link hasbeen expired. Please signup again.')
        //   } else {
        //     res.send('Please check your email to get verification link')
        //   }

        // }
      } else {
        // create new user
        const salt = await bycript.genSalt(10);
        secPass = await bycript.hash(req.body.password, salt);
        user = await User.create({
          name: req.body.name,
          gender: req.body.gender,
          dateOfBirth: req.body.dateOfBirth,
          email: req.body.email,
          password: secPass,
          verified:"false",
        });
        const sendVerificationEmail= async(res)=>{
          const currentUrl= process.env.HOST;
          const user=await User.findOne({ email: { $eq: req.body.email } })
         const newuserId= user._id;
          const uniqueString= uuidv4();
          const newVerification = await new UserVerification({
            userUrl:`${currentUrl+'api/auth/user/verify/'+uniqueString}`,
            uniqueStringforuser:uniqueString,   
            userId:   newuserId,
            expiresAt: Date.now()+3600000
          })
         await newVerification.save();
          const userforverfication=await UserVerification.findOne({ uniqueStringforuser: { $eq: uniqueString } })
          
          const mailOptions={
            from: process.env.AUTH_EMAIL,
          to: req.body.email,
          subject:"Verify Your Email",
          html:`<p>Verify your email to login in to your account.</p><p>This link will <b>expire in one hour.</b></p><p>Press <a href=${currentUrl+'api/auth/user/verify/'+uniqueString+"/"+userforverfication._id}>Here</a> to proceed.</p>`
          }
          transporter.sendMail(mailOptions)
     
     
        }
        sendVerificationEmail();
        success=true;
        const data = {
          user: {
            id: user.id,
          },
        };
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({authtoken,success,
          message:
            `Congrats ${req.body.name}! Account created successfully.Please check your email to verify your account.`,
        });
      }
    } catch (error) {
      console.error(error.message);
      // res.status(500).send(success,"Something went wrong");
    }
  }}
);




//Route:2 verify user doesn't require login
router.get(`/user/verify/:uniqueString/:id`, async (req,res)=>{
  const { id ,uniqueString } = req.params;

  let docs = await UserVerification.findOne({ uniqueStringforuser: uniqueString });
  if  (!docs) {
    res.send('Verification cannotbe completed. Please check your email.')
} else {
  const newid=`${id}`
  if (newid.length===24) {
    const userforverfication=await UserVerification.findOne({ uniqueStringforuser: uniqueString })
const userId= `${userforverfication.userId}`;
const expiresAt= await userforverfication.expiresAt
    if(userforverfication.id===id){
      if (expiresAt<Date.now()) {
        
        await UserVerification.deleteOne({ uniqueStringforuser: uniqueString })
  await  User.findByIdAndDelete(userId)
        res.send('Your verification link hasbeen expired. Please signup again.')
      } else {
       
        await UserVerification.deleteOne({ uniqueStringforuser: uniqueString })
  await  User.findByIdAndUpdate(userId, { verified: 'true' })
        res.send('Your account is now verified')
        // var xhr = new XMLHttpRequest();
        // console.log(user.email)
        // console.log(userId)
      //   const currentUrl= process.env.HOST;
  
      //   xhr.open("POST", `${currentUrl+'api/auth/user/verified/'}`, true);
      //   xhr.setRequestHeader('Content-Type', 'application/json');
      //   xhr.send(JSON.stringify({
      //     id: userId
      // }));
      }
    }else{
   
      res.send('Verification cannotbe completed')
    }
  } else {
    
    res.send('Verification cannotbe completed. Please check your email.')
  }

}
})

//handle post request of verified user
// router.post( '/user/verified/', async(req,res)=>{
//   const id = req.body.id
// await  User.findByIdAndUpdate(id, { verified: 'true' })
//   const user=await User.findById(id)
//   console.log(user)
//   res.send('i am working')
// }
// )





// Route:3 authenticating a user using post "/api/auth/login"/ No login required
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
    // body("password","Password must be longer then 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    //if there are errors return bad request and the errors
    const errors = validationResult(req);
    let success= false;
    if (!errors.isEmpty()) {
      return res.status(400).json({success,errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        res
          .status(400)
          .json({success, error: "Please try to login with correct creditionals" });
      } else {
        const passwordCompare = await bycript.compare(password, user.password);
        if (!passwordCompare) {
          res
            .status(400)
            .json({success, error: "Please try to login with correct creditionals" });
        } else {
          // console.log(password)
          // console.log(user.password)
          // console.log(passwordCompare)
     if (user.verified==="true") {
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success= true;
      res.json({success, authtoken });
     }else{
      res
          .status(400)
          .json({success, error: "Please check your email to verify your account." });
     }

           
          
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send(success,"Internal server error : Something went wrong");
    }
  }
);




//Route4: Get logged in users details "/api/auth/getuser"/  login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
   let userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error : Something went wrong");
  }
});




//route5 change password

router.post("/user/updatepass",fetchuser,[body("password", "Password cannot be blank").exists(),],async (req,res)=>{
    let userId = req.user.id;
     const user = await User.findById(userId).select("password");
     const errors = validationResult(req);
     let success= false;
     if (!errors.isEmpty()) {
       return res.status(400).json({success,errors: errors.array() });
     }else{

      const {password, newPass, confirmNewPass } = await req.body;
      const passwordCompare = await bycript.compare(password, user.password);
      
      if (!passwordCompare) {
        res.status(400)
        .json({success, error: "Please input correct password" });
      } else{
        if(newPass===confirmNewPass){
          if (password===newPass) {
           
           res.status(400)
           .json({success, error: "Password cannot be same as old password" });
          
         } else {
           let success= true;
           const salt = await bycript.genSalt(10);
           const newsecPass =  `${await bycript.hash(newPass, salt)}`
          //  console.log(userId)
          //  console.log(newsecPass)
          //  console.log(password)
           await  User.findByIdAndUpdate(userId, { password: newsecPass })
           res.status(200).json({success, error: "Password updated successfully" });
          
         }
        }else{
          res
        
          .status(400)
          .json({success, error: "Please inpu same password in New password and Confirm password field" });
        }
      }
      
    }}
)


//route 6 post requestt doesntt require login 
router.post('/user/forgetpass',async(req,res)=>{
  const { email} = req.body;
  let success=false;
  let user = await User.findOne({ email });
  if (!user) {
    res
    .status(400)
    .json({success, error: "Please try to login with correct creditionals" });
  } else{
    const name= user.name;
    const sendVerificationEmail= async(res)=>{
      const currentUrl= process.env.HOST;
      // const user=await User.findOne({ email: { $eq: req.body.email } })
     const newuserId= user._id;
      const uniqueString= uuidv4();
      const newVerification = await new userVerForPass({
        uniqueStringforuser:uniqueString,   
        userName:name,
        verified:"flase",
        email:email,
        userId: newuserId,
        expiresAt: Date.now()+3600000
      })
     await newVerification.save();
      const userforverfication=await userVerForPass.findOne({ uniqueStringforuser: { $eq: uniqueString } })
      
      const mailOptions={
        from: process.env.AUTH_EMAIL,
      to: req.body.email,
      subject:"Verify Your Email",
      html:`<p>Verify your email to change the password of your account.</p><p>This link will <b>expire in one hour.</b></p><p>Press <a href=${currentUrl+'api/auth/user/forgetpass/verify/'+uniqueString+"/"+userforverfication._id}>Here</a> to proceed.</p>`
      }
    await  transporter.sendMail(mailOptions)
     
  }
 await sendVerificationEmail();
 success= true;
  res.status(200).json({success, error: "A verification link hasbeen send to your email account. Please check your email to verify your password." });

  }
})


// router7: verify if the user has correct verification link doesn't require login

  router.get(`/user/forgetpass/verify/:uniqueString/:id`, async (req,res)=>{
    const { id ,uniqueString } = req.params;
  let success=false;
    let docs = await userVerForPass.findOne({ uniqueStringforuser: uniqueString });
    if  (!docs) {
      res.status(400).json({success, error: "Verification cannotbe completed. Please check your email." });
    // })
  } else {
    const newid=`${id}`
    if (newid.length===24) {
      const userforverfication=await userVerForPass.findOne({ uniqueStringforuser: uniqueString })
  const userId= `${ userforverfication.userId}`;
  const expiresAt= await userforverfication.expiresAt
      if(userforverfication.id===id){
        if (expiresAt<Date.now()) {          
          await userVerForPass.deleteOne({ uniqueStringforuser: uniqueString })
          res.status(400).json({success, error: "Your verification link hasbeen expired. Please try again." });
          
        } else {
          success=true;
          const url=process.env.FRONTEND_URL
          await userVerForPass.deleteOne({ uniqueStringforuser: uniqueString })
          await  userVerForPass.findByIdAndUpdate(id, { verified: 'true' })
          res.redirect(`${url+"user/forgotpass/verified/"+userId}`)

        }
      }else{
        res.status(400).json({success, error: "Verification cannotbe completed. Please check your email." });
      }
    } else {
      res.status(400).json({success, error: "Verification cannotbe completed. Please check your email." });
    }
  
  }
  })
  


  //`/user/forgetpass/verify/:uniqueString/:id`
//Route8 change users forgotten password users are verified here
router.get(`/user/forgetpass/verified/:id`, async (req,res)=>{

})


module.exports = router;
