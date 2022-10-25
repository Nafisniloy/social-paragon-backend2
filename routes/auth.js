// const { Router } = require('express');
// const { json } = require('express');
const express = require("express");
const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const XMLHttpRequest = require("xhr2");
const path = require("path");
const UserVerification = require("../models/userVerification");
const router = express.Router();
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // user: 'niloynafis234@gmail.com',
    // pass: 'Niloynafis111',
    user: "mdabunafisniloy@gmail.com",
    pass: "jlwmnuqvhzmvwmxe",
    // pass: "process.env.AUTH_PASS",
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  }
  if (success) {
    console.log(success);
  }
});
const { body, validationResult } = require("express-validator");
const bycript = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const userVerForPass = require("../models/userVerForPass");
const profileSchema = require("../models/Profile");
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
    body("dateOfBirth", "Please enter your Date Of Birth").exists(),
  ],
  async (req, res) => {
    //if there are errors return bad request and the errors
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    } else {
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
          if (user.verified === "true") {
            return res
              .status(400)
              .json({
                success,
                error: "Sorry! A user with this email id already exists",
              });
          } else {
            return res
              .status(400)
              .json({
                success,
                error: "Please check your inbox to verify your email",
              });
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
            verified: "false",
          });
          
          const sendVerificationEmail = async (res) => {
            const currentUrl = process.env.HOST;
            const user = await User.findOne({ email: { $eq: req.body.email } });
            const newuserId = user._id;
            await profileSchema.create({userId: newuserId,  userName: user.name });
            const uniqueString = uuidv4();
            const newVerification = await new UserVerification({
              uniqueStringforuser: uniqueString,
              userId: newuserId,
              expiresAt: Date.now() + 3600000,
            });
            await newVerification.save();
            const userforverfication = await UserVerification.findOne({
              uniqueStringforuser: { $eq: uniqueString },
            });

            const mailOptions = {
              from: process.env.AUTH_EMAIL,
              to: req.body.email,
              subject: "Social Paragon : Verify your email",
              html: `<div text-align: center; align-items: center;  justify-content: center; ">  
          <h3>Please verify your email to login in to your account.</h3>
          <img src="https://lh3.googleusercontent.com/drive-viewer/AJc5JmQ_WFy-rf9RY3sa7EzEwJVeho2iaS_2DL8nkGxt-_3zAkY_8jtFW5-l-gy149I3zn-MbanlUtw=w2640-h1828" alt="Social Paragon"style="    width: 45%;
              margin:auto;
              margin-top: 15px;">
          <p style="font-weight: bold;">This link will expire in one hour</p>
          <a style="  color: rgb(255, 255, 255);
          border: 2px solid gray;
          border-radius: 15px;
          padding: 6px 6px;
          background-color: rgb(75, 182, 43);
          text-decoration: none;" href=${
            "https://paragon.learnfacts.xyz/user/verify/account/?str=" +
            uniqueString +
            "&id=" +
            userforverfication.userId
          } >Verify</a>
        
          </div>`,
            };
            await transporter.sendMail(mailOptions);
          };
          await sendVerificationEmail();
          success = true;
          const data = {
            user: {
              id: user.id,
            },
          };
          const authtoken = jwt.sign(data, JWT_SECRET);
          res.json({
            authtoken,
            success,
            message: `Congrats ${req.body.name}! Account created successfully.Please check your email to verify your account.`,
          });
        }
      } catch (error) {
        console.error(error.message);
        // res.status(500).send(success,"Something went wrong");
      }
    }
  }
);

