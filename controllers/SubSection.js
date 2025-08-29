const Section = require("../models/Section");
const SubSection = require("../models/SubSection");

const { imageUploader } = require("../utils/imageUploader");

exports.createSubSection = async (req, res) => {
    try {
        const { sectionId, title, description } = req.body;
        const video = req.files.video;

        //validate the data from req body 
        if (!sectionId || !title || !description || !video) {
            return res.statius(404).json({
                success: false,
                message: `Please fill all the details`
            })
        }

        console.log(video);

        const uploadDetails = await imageUploader(video, process.env.FOLDER_NAME);
        console.log(uploadDetails);

        //creeate a new subsection with the necessary information 

        const newSuSectionDetails=await SubSection.create(
            {
                title:title,
                description:description,
                duration:`${uploadDetails.duration}`,
                videoUrl:uploadDetails.secure_url,
                
            }
        )

        //update the corresponding enter into the section

        const  updatedSection=await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $push:{
                    subSection:newSuSectionDetails._id
                }
            },
            {
                new:true
            }
        
        ).populate("subSection")

        return res.status(200).json({
            success:true,
            message:`Subsection is created successfully`,
            data:updatedSection
        })




    }
    catch (error) {
        return res.status(500).json({
            success:false,
            message:`Failed to create Subsection`,
            error:error.message
        })
    }
}

exports.updateSubSection=async(req,res)=>{
    try{

        const {sectionId,subSectionId,title,description}=req.body;

        const subsection=await SubSection.findById(subSectionId);

        if(!subsection)
        {
            return res.status(404).json({
                success:false,
                message:"Subsection is not found"
            })
        }

        //validating the title 
        if(title!==undefined)
        {
            subsection.title=title;
        }
        if(description!==undefined)
        {
            subsection.description=description;
        }

        if(req.files && req.files.video!==undefined)
        {
            const video=req.files.video;
            const uploadDetails=await imageUploader(video,process.env.FOLDER_NAME);
            subsection.videoUrl=uploadDetails.secure_url;
            subsection.duration=`${uploadDetails.duration}`;
        }

        await subsection.save();

        //find the updated section and update it 

        const updatedSection=await Section.findById(sectionId).populate("subSection");

        console.log("updated Section",updatedSection);

        return res.status(200).json({
            success:true,
            message:`Subsection is updated successfully`,
            data:updatedSection
        })



    }
    catch(error)
    {
        return res.status(500).json(
            {
                success:false,
                message:`Failed to update subsection`,
                error:error.message
                
            }
        )
    }
}

exports.deleteSubSection=async(req,res)=>{
    try{
        const {sectionId,subSectionId}=req.body;

        await Section.findByIdAndDelete(
            {_id:sectionId},
            {
                $pull:{
                    subSection:subSectionId,
                }
            },
           
        )
        const subSection =await SubSection.findByIdAndDelete(subSectionId);

        if(!subSection)
        {
            return res.status(404).json({
                success:false,
                message:"Subsection is not found"
            })
        }

        const updatedSection=await Section.findById(sectionId).populate("subSection");

        return res.status(200).json({
            success:true,
            message:"Subsection is deleted successfully",
            data:updatedSection
        })

    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:`Failed while deleting the Subsection !!! try again`
        })
    }
}
