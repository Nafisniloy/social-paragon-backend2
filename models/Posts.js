const mongoose = require ('mongoose');
const {Schema} = mongoose;
const {ObjectId}= mongoose.SchemaTypes 
const postSchema2 = new Schema({
    userId: {
        type : String,
        required: true,
    
    },
    userName:{
        type : String,
    },
    date:{
        type : Date,
    },
    type:{
        type : String,
        default:"public"
    },
    description:{
        type : String,
    },
    liker:[{type: String }],
    disliker:[],
    comments:{
        comment:[
            {
            data : String,
            commenterId: String,
        }    ]
    },
    like:{
        type : Number,
        },
    dislike:{
        type : Number,
        },
    
    images:[{
        img:[
            {
            name: String,
            data: String,
            contentType: String
        },
    ]
    }]
}
)

const postSchema = mongoose.model('postSchema', postSchema2)

module.exports = postSchema;