//Route:2 verify user doesn't require login
router.get(`/user/verify/:uniqueString/:id`, async (req, res) => {
  const { id, uniqueString } = req.params;
  let success = null;

  // const user= await  User.findById(userId)
  const data = {
    user: {
      id: id,
    },
  };
  const authtoken = jwt.sign(data, JWT_SECRET);

  let docs = await UserVerification.findOne({
    uniqueStringforuser: uniqueString,
  });
  if (!docs) {
    res.json({
      success,
      message: "Verification cannotbe completed. Please check your email.",
    });
  } else {
    const newid = `${id}`;
    if (newid.length === 24) {
      const userforverfication = await UserVerification.findOne({
        uniqueStringforuser: uniqueString,
      });
      const userId = `${userforverfication.userId}`;
      const expiresAt = await userforverfication.expiresAt;
      if (userId === id) {
        if (expiresAt < Date.now()) {
          await UserVerification.deleteOne({
            uniqueStringforuser: uniqueString,
          });
          await User.findByIdAndDelete(userId);
          res.json({
            success,
            message:
              "Your verification link has been expired. Please signup again.",
          });
        } else {
          await UserVerification.deleteOne({
            uniqueStringforuser: uniqueString,
          });
          await User.findByIdAndUpdate(userId, { verified: "true" });
          success = true;
          res.json({
            success,
            authtoken,
            message: "Your account is now verified",
          });
        }
      } else {
        res.json({ success, message: "Verification cannotbe completed" });
      }
    } else {
      res.json({
        success,
        message: "Verification cannotbe completed. Please check your email.",
      });
    }
  }
});

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
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        res
          .status(400)
          .json({
            success,
            error: "Please try to login with correct creditionals",
          });
      } else {
        const passwordCompare = await bycript.compare(password, user.password);
        if (!passwordCompare) {
          res
            .status(400)
            .json({
              success,
              error: "Please try to login with correct creditionals",
            });
        } else {
          // console.log(password)
          // console.log(user.password)
          // console.log(passwordCompare)
          //  if (user.verified==="true")
          const data = {
            user: {
              id: user.id,
            },
          };
          const authtoken = jwt.sign(data, JWT_SECRET);
          success = true;
          res.json({ success, authtoken });
        }
      }
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send(success, "Internal server error : Something went wrong");
    }
  }
);

//Route4: Get logged in users details "/api/auth/getuser"/  login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    let userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error : Something went wrong");
  }
});

//route5 change password

router.post(
  "/user/updatepass",
  fetchuser,
  [body("password", "Password cannot be blank").exists()],
  async (req, res) => {
    let userId = req.user.id;
    const user = await User.findById(userId).select("password");
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    } else {
      const { password, newPass, confirmNewPass } = await req.body;
      const passwordCompare = await bycript.compare(password, user.password);

      if (!passwordCompare) {
        res
          .status(400)
          .json({ success, error: "Please input correct password" });
      } else {
        if (newPass === confirmNewPass) {
          if (password === newPass) {
            res
              .status(400)
              .json({
                success,
                error: "Password cannot be same as old password",
              });
          } else {
            let success = true;
            const salt = await bycript.genSalt(10);
            const newsecPass = `${await bycript.hash(newPass, salt)}`;
            //  console.log(userId)
            //  console.log(newsecPass)
            //  console.log(password)
            await User.findByIdAndUpdate(userId, { password: newsecPass });
            res
              .status(200)
              .json({ success, error: "Password updated successfully" });
          }
        } else {
          res

            .status(400)
            .json({
              success,
              error:
                "Please inpu same password in New password and Confirm password field",
            });
        }
      }
    }
  }
);

