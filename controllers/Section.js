const Section = require("../models/Section");
const Course = require("../models/Course");

const SubSection=require("../models/SubSection");

exports.createSection = async (req, res) => {
    try {
        const { sectionName, courseId } = req.body;

        //validate the data from req body 
        if (!sectionName || !courseId) {
            return res.status(401).json({
                success: false,
                message: `Please fill all the details`
            })
        }
        const newSection = await Section.create({ sectionName });

        const updatedCourse = await Course.findByIdAndUpdate(courseId,
            {
                $push: {
                    courseContent: newSection._id
                }


            }
            ,
            {
                new: true
            }
        )
            .populate({
                path: "courseContent",//section populate 
                populate: {
                    path: "subSection",//sub section populate

                }
            })
            .exec();

        return res.status(200).json({
            success: true,
            message: `Section is created successfully`,
            updatedCourse,
        })


    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to create section`,
            error: error.message
        })
    }
}
exports.updateSection = async (req, res) => {
    try {
        //get the data from req body
        const { sectionName, sectionId, courseId } = req.body;

        //validate the data from req body 
        if (!sectionName || !sectionId) {
            return res.status(401).json({
                success: false,
                message: `Please fill all the details`,

            })
        }

        //update the section 
        const updatedSection = await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true });

        //update the course 
        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",//section populate 
                populate: {
                    path: "subSection",
                }//sub section populate
            }).exec();

        res.status(200).json({
            success: true,
            message: updatedSection,
            data: course,
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to update section`,
            error: error.message
        })
    }



};

exports.deleteSection =async(req,res)=>{
    try{
          const{sectionId,courseId}=req.body;
          await Course.findByIdAndUpdate(courseId,{
            $pull:{
              courseContent:sectionId
            }
          })

          const section=await Section.findById(sectionId);
          console.log(sectionId,courseId);
          if(!section)
          {
            return res.status(404).json({
                success:false,
                message:`Section not found`
            })
          }

          //delete the sub-Section 
          await SubSection.deleteMany({_id:{$in:section.subSection}});

          await Section.findByIdAndDelete(sectionId);

          const course=await Course.findById(courseId)
            .populate({
                path: "courseContent",//section populate 
                populate: {
                    path: "subSection",
                }//sub section populate
            }).exec();


            res.status(200).json({
                success:true,
                message:"Section deleted",
                data:course

            });
        }
    catch(error)
    {
        console.log("Error deleting Section" ,error);
        res.status(500).json({
            success:false,
            message:`Failed to delete section`,
            error:error.message
        })
    }
}