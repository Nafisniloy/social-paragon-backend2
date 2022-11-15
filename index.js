const connectToMongo = require('./db')
var path = require('path');
connectToMongo();

const express = require('express')
const app = express()
var cors = require('cors');
const fetchuser = require('./middleware/fetchuser');

const server = require('http').createServer(app);

const io = require('socket.io')(server,{cors:{origin:"*"}});



const port = process.env.PORT || 3530;
app.use (express.json())
// // Add headers before the routes are defined
// app.use(function (req, res, next) {
  
  //   // Website you wish to allow to connect
  //   res.setHeader('Access-Control-Allow-Origin', 'https://paragon.learnfacts.xyz');
  
  //   // Request methods you wish to allow
  //   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
  //   // Request headers you wish to allow
  //   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,auth-token');
  
  //   // Set to true if you need the website to include cookies in the requests sent
  //   // to the API (e.g. in case you use sessions)
  //   // res.setHeader('Access-Control-Allow-Credentials', true);
  
  //   // Pass to next layer of middleware
  //   next();
  // });
  app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,auth-token');
      res.status(200)
      next();
  })



  // app.use(cors());



// available routes

app.use('/api/auth', require('./routes/auth')),
app.use('/api/profile', require('./routes/profile')),
app.use('/api/friends',require('./routes/friends'))
app.use('/api/messages',require('./routes/messages'))
app.use('/api/posts',require('./routes/posts'))
// app.use('/api/notes', require('./routes/notes'))

// app.listen(port, () => {
//   console.log(`Social paragon backend listening on port ${port}`)
// })
let ActiveUsers=[]
server.listen(port, () => console.log(`Listening on port ${port}`));
const addNewuser=(userId,socketId)=>{
!ActiveUsers.some((user)=>user.userId===userId)&&
ActiveUsers.push({userId,socketId})
}
const removeUser= (socketId)=>{
  ActiveUsers= ActiveUsers.filter((user)=>user.socketId!== socketId)
}
const getUser=(userId)=>{
  return ActiveUsers.find((user)=>user.userId===userId)
}
io.on('connection', function (socket) {
  socket.on("sendingId",(userId)=>{
    addNewuser(userId,socket.id)
  })
  socket.on("newMessage", function(userId){
    let user=getUser(userId)
    // console.log(user)
    io.to(user.socketId).emit("receivedMessage")
  })
  socket.on("disconnect",()=>{
    removeUser(socket.id)
  })
  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });
});


module.exports = app;