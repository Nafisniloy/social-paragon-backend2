const mongoose = require ('mongoose');
const {Schema} = mongoose;
const friendsSchema = new Schema({
    userId: {
        type : String,
        required: true,
    },
    friendsId:{
        type : String,
        required: true,
    },  
    status:{
        type : String,
    }
})
const friends = mongoose.model('friends', friendsSchema)

module.exports = friends;