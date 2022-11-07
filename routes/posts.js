const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const User = require("../models/User");
const friendRequest= require('../models/Friendrequest');
const router = express.Router();
const app = express()
const crypto = require('crypto');
const path = require("path");
let alreadyLiked;
let alreadyDisLiked;
alreadyLiked=""
alreadyDisLiked=""
let image1 
let image2 
let image3 


//Mullter setup

let mongoose = require('mongoose')
let bodyParser = require('body-parser')
const multer  = require('multer')
const grid = require('gridfs-stream');
const {GridFsStorage} = require('multer-gridfs-storage');
const postSchema = require("../models/Posts");
// const url = 'mongodb+srv://niloy:niloy123@cluster0.6k5pnzw.mongodb.net/social-paragon';
// // const upload = multer({ dest: 'uploads/' })
// const storage = new GridFsStorage({ url });
// const upload = multer({ storage });
// let upload = multer({ storage: storage });
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))


const mongoURI = 'mongodb+srv://niloy:niloy123@cluster0.6k5pnzw.mongodb.net/social-paragon';

// Create mongo connection
// const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs, gridfsBucket; // declare one more letiable with name gridfsBucket
const conn = mongoose.connection;
conn.once('open', () => {
    // Add this line in the code
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'posts'
    });
    gfs = grid(conn.db, mongoose.mongo);
    gfs.collection('posts');
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
            bucketName: 'posts'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

//Mullter setup end







//Route:1 Api for creating new posts
router.post('/create/new',fetchuser,upload.array('images'),async(req,res)=>{
    let userId =await req.user.id
    let success= "false";
  
    if(userId){
       if(req.body.description!=="null"){
           let description = req.body.description
           if(req.files.length!==0){
            let postImages = req.files
            let image1 =[{
              img: {
                name:"",
                data: "",
                contentType: 'image'
            }
          }]  
        let  image2 ={
            img: {
              name:"",
              data:"",
              contentType: 'image'
          }
        }  
        let  image3 ={
            img: {
              name:"",
              data:"",
              contentType: 'image'
          }
        }  
          for (i = 0; i < postImages.length; i++) {
            // console.log(postImages[i]);
            if(i===0){
             
           image1 ={
                img: {
                  name: postImages[i].originalname,
                  data:  postImages[i].filename,
                  contentType: 'image'
              }
            }  
            }else if( i===1){
              image2 ={
                img: {
                  name: postImages[i].originalname,
                  data:  postImages[i].filename,
                  contentType: 'image'
              }
            }  
            }else if(i===2){
              image3 ={
                img: {
                  name: postImages[i].originalname,
                  data:  postImages[i].filename,
                  contentType: 'image'
              }
            }  
            }
          } 
           
              const asyncfunc= async()=>{
               
              await postSchema.create({userId: userId,dislike:0,like:0,date:new Date().toISOString() , description:description, images: [image1,image2,image3] })
              }
              asyncfunc()
              // console.log(images)
              success ="true"
              res.json({success, message:"Published successfully"})
              
             }else{
              await postSchema.create({userId: userId,dislike:0,like:0,date:new Date().toISOString() ,description:description  })
              success ="true"
              res.json({success, message:"Published successfully"})
           }

          //  console.log(req)
       }else{
  
        if(req.files.length!==0){
          let postImages = req.files
          let image1 =[{
            img: {
              name:"",
              data: "",
              contentType: 'image'
          }
        }]  
      let  image2 ={
          img: {
            name:"",
            data:"",
            contentType: 'image'
        }
      }  
      let  image3 ={
          img: {
            name:"",
            data:"",
            contentType: 'image'
        }
      }  
        for (i = 0; i < postImages.length; i++) {
          // console.log(postImages[i]);
          if(i===0){
           
         image1 ={
              img: {
                name: postImages[i].originalname,
                data:  postImages[i].filename,
                contentType: 'image'
            }
          }  
          }else if( i===1){
            image2 ={
              img: {
                name: postImages[i].originalname,
                data:  postImages[i].filename,
                contentType: 'image'
            }
          }  
          }else if(i===2){
            image3 ={
              img: {
                name: postImages[i].originalname,
                data:  postImages[i].filename,
                contentType: 'image'
            }
          }  
          }
        } 
         
            const asyncfunc= async()=>{
            
            await postSchema.create({userId: userId,dislike:0,like:0,date:new Date().toISOString() ,  images: [image1,image2,image3] })
            }
            asyncfunc()
              success ="true"
            res.json({success, message:"Published successfully"})
            // console.log(images)
       
            
           }else{
            success= "false"
            res.json({success, message:"Please input something to post."})
           }
       }


    }else{
      success= "false"
        res.json({success, message:"Not a valid user"})
    }
})

