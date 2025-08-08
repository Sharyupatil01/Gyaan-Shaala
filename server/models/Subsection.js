const mongoose=require("mongoose")

const subsectionSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,

    },
    duration:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    videoUrl:{
        type:String,
        required:true
    },
    additionalUrl:{
        type:String,
        
    }

})

module.exports=mongoose.model("Subsection",subsectionSchema)