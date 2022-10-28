const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const User = require("../models/User");
const friendRequest= require('../models/Friendrequest');
const profileSchema = require("../models/Profile");
const router = express.Router();

router.post('/send/request',fetchuser,async(req,res)=>{
    let userId = await req.user.id;
    let friendsId =await req.body.friendsId;
    if(userId&&friendsId){
     const   checkIfalradyRequested = await friendRequest.find({userId:[userId],friendsId:[friendsId]})
     if(checkIfalradyRequested.length>0){
       checkIfalradyRequested.forEach(element => {
        if (element.status==="sent") {
            let success= "false";
        res.json({
             success,
             message: "Friend request already sent",
           });
  
}else if(element.status==="friends"){
  let success= "false";
  res.json({
       success,
       message: "You are already friends.",
     });
}
 else{
  let success= "false";
  res.json({
       success,
       message: "User has already sent you a friend request",
     });
}   

});
    }else{
      await friendRequest.create({userId:userId,friendsId:friendsId,status:"sent"})
      await friendRequest.create({userId:friendsId,friendsId:userId,status:"received"})
      let success= "true";
     res.json({
          success,
          message: "Friend request sent successfully.",
        });
    }

    }else{
        let success= "false";
        res.json({
             success,
             message: "Something went wrong.",
           });
    }
})
router.post('/accept/request',fetchuser, async(req,res)=>{
    let userId = await req.user.id;
    let friendsId =await req.body.friendsId;
    if(userId&&friendsId){
     const   checkIfalradyRequested = await friendRequest.find({userId:[userId],friendsId:[friendsId]})
     if(checkIfalradyRequested.length>0){
       checkIfalradyRequested.forEach(element => {
        if (element.status==="sent") {
            let success= "false";
        res.json({
             success,
             message: "Please wait till user accept your request",
           });
  
}else if(element.status==="friends"){
  let success= "false";
  res.json({
       success,
       message: "You are already friends.",
     });
}
 else{
  let success= "true";
  const acceptreq= async()=>{
    await  friendRequest.updateOne({userId:[friendsId],friendsId:[ userId]},{$set:{status:"friends"}})
    await  friendRequest.updateOne({userId:[userId],friendsId:[friendsId]},{$set:{status:"friends"}})

  }
acceptreq()
  res.json({
       success,
       message: "You are friends now.",
     });
}   

});
    }else{
      // await friendRequest.create({userId:userId,friendsId:friendsId,status:"sent"})
      // await friendRequest.create({userId:friendsId,friendsId:userId,status:"received"})
      let success= "false";
      res.json({
           success,
           message: "Something went wrong.",
         });
    }

    }else{
        let success= "false";
        res.json({
             success,
             message: "Something went wrong.",
           });
    }
})
router.post('/cancel/request',fetchuser, async(req,res)=>{
    let userId = await req.user.id;
    let friendsId =await req.body.friendsId;
    if(userId&&friendsId){
     const   checkIfalradyRequested = await friendRequest.find({userId:[userId],friendsId:[friendsId]})
     if(checkIfalradyRequested.length>0){
       checkIfalradyRequested.forEach(element => {
        if (element.status==="sent") {
            let success= "true";
            const delreq= async()=>{
              await  friendRequest.deleteOne({userId:[friendsId],friendsId:[ userId]})
              await  friendRequest.deleteOne({userId:[userId],friendsId:[friendsId]})          
            }
          delreq()
        res.json({
             success,
             message: "Request canceled successfully",
           });
  
}else if(element.status==="friends"){
  let success= "false";
  res.json({
       success,
       message: "You are already friends.",
     });
}
 else{
  let success= "true";
  const delreq= async()=>{
    await  friendRequest.deleteOne({userId:[friendsId],friendsId:[ userId]})
    await  friendRequest.deleteOne({userId:[userId],friendsId:[friendsId]})          
  }
delreq()
res.json({
   success,
   message: "Request canceled successfully",
 });
}   

});
    }else{
      // await friendRequest.create({userId:userId,friendsId:friendsId,status:"sent"})
      // await friendRequest.create({userId:friendsId,friendsId:userId,status:"received"})
      let success= "false";
      res.json({
           success,
           message: "Something went wrong.",
         });
    }

    }else{
        let success= "false";
        res.json({
             success,
             message: "Something went wrong.",
           });
    }
})

router.post('/check/status',fetchuser, async(req,res)=>{
  let userId = await req.user.id;
    let friendsId =await req.body.friendsId;
    if(userId&&friendsId){
      let success= true;
      const userDetails= await profileSchema.findOne({userId:friendsId})
      if(userDetails){
        const verified= await User.findById(req.body.friendsId)
        if (verified.verified==="true") {
          const name= verified.name
          const gender= verified.gender
          const dateOfBirth= verified.dateOfBirth
          const   checkIffriends = await friendRequest.find({userId:[userId],friendsId:[friendsId]})
          if(checkIffriends.length>0){
          checkIffriends.forEach(element => {
              if (element.status==="sent") {
                let success= "true";
                res.json({
                     success,
                     message: "You are not friends",
                     status:"sent",
                     userDetails,
                     name , gender , dateOfBirth
                   });
              } else if(element.status==="received") {
                let success= "true";
                res.json({
                     success,
                     message: "You are not friends",
                     status:"received",
                     userDetails,
                     name , gender , dateOfBirth
                   });
              }else if(element.status==="friends") {
                let success= "true";
                res.json({
                     success,
                     message: "You are friends",
                     status:"friends",
                     userDetails,
                     name , gender , dateOfBirth
                   });
              }
               
            });
        }else{
          let success= "true";
          res.json({
               success,
               message: "You are not friends",
               status:"notFriends",
               userDetails,
               name , gender , dateOfBirth
             });
        }
        } else {
          let success= "false";
        res.json({
             success,
             message: "Not a verified user.",
           });
        }
    
      }else{
        let success= "false";
        res.json({
             success,
             message: "Not a valid user.",
           });
      }
      
  }else{
    let success= "false";
    res.json({
         success,
         message: "Something went wrong.",
       });
  }
})


module.exports = router;