//Route:2 Getting all posts of myself
router.post('/get/my/posts',fetchuser,async(req,res)=>{
  let userId = await req.user.id
  let success = "false"
  if(userId){
    let allPosts = await postSchema.find({userId:userId})
   if(allPosts.length>0){
    let success = "true"
    res.json({success, allPosts})
   }else{
    let success = "true"
    res.json({success, message:"No posts to show"})
   }

  }else{
    res.json({success, message:'Not a valid user'})
  }
})


//Route:3 Getting all images of a post
router.post('/get/posts/images',async(req,res)=>{
  const images = req.body.images

  for (i = 0; i < images.length; i++) {
  if(i===0){
   images[i].img.forEach(async element => {
     if(element.data){
       await  gfs.files.findOne({ filename: element.data }, (err, file) => {
         // Check if file
         if (!file || file.length === 0) {
           
           image1 =null
           
          }else {
            // Read output to browser
            const func=async()=>{   
              const readStream = await  gridfsBucket.openDownloadStreamByName(element.data);
              
              //  readStream.pipe(res)
            
              let result=""
              readStream.on('data', function(chunk) {
            result += chunk;
      });
      readStream.on('end', function () {
        // do something with "result"
        image1 = result
      
    });
           
          }
          func()
        } 
      });
    }
    });
  
    }else if( i===1){
      images[i].img.forEach(async element => {
        if(element.data){
        await  gfs.files.findOne({ filename: element.data }, (err, file) => {
          // Check if file
          if (!file || file.length === 0) {
           
              image2 =null
            
          }else {
            // Read output to browser
           const func=async()=>{   
             const readStream = await  gridfsBucket.openDownloadStreamByName(element.data);
         
            //  readStream.pipe(res)
            let result=""
            readStream.on('data', function(chunk) {
              result += chunk;
        });
        readStream.on('end', function () {
          // do something with "result"
          image2 = result
         
      });
             
            }
            func()
          } 
        });
      }
      });
    
    }else if( i===2){
      images[i].img.forEach(async element => {
        if(element.data){

          await  gfs.files.findOne({ filename: element.data }, (err, file) => {
            // Check if file
            if (!file || file.length === 0) {
             
                image3 =null
              
            }else {
              // Read output to browser
             const func=async()=>{   
               const readStream = await  gridfsBucket.openDownloadStreamByName(element.data);
           
              //  readStream.pipe(res)
              let result=""
              readStream.on('data', function(chunk) {
                result += chunk;
          });
          readStream.on('end', function () {
            // do something with "result"
            image3 = result
        
        });
               
              }
              func()
            } 
          });
        }
      });
    
    }

  }
  res.set('Content-Type','image/webp')
  res.json({image1,image2,image3})
})


//Route:4 Getting images of a post one by one
router.post('/get/single/image',async(req,res)=>{
  const filename = req.body.filename
  if(filename.length>0){
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
  }else {
    res.status(404).json({
      err: 'Not an image'
    })
  }
})


