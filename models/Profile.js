const mongoose = require ('mongoose');
const {Schema} = mongoose;

const profileSchema2 = new Schema({
    userId: {
        type : String,
        required: true,
    
    },
    userName:{
        type : String,
    },
    Bio :{
     type: String,
    },
     gender:{
        type : String,
    },
    dateOfBirth:{
        type : String,
    }, 
    religion:{
        type : String,

    },
    places:{
        type : String,

    },
    friends:{
        type : Array,
    
    },
    profilePic:{
        name: String,
        img:
        {
            data: String,
            contentType: String
        },
    }
}
)

const profileSchema = mongoose.model('profileSchema', profileSchema2)

module.exports = profileSchema;