const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
       
    courseName:{
        type:String,
        required:true,
    },
    courseDescription:{
        type:String,
        required:true
    },
    instrutor:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"User"
    },
    whatYouWillLearn:{
        type:String,
        required:true,
    },
    courseContent:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Section"
        }
    ],
    RatingAndReviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"RatingAndReviews"
        }
    ],
    price:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    tag:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Tag"
        }
    ,
    studentsEnrolled:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Users",
            required:true
        }
    ]

  
});

module.exports = mongoose.model('Course', CourseSchema);