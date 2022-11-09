const mongoose = require ('mongoose');
const {Schema} = mongoose;
const msgSchema = new Schema({
    userId: {
        type : String,
        required: true,
    
    }, 
    friendsId:{
        type : String,
        required: true,
    },  
    messages:[{
  

            message:String,
            forMe:String,
            status:String,
             
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
    ]
}
)
    const messageSchema = mongoose.model('messageSchema', msgSchema)

module.exports = messageSchema;