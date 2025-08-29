const express=require("express");
const router=express.Router();

//course controller import 

const {
      createCourse,
      getAllCourses,
      getFullCourseDetails,
      getInstructorCourses,

}=require("../controllers/Course");

//Categories Controllers Import 

const {createCategory,getAllCategories,categoryPageDetails}=require("../controllers/Category");

//Section Controller Import 

const {createSection,updateSection,deleteSection}=require("../controllers/Section");


//subSection Controller Import 


const {createSubSection,updateSubSection,deleteSubSection}=require("../controllers/SubSection");

const {createRatings,getAverageRating,getAllRating}=require("../controllers/RatingAndReviews");

//courseProgress left 

//importing middlewares 

const {auth,isStudent,isAdmin,isInstructor}=require("../middlewares/auth");


router.post("/createCourse",auth,isInstructor,createCourse);

router.post("/addSection",auth,isInstructor,createSection);

router.post("/updateSection",auth,isInstructor,updateSection);

router.post("/deleteSection",auth,isInstructor,deleteSection);


router.post("/addSubSection",auth,isInstructor,createSubSection);

router.post("/editSubSection",auth,isInstructor,updateSubSection);

router.post("/deleteSubSection",auth,isInstructor,deleteSubSection);

router.get("/getAllCourses",getAllCourses);

router.get("/getFullCourseDetails",auth,getFullCourseDetails);

router.get("/getInstructorCourses",auth,isInstructor,getInstructorCourses);





// category routes(only for admin)

router.post("/createCategory",auth,isAdmin,createCategory);
router.get("/showAllCategories",getAllCategories);
router.get("/getCategoryPageDetails",categoryPageDetails);

//Rating and reviews 

router.post("/createRating",auth,isStudent,createRatings);

router.get("/getAverageRating",getAverageRating);

router.get("/getReviews",getAllRating);


module.exports=router;



