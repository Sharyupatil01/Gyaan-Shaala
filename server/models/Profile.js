const mongoose=require("mongoose");

const profileSchema=new mongoose.Schema({
    dateofbirth:{
        type:String
    },
    gender:{
        type:String
    },
    about:{
        type:String
    },
    phoneNo:{
        type:String
    }
})

module.exports=mongoose.model("Profile",profileSchema)