//Route:5 Liking a post
router.post('/new/like',fetchuser,async(req,res)=>{
  let userId = await req.user.id
  let postId = req.body.postId
  if(userId){
     let post= await postSchema.findById(postId).select(['liker','disliker',"like","dislike"])
    
     if(post.liker.length>0){
      post.liker.forEach(element => {
        if(element===userId){
          alreadyLiked =true
        }
      });
      if(alreadyLiked){
    await postSchema.updateOne({id:postId},{ $pull: { liker: userId } })  
    let like = post.like
    like= like-1;
    await postSchema.findByIdAndUpdate(postId,{like:like})  
  res.send(true)
      }else{
    
        if(post.disliker.length>0){
         post.disliker.forEach(element => {
           if(element===userId){
            alreadyDisLiked =true
           }
         });
      }
      if(alreadyDisLiked){
        await postSchema.updateOne({id:postId},{ $pull: { disliker: userId } })  
        let dislike = post.dislike
        dislike= dislike-1;
        await postSchema.findByIdAndUpdate(postId,{dislike:dislike})
        await postSchema.updateOne({id:postId},{ $push: { liker: userId } })  
        let like = post.like
        like= like+1;
        await postSchema.findByIdAndUpdate(postId,{like:like})
      res.send(true)
          }else{
            await  postSchema.updateOne({id:postId},{ $push: { liker: userId } })
            let like = post.like
            like= like+1;
            await postSchema.findByIdAndUpdate(postId,{like:like})
            res.send(true)
          }
    }
     }else if(post.disliker.length>0){
  
      post.disliker.forEach(element => {
        if(element===userId){
         alreadyDisLiked =true
        }
      });
       if(alreadyDisLiked){
        await postSchema.updateOne({id:postId},{ $pull: { disliker: userId } })  
        let dislike = post.dislike
        dislike= dislike-1;
        await postSchema.findByIdAndUpdate(postId,{dislike:dislike})
        await postSchema.updateOne({id:postId},{ $push: { liker: userId } })  
        let like = post.like
        like= like+1;
        await postSchema.findByIdAndUpdate(postId,{like:like})
      res.send(true)
          }else{
            await  postSchema.updateOne({id:postId},{ $pull: { disliker: userId } })

            await  postSchema.updateOne({id:postId},{ $push: { liker: userId } })
            let like = post.like
            like= like+1;
            await postSchema.findByIdAndUpdate(postId,{like:like})
            res.send(true)
          }

     }else{
    await  postSchema.updateOne({id:postId},{ $set: { liker: userId } })
    await  postSchema.updateOne({id:postId},{ $pull: { disliker: userId } })

   let like = post.like
   like= like+1;
   await postSchema.findByIdAndUpdate(postId,{like:like})
   res.send(true)
     }
  }else{
    res.send(false)
  }
})
//Route:6 Disiking a post
router.post('/new/dislike',fetchuser,async(req,res)=>{
  let userId = await req.user.id
  let postId = req.body.postId
  if(userId){
     let post= await postSchema.findById(postId).select(['liker','disliker',"like","dislike"])
 
     if(post.disliker.length>0){
      post.disliker.forEach(element => {
        if(element===userId){
          alreadyDisLiked =true
        }
      });
      if(alreadyDisLiked){
    await postSchema.updateOne({id:postId},{ $pull: { disliker: userId } })  
    let like = post.dislike
    like= like-1;
    await postSchema.findByIdAndUpdate(postId,{dislike:like})  
  res.send(true)
      }else{
       
        if(post.liker.length>0){
         post.liker.forEach(element => {
           if(element===userId){
            alreadyLiked =true
           }
         });
      }
      if(alreadyLiked){
        await postSchema.updateOne({id:postId},{ $pull: { liker: userId } })  
        let dislike = post.like
        dislike= dislike-1;
        await postSchema.findByIdAndUpdate(postId,{like:dislike})
        await postSchema.updateOne({id:postId},{ $push: { disliker: userId } })  
        let like = post.dislike
        like= like+1;
        await postSchema.findByIdAndUpdate(postId,{dislike:like})
      res.send(true)
          }else{
            await  postSchema.updateOne({id:postId},{ $push: { disliker: userId } })
            let like = post.dislike
            like= like+1;
            await postSchema.findByIdAndUpdate(postId,{dislike:like})
            res.send(true)
          }
    }
     }else if(post.liker.length>0){
     
      post.liker.forEach(element => {
        if(element===userId){
         alreadyLiked =true
        }
      });
       if(alreadyLiked){
        await postSchema.updateOne({id:postId},{ $pull: { liker: userId } })  
        let dislike = post.like
        dislike= dislike-1;
        await postSchema.findByIdAndUpdate(postId,{like:dislike})
        await postSchema.updateOne({id:postId},{ $push: { disliker: userId } })  
        let like = post.dislike
        like= like+1;
        await postSchema.findByIdAndUpdate(postId,{dislike:like})
      res.send(true)
          }else{
            await  postSchema.updateOne({id:postId},{ $push: { disliker: userId } })
            await  postSchema.updateOne({id:postId},{ $pull: { liker: userId } })

            let like = post.dislike
            like= like+1;
            await postSchema.findByIdAndUpdate(postId,{dislike:like})
            res.send(true)
          }

     }else{
    await  postSchema.updateOne({id:postId},{ $set: { disliker: userId } })
    await  postSchema.updateOne({id:postId},{ $pull: { liker: userId } })
   let like = post.dislike
   like= like+1;
   await postSchema.findByIdAndUpdate(postId,{dislike:like})
   
   res.send(true)
     }
  }else{
    res.send(false)
  }
})




//Route:7 checking like status
router.post('/like/status',fetchuser,async(req,res)=>{
  let userId = await req.user.id
  let postId = req.body.postId
  if(userId){
    let post= await postSchema.findById(postId).select(['liker','disliker',"like","dislike"])
   
    if(post.liker.length>0){
     post.liker.forEach(element => {
      
       if(element===userId){
         alreadyLiked =true
       }
     });
     if(alreadyLiked){
      res.json({liked:true,disliked:false})
     }else{
      if(post.disliker.length>0){
    
        post.disliker.forEach(element => {
          if(element===userId){
            alreadyDisLiked =true
          }
        });
        if(alreadyDisLiked){
          res.json({liked:false,disliked:true})
        }else{
          res.json({liked:false,disliked:false})
        }
      }
     }
    }else if(post.disliker.length>0){
  
      post.disliker.forEach(element => {
        if(element===userId){
          alreadyDisLiked =true
        }
      });
      if(alreadyDisLiked){
        res.json({liked:false,disliked:true})
      }else{
        res.json({liked:false,disliked:false})
      }
    }else{
 res.json({liked:false,disliked:false})
    }
  }else{
    res.json({liked:false,disliked:false})
  }
  alreadyLiked=""
  alreadyDisLiked=""
})



