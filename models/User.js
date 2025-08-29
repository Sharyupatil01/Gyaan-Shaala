const mongoose=require("mongoose");


const UserSchema= new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        trim:true

    },
    lastname:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,

    },
    accountType:{
        type:String,
        required:true,
        enum:["Admin","Instructor","Student"]

    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        
        ref:"Profile"
        
    },
    token:{
        type:String
    },
    resetPasswordExpiry:{
        type:Date,
    },
    courses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        }
    ],
    image:{
         type:String,
         
    },
    courseProgress:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseProgress"

        }
    ]

},
{
    timestamps:true}

)
module.exports=mongoose.model("User",UserSchema);
