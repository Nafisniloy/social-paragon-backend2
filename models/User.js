// const { default: userEvent } = require('@testing-library/user-event');
const mongoose = require ('mongoose');
const {Schema} = mongoose;
const UserSchema= new Schema({
    name: {
        type : String,
        required: true
    
    },
    email:{
        type : String,
        required: true,
        unique: true,   
    },
    password:{
        type : String,
    },
    gender:{
        type : String,
        default:"",
    },
    date:{
        type : Date,
        default: Date.now
    },
    verified:{
        type : String,
     
    },
    dateOfBirth:{
        type : String,
        default:"",
    },

});
const User = mongoose.model('user', UserSchema)

module.exports = User