//Routes for adding and removing likes and dislikes
router.post('/add/dislike',fetchuser,async(req,res)=>{
  let userId = await req.user.id
  let postId = req.body.postId
  let post= await postSchema.findById(postId).select(['liker','disliker',"like","dislike"])
  post.disliker.forEach(element => {
    if(element===userId){
      alreadyLiked =true
    }
  });
  // if(alreadyLiked){
  //   res.send(false)
  //   console.log('already diliked')

  // }else{
    await  postSchema.findOneAndUpdate({_id:postId},{ $push: { disliker: userId } },{new:true})
    let like = post.dislike
    like= like+1;
    await postSchema.findByIdAndUpdate(postId,{dislike:like})
    res.send(true)
  // }
})
router.post('/add/like',fetchuser,async(req,res)=>{
  let userId = await req.user.id
  let postId = req.body.postId
  let post= await postSchema.findById(postId).select(['liker','disliker',"like","dislike"])
 
  post.liker.forEach(element => {
    if(element===userId){
      alreadyLiked =true
      console.log(element)
    }
  });
  // if(alreadyLiked){
  //   res.send(false)
  // }else{
    await  postSchema.findOneAndUpdate({_id:postId},{ $push: { liker: userId } },{new:true})
    let like = post.like
    like= like+1;
    await postSchema.findByIdAndUpdate(postId,{like:like})
    res.send(true)
  // }
  alreadyLiked=""
  alreadyDisLiked=""
})
router.post('/remove/dislike',fetchuser,async(req,res)=>{
  let userId = await req.user.id
  let postId = req.body.postId
  let post= await postSchema.findById(postId).select(['liker','disliker',"like","dislike"])
 
  post.disliker.forEach(element => {
    if(element===userId){
      alreadyLiked =true
    }
  });
  // if(alreadyLiked){
    await  postSchema.findOneAndUpdate({_id:postId},{ $pull: { disliker: userId } },{new:true})
    let like = post.dislike
    like= like-1;
    await postSchema.findByIdAndUpdate(postId,{dislike:like})
    res.send(true)
  // }else{
  //   res.send(false)
  // }
  alreadyLiked=""
  alreadyDisLiked=""
})
router.post('/remove/like',fetchuser,async(req,res)=>{
  let userId = await req.user.id
  let postId = req.body.postId
  let post= await postSchema.findById(postId).select(['liker','disliker',"like","dislike"])
 
  post.liker.forEach(element => {
    if(element===userId){
      alreadyLiked =true
    }
    // console.log(element)
  });
  // console.log(alreadyLiked)
  // if(alreadyLiked){
    await  postSchema.findOneAndUpdate({_id:postId},{ $pull: { liker: userId } },{new:true})
    let like = post.like
    like= like-1;
    await postSchema.findByIdAndUpdate(postId,{like:like})
    res.send(true)
  // }else{
  //   res.send(false)
  // }
  alreadyLiked=""
  alreadyDisLiked=""
  })

//Routes for adding and removing likes and dislikes

//temporary

//Route:8 Getting all posts of others
router.post('/get/friends/posts',fetchuser,async(req,res)=>{
  let userId = await req.body.id
  let myId= await req.user.id
  let success = "false"
  if(myId){
    const   checkIffriends = await friendRequest.find({userId:[userId],friendsId:[myId]})
    if(checkIffriends.length>0){
    if(checkIffriends[0].status==="friends"){
 
  if(userId){
    let allPosts = await postSchema.find({userId:userId})
   if(allPosts.length>0){
    let success = "true"
    res.json({success, allPosts})
   }else{
    let success = "true"
    res.json({success, message:"No posts to show"})
   }

  }else{
    res.json({success, message:'Not a valid user'})
  }
}else{
  res.json({success, message:'You are not friends'})
}}else{
  res.json({success, message:'You are not friends'})
}
}
})

//Getting feed for user Start
router.post('/get/feed',fetchuser,async(req,res)=>{
  let userId= await req.user.id
  let friendsArray= req.body.friendsArray
  let friendsPosts = await postSchema.find({userId:friendsArray})
  let myPosts = await postSchema.find({userId:userId})
  let allPosts=[]
  if(friendsPosts.length>0){
  friendsPosts.forEach(post => {
    allPosts.push(post)
  });
  }
  if(myPosts.length>0){
    myPosts.forEach(post => {
      allPosts.push(post)
    });
  }
allPosts.sort((a,b)=>{
   let newA= a.date.getTime() 
   let newB= b.date.getTime()
    
    return newB-newA
  })
  // console.log(allPosts)
  res.send(allPosts)
})
//Getting feed for user End



module.exports = router;