//route 6 post requestt doesntt require login
router.post("/user/forgetpass", async (req, res) => {
  const { email } = req.body;
  let success = false;
  let user = await User.findOne({ email });
  if (!user) {
    res
      .status(400)
      .json({
        success,
        error: "Please try to login with correct creditionals",
      });
  } else {
    const name = user.name;
    const sendVerificationEmail = async (res) => {
      const currentUrl = process.env.HOST;
      // const user=await User.findOne({ email: { $eq: req.body.email } })
      const newuserId = user._id;
      const uniqueString = uuidv4();
      const newVerification = await new userVerForPass({
        uniqueStringforuser: uniqueString,
        userName: name,
        verified: "flase",
        email: email,
        userId: newuserId,
        expiresAt: Date.now() + 3600000,
      });
      await newVerification.save();
      const userforverfication = await userVerForPass.findOne({
        uniqueStringforuser: { $eq: uniqueString },
      });

      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: req.body.email,
        subject: "Social Paragon: Verify your email",
        html: `<div text-align: center; align-items: center;  justify-content: center; ">  
      <h3>Please click verify to change your the password of your account.</h3>
      <img src="https://lh3.googleusercontent.com/drive-viewer/AJc5JmQ_WFy-rf9RY3sa7EzEwJVeho2iaS_2DL8nkGxt-_3zAkY_8jtFW5-l-gy149I3zn-MbanlUtw=w2640-h1828" alt="Social Paragon"style="    width: 45%;
          margin:auto;
          margin-top: 15px;">
      <p style="font-weight: bold;">This link will expire in one hour</p>
      <a style="  color: rgb(255, 255, 255);
      border: 2px solid gray;
      border-radius: 15px;
      padding: 6px 6px;
      background-color: rgb(75, 182, 43);
      text-decoration: none;" href=${
        currentUrl +
        "api/auth/user/verify/?str=" +
        uniqueString +
        "&id=" +
        userforverfication._id
      } >Verify</a>
    
      </div>`,
      };
      await transporter.sendMail(mailOptions);
    };
    await sendVerificationEmail();
    success = true;
    res
      .status(200)
      .json({
        success,
        error:
          "A verification link has been send to your email account. Please check your email to verify your password.",
      });
  }
});

// router7: verify if the user has correct verification link doesn't require login

router.get(`/user/forgetpass/verify/:uniqueString/:id`, async (req, res) => {
  const { id, uniqueString } = req.params;
  let success = false;
  let docs = await userVerForPass.findOne({
    uniqueStringforuser: uniqueString,
  });
  if (!docs) {
    res
      .status(400)
      .json({
        success,
        error: "Verification cannotbe completed. Please check your email.",
      });
    // })
  } else {
    const newid = `${id}`;
    if (newid.length === 24) {
      const userforverfication = await userVerForPass.findOne({
        uniqueStringforuser: uniqueString,
      });
      const userId = `${userforverfication.userId}`;
      const expiresAt = await userforverfication.expiresAt;
      if (userforverfication.id === id) {
        if (expiresAt < Date.now()) {
          await User.deleteOne({ _id: userId });
          await userVerForPass.deleteOne({ uniqueStringforuser: uniqueString });
          res
            .status(400)
            .json({
              success,
              error:
                "Your verification link has been expired. Please signup again.",
            });
        } else {
          success = true;
          const url = process.env.FRONTEND_URL;
          await userVerForPass.deleteOne({ uniqueStringforuser: uniqueString });
          await userVerForPass.findByIdAndUpdate(id, { verified: "true" });
          res.redirect(`${url + "user/forgotpass/verified/" + userId}`);
        }
      } else {
        res
          .status(400)
          .json({
            success,
            error: "Verification cannotbe completed. Please check your email.",
          });
      }
    } else {
      res
        .status(400)
        .json({
          success,
          error: "Verification cannotbe completed. Please check your email.",
        });
    }
  }
});

//`/user/forgetpass/verify/:uniqueString/:id`
//Route8 change users forgotten password users are verified here
router.get(`/user/forgetpass/verified/:id`, async (req, res) => {});

// Route9: check if user is valid and verified
router.get(`/verify/user`, fetchuser, async (req, res) => {
  let userId = await req.user.id;
  console.log(userId);
  let user = await User.findById(userId);
  console.log(user);
  if (user) {
    const verification = user.verified;
    if (verification === "true") {
      let verified = "true";
      let user = "true";
      // console.log('i am rendering')
      res.json({ verified, user });
    } else {
      let verified = "false";
      // console.log('Both of them are tlling a lie ')

      let user = "true";
      res.json({ verified, user });
    }
  } else {
    let verified = "false";
    let user = "false";
    // console.log('he is tlling a lie ')

    res.json({ verified, user });
  }
});

module.exports = router;
