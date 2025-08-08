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
    accountype:{
        type:String,
        required:true,
        enum:["Admin","Instructor","Student"]

    },
    additonalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Profile"
        
    },
    courses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        }
    ],
    image:{
         type:String,
         required:true
    },
    courseProgress:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseProgress"

        }
    ]

})
module.exports=mongoose.model("User",UserSchema);
