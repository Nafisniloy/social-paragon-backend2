const mongoose = require ('mongoose');
const {Schema} = mongoose;
const friendRequestSchema = new Schema({
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
const friendRequest = mongoose.model('friendRequest', friendRequestSchema)

module.exports = friendRequest;