// const { default: userEvent } = require('@testing-library/user-event');
const mongoose = require ('mongoose');
const {Schema} = mongoose;
const UserVerificationSchema= new Schema({
    userId: {
        type : String,
      
    
    },
    userUrl: {
        type : String,
      
    
    },
    uniqueStringforuser:{
        type : String,
  
         
    },
    expiresAt:{
        type: Number,
       
    }
 
    

});
const UserVerification = mongoose.model('UserVerification', UserVerificationSchema)

module.exports = UserVerification