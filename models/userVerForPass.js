// const { default: userEvent } = require('@testing-library/user-event');
const mongoose = require ('mongoose');
const {Schema} = mongoose;
const userVerForPassSchema= new Schema({
    userId: {
        type : String,
      
    
    },
    userName: {
        type : String,
    },
    password: {
        type : String,
    },
    verified: {
        type : String,
    },
    uniqueStringforuser:{
        type : String,
    },
    expiresAt:{
        type: Number,
    }
 
    

});
const userVerForPass = mongoose.model('userVerForPass', userVerForPassSchema)

module.exports = userVerForPass