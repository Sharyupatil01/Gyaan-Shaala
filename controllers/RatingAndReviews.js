const RatingAndReviews = require("../models/RatingAndReviews");
const Course = require("../models/Course");
const { mongo, default: mongoose } = require("mongoose");

//create the rating --> Course updation , R&R updation 
exports.createRatings = async (req, res) => {
    try {
        //get the user id (who want to give rating)
        const userid = req.user.id;

        //fetch the course id rating and revies from reg bdy 
        const { courseId, rating, reviews } = req.body;

        //check is user is entrolled or not 

        const courseDetails = await Course.findOne({
            _id: courseId,
            studentsEnrolled: { $eleMatch: { $eq: userid } }

        })
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: "Student is not entrolled in the course"
            })
        }

        //check if the user already reviews the course 

        const alreadyReviewed = await RatingAndReviews.findOne({
            user: userid,
            course: courseId
        })

        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "Course is already reviewed by the user "
            })
        }
        //create the rating and review 
        const ratingReview = await RatingAndReviews.create({
            user: userid,
            course: courseId,
            rating: rating,
            reviews: reviews

        })

        //update the course with rating and reviews 

        const updatedCourseDetails = await Course.findByIdAndUpdate({
            _id: courseId
        },
            {
                $push: {
                    RatingAndReviews: ratingReview._id
                }
            },
            {
                new: true
            }


        );
        console.log(updatedCourseDetails);

        return res.status(200).json({
            success: true,
            message: "Rating and Reviws created Successfully !",
            ratingReview

        })


    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAverageRating=async(req,res)=>{
    try{
        //get Course ID  
        const courseId=req.body.courseId;
        //Calcuate avg Rating 

         const result=await RatingAndReviews.aggregate([
            {
               $match:{
                course:new mongoose.Types.ObjectId(courseId)
               }
            },
            {
               $group:{
                _id:null,
                averageRating:{
                    $avg:"$rating",
                }
               }
            }
         ])

         if(result.length>0)
         {
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating
            })
         }
   
         return res.status(200).json({
            success:true,
            message:"Average rating is 0 , no ratings given till now",
            averageRating:0
         })



    }
    catch(error)
    {
        console.log(error);
        return res.status(200).json({
            success:true,
            message:error.message
        })
    }
}

exports.getAllRating=async(req,res)=>{
    try{

        const allReviews=await RatingAndReviews.find({})
                               .sort({rating:"desc"})
                               .populate({
                                path:"user",
                                select:"firstname lastname email image"
                               })
                               .populate({
                                path:"course",
                                select:"courseName"
                               })
                               .exec();

        return res.status(200).json({
            success:true,
            message:"All reviews fetched Successfully",
            data:allReviews
        })

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
