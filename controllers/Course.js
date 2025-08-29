const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");
const CourseProgress=require("../models/CourseProgress");
const Section=require("../models/Section");
const SubSection=require("../models/SubSection");

const { imageUploader } = require("../utils/imageUploader");

exports.createCourse = async (req, res) => {
    try {
        //get user id from the req body 
        const userId = req.user.id;
        //get all required fields that are request body 
        let { courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag:_tag,
            category,



        } = req.body;



        //get thumbnail image from request files 
        const thumbnail = req.files.thumbnailImage;

        const tag=JSON.parse(_tag);


        if (!courseName || !category ||!courseDescription || !whatYouWillLearn || !price || !thumbnail || !tag.length) {
            return res.status(400).json({
                success: false,
                message: `All fields are Mandatory`
            })
        }

        //check if the user is an instructor 
        const instructorDetails = await User.findById(userId, {
            accountType: "Instructor"
        })

        if (!instructorDetails) {
            return res.status(400).json({
                success: false,
                message: `You are not an Instructor , You can't create a course `
            })
        }

        //checl if the tag given is valid tag 

        const CategoryDetails = await Category.findById(category);
        if (!CategoryDetails) {
            return res.status(400).json({
                success: false,
                message: `Category is not valid `
            })
        }

        //upload the thumbnail image to cloudinary and get the url of the image 
        const thumbnailUrl = await imageUploader(thumbnail, process.env.FOLDER_NAME);

        console.log(thumbnailUrl);

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instrutor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag,
            category: CategoryDetails._id,
            thumbnail: thumbnailUrl.secure_url,




        })

        //add the updates new course to user schema 
        await User.findByIdAndUpdate(
            {
                _id: instructorDetails._id

            },
            {
                $push: {
                    course: newCourse._id,
                },
            },
            {
                new: true
            }
        )
        await Category.findByIdAndUpdate(
            {
                _id: category
            },
            {
                $push: {
                    course: newCourse._id
                }
            },
            {
                new: true
            }
        );

        res.status(200).json({
            success: true,
            data: newCourse,
            message: `Course is created successfully`
        });





    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Failed while creating course`
        })
    }
}


exports.getAllCourses=async(req,res)=>{
    try{
        const allCourses=await Course.find({},
            {
                courseName:true,
                price:true,
                thumbnail:true,
                instrutor:true,
                RatingAndReviews:true,
                studentsEnrolled:true
            }
        )
        .populate("instructor")
        .exec();

        return res.status(200).json({
            success:true,
            data:allCourses
        })
    }
    catch(error)
    {
      
        return res.status(500).json({
            success:false,
            message:`Failed while getting all courses`
        })
    }
}

exports.getFullCourseDetails=async(req,res)=>{
    try{
        const {courseid}=req.body;
        const userid=req.user.id;
        const courseDetails=await Course(
            {_id:courseid},

        )
        .populate({
            path:"instrutor",
            populate:{
                path:"additionalDetails"
            }
        })
        .populate("category") //course category
        .populate("ratingAndReviews")
        .populate({
            path:"courseContent", //section
            populate:{
                path:"subSection"  //subsection
            }

        }).exec();

        let courseProgressCount=await CourseProgress.findOne({
            courseId:courseid,
            userID:userid
        })
        console.log("CourseProgressCount:" ,courseProgressCount);


        if(!courseDetails)
        {
            return res.status(400).json({
                success:false,
                message:`Course coult not be find with id :${courseid}`
            
            })
        }

        return res.status(200).json({
            success:true,
            data:{
                courseDetails,
                message:"All the course Full details are fetched"
               
            }
        })


    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getInstructorCourses=async(req,res)=>{
    try
    {
       const instructorid=req.user.id;

       const instructorCourses=await Course.find({
        instrutor:instructorid,

       }).sort({createdAt:-1})

       return res.status(200).json({
        success:true,
        data:instructorCourses
       })
    }
    catch(error)
    {
         console.log(error);
         res.status(500).json({
            success:false,
            message:"Failed to retrieve instructor courses",
            error:error.message


         })
    }
}




