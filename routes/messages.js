const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const friendRequest = require("../models/Friendrequest");
const messageSchema = require("../models/Messages");
const router = express.Router();
const app = express()


//Route:1 Sending new message
router.post('/send/new',fetchuser,async(req,res)=>{
    let userId= await req.user.id
    let friendsId= req.body.friendsId
    let success= "false";
    let friendshipStatus= await friendRequest.findOne({userId:[userId],friendsId:[friendsId]}).select('status')
    if(friendshipStatus){
        if(friendshipStatus.status==="friends"){
    let messageArray= await messageSchema.findOne({userId:[userId],friendsId:[friendsId]})           
         if(!messageArray){
         await   messageSchema.create({userId:userId,friendsId:friendsId})
        await    messageSchema.create({userId:friendsId,friendsId:userId})
          await  messageSchema.updateOne({userId:[userId],friendsId:[friendsId]},{$push:{messages:{message:req.body.message,forMe:"sent",status:"unseen"}}})
         await   messageSchema.updateOne({userId:[friendsId],friendsId:[userId]},{$push:{messages:{message:req.body.message,forMe:"received",status:"unseen"}}})
         let success= "true"
         res.json({success,message:"Sent Successfully"})
         }else{
             await  messageSchema.updateOne({userId:[friendsId],friendsId:[userId]},{$push:{messages:{message:req.body.message,forMe:"received",status:"unseen"}}})
             await   messageSchema.updateOne({userId:[userId],friendsId:[friendsId]},{$push:{messages:{message:req.body.message,forMe:"sent",status:"unseen"}}})
             let success= "true"
         res.json({success,message:"Sent Successfully"})

         }
        }else{
            res.json({success,message:"You are not friends"})
        }
    }else{
        res.json({success,message:"You are not friends"})
    }
})

//Route:2 Getting all messages of a friend
router.post('/get/all',fetchuser,async(req,res)=>{
    let userId= await req.user.id
    let friendsId= req.body.friendsId
    let success= "false";
    let friendshipStatus= await friendRequest.findOne({userId:[userId],friendsId:[friendsId]}).select('status')
    if(friendshipStatus){
        if(friendshipStatus.status==="friends"){
    let messageArray= await messageSchema.findOne({userId:[userId],friendsId:[friendsId]})           
         if(!messageArray){
        //  await   messageSchema.create({userId:userId,friendsId:friendsId})
        // await    messageSchema.create({userId:friendsId,friendsId:userId})
        //   await  messageSchema.updateOne({userId:[userId],friendsId:[friendsId]},{$push:{messages:{message:req.body.message,forMe:"sent",status:"unseen"}}})
        //  await   messageSchema.updateOne({userId:[friendsId],friendsId:[userId]},{$push:{messages:{message:req.body.message,forMe:"received",status:"unseen"}}})
         let success= "true"
         res.json({success,message:"No message to show"})
         }else{
            let allMessages= await  messageSchema.findOne({userId:[userId],friendsId:[friendsId]})
             let success= "true"
         res.json({success,allMessages})

         }
        }else{
            res.json({success,message:"You are not friends"})
        }
    }else{
        res.json({success,message:"You are not friends"})
    }
})
//Route:3 Getting last message of a friend
router.post('/get/last/one',fetchuser,async(req,res)=>{
    let userId= await req.user.id
    let friendsId= req.body.friendsId
    let success= "false";
    let friendshipStatus= await friendRequest.findOne({userId:[userId],friendsId:[friendsId]}).select('status')
    if(friendshipStatus){
        if(friendshipStatus.status==="friends"){
    let messageArray= await messageSchema.findOne({userId:[userId],friendsId:[friendsId]})           
         if(!messageArray){
        //  await   messageSchema.create({userId:userId,friendsId:friendsId})
        // await    messageSchema.create({userId:friendsId,friendsId:userId})
        //   await  messageSchema.updateOne({userId:[userId],friendsId:[friendsId]},{$push:{messages:{message:req.body.message,forMe:"sent",status:"unseen"}}})
        //  await   messageSchema.updateOne({userId:[friendsId],friendsId:[userId]},{$push:{messages:{message:req.body.message,forMe:"received",status:"unseen"}}})
         let success= "true"
         res.json({success,message:"No message to show"})
         }else{
            let allMessages= await  messageSchema.findOne({userId:[userId],friendsId:[friendsId]})
             let success= "true"
            allMessages= allMessages.messages.reverse()
           allMessages= allMessages[0]
         res.json({success,allMessages})

         }
        }else{
            res.json({success,message:"You are not friends"})
        }
    }else{
        res.json({success,message:"You are not friends"})
    }
})

module.exports = router;
