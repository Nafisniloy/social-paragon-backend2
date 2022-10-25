const connectToMongo = require('./db')
var path = require('path');
connectToMongo();

const express = require('express')
const app = express()
var cors = require('cors')


app.use(cors());
app.options('*', cors());

const port = process.env.PORT || 3530;
app.use (express.json())
// Add headers before the routes are defined
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'https://paragon.learnfacts.xyz');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,auth-token');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  // res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});


// available routes
app.use('/api/auth', require('./routes/auth')),
app.use('/api/profile', require('./routes/profile'))
// app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`Social paragon backend listening on port ${port}`)
})

module.exports = app;