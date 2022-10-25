const express = require("express");
var bodyParser = require('body-parser')
const router = express.Router();
const path = require("path");
var mongoose = require('mongoose')
var fs = require('fs');
const crypto = require('crypto');
const fetchuser = require("../middleware/fetchuser");
const app = express()
const multer  = require('multer')
const grid = require('gridfs-stream');
const {GridFsStorage} = require('multer-gridfs-storage');
// const url = 'mongodb+srv://niloy:niloy123@cluster0.6k5pnzw.mongodb.net/social-paragon';
// // const upload = multer({ dest: 'uploads/' })
// const storage = new GridFsStorage({ url });
// const upload = multer({ storage });
// var upload = multer({ storage: storage });
const profileSchema = require('../models/Profile');
const connectToMongo = require("../db");
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))


const mongoURI = 'mongodb+srv://niloy:niloy123@cluster0.6k5pnzw.mongodb.net/social-paragon';

// Create mongo connection
// const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs, gridfsBucket; // declare one more variable with name gridfsBucket
const conn = mongoose.connection;
conn.once('open', () => {
    // Add this line in the code
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
    gfs = grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });


router.post('/upload/propic',fetchuser,upload.single('profilePic'),async(req,res)=>{
    let userId = await req.user.id;
    let success= "false"
    var profilePic = {
       name:req.file.originalname,       
        img: {
            data: req.file.filename,
            contentType: 'image'
        }
    }
    const testing=  await profileSchema.findOne({userId: userId})
      if(!testing){
        if(!req.file){
          res.json({success, message:"Error " });
      }else{
        
          
        // await profileSchema.create({userId: userId,  profilePic: profilePic });
        const newProfile =await new profileSchema({userId: userId,  profilePic: profilePic })
        await newProfile.save()
        const  success="true"
       res.json({ success,message:"successfully added profile picture"})
       
      }
    }else{
      if(!testing.profilePic){
        if(!req.file){
          res.json({success, message:"Error " });
      }else{
        
          
        const  success="true"
        await profileSchema.updateOne({userId: userId},{$set:{ profilePic: profilePic }});
        // await profileSchema.create({userId: userId,  profilePic: profilePic });
      //   const newProfile =await new profileSchema({userId: userId,  profilePic: profilePic })
      //  await newProfile.save()
        res.json({success,message:"Successfully added profile picture"})
        }
      }else{
        if(!req.file){
          res.json({success, message:"Sorry something went wrong" });
      }else{
        
          
        const  success="true"
        await profileSchema.updateOne({userId: userId},{$set:{ profilePic: profilePic }});
      //   const newProfile =await new profileSchema({userId: userId,  profilePic: profilePic })
      //  await newProfile.update()
        res.json({success,message:"Successfully updated profile picture"})
        }
      }
     
    }
})

//Get request rotuer for profile image
router.get('/get/profile/image',fetchuser,async(req,res)=>{
    let userId = await req.user.id;
  const user= await profileSchema.findOne({userId: userId})
//   const db =await mongoose.connect("mongodb+srv://niloy:niloy123@cluster0.6k5pnzw.mongodb.net/social-paragon")

if(user){
if(user.profilePic){

 const filename=user.profilePic.img.data;


// const newuser= db.fs.files.find ();
//   const file=await  connectToMongo.fs.files.find( { filesname: user.profilePic.img.data } )
const file=await gfs.files.findOne({ filename: filename })
const id= filename
await  gfs.files.findOne({ filename: filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/webp' || file.contentType === 'image/png') {
      // Read output to browser
     const func=async()=>{

       const readStream =await  gridfsBucket.openDownloadStreamByName(filename);
       res.set('Content-Type',file.contentType)
       readStream.pipe(res);
      }
      func()
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
    
}else{
  res.send(null)
}

  // console.log(id)
} else{
  res.send(null)
}
//   res.send(user)
})

//Route for updating profile details

router.post('/update/details',fetchuser,async(req,res)=>{
  let userId = await req.user.id;
  let success= "false"
  // const userProfile=  await profileSchema.findOne({userId: userId})
  if(Object.keys(req.body).length>0){
    success= 'true'
    await profileSchema.updateOne({userId: userId},{$set:{ Bio: req.body.bio ,religion:req.body.religion,places:req.body.places }});
    res.json({success,message:"Successfully updated details"})
  }else{
    res.json({success,message:"Something went wrong."})
  }
})

//Route get profile details
router.get('/get/details', fetchuser,async(req,res)=>{
  let userId = await req.user.id;
  let success= "false"
  const  myProfile=  await profileSchema.findOne({userId: userId})
if(myProfile){
success= "true"
  res.json({success,myProfile})
}else{

  res.json({success,myProfile})
}
})

module.exports = router;
