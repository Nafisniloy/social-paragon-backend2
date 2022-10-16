const mongoose = require ('mongoose');
const mongoURI='mongodb+srv://niloy:niloy123@cluster0.6k5pnzw.mongodb.net/social-paragon'
const connectToMongo = ()=>{
 mongoose.connect(mongoURI,()=>{
    console.log('mongo server is now connected')
 })
}

module.exports = connectToMongo;