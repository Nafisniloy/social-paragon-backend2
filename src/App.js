const connectToMongo = require('../db')
const serverLess= require("Serverless-Http")
connectToMongo();

const express = require('express')
const app = express()
var cors = require('cors');
const ServerlessHttp = require('serverless-http');


app.use(cors())

const port = process.env.PORT || 5000;
app.use (express.json())


// available routes
app.use('/.netlify/functions/api/auth', require('../routes/auth'))
// app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`Notebook backend listening on port ${port}`)
})

modules.exports.handler= serverLess(app);