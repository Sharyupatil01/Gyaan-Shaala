
const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
    try {
        //fetch the data
        const { name, description } = req.body;
        //validate the data 
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: `please fill all the details`
            })
        }
        //if data is validates 
        //create the entry in database 
        const Categorydetails = await Category.create({
            name: name,
            description: description

        })
        console.log(Categorydetails);

        return res.success(200).json({
            success: true,
            message: `${name} Tag is added successfully`
        })


    }
    catch (error) {
        console.log("Error while adding the Tag")
        return res.status(500).json({
            success: false,
            message: error.message,

        })
    }
}

exports.getAllCategories = async (req, res) => {
    try {
        const AllCategory = await Category.find({}, {
            name: true,
            description: true
        })
        return res.status(200).json({
            success: true,
            message: `All the tags are sucessfully returned`,
            AllCategory,

        })
    }
    catch (error) {
        console.log(error.message());

        return res.status(500).json({
            success: false,
            message: `Failed while getting all tags`
        })
    }
}

exports.categoryPageDetails = async (req, res) => {
    try {
        const { categoryid } = req.body;
        const selectedCategoryCourse = await Category.findById(categoryid)
            .populate({
                path: "course",
                populate: "RatingAndReviews"
            })
            .exec();


        if (!selectedCategoryCourse) {

            console.log("category not found.")
            return res.status(400).json({
                success: false,
                message: "Category is not found!"
            })
        }

        //handle the case when there is no course 
        if (selectedCategoryCourse.length === 0) {
            console.log("No courses found for the given category");
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category"
            })
        }
        //get courses for other categories 
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryid },
        })

        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]._id
        ).populate({
            path: "course",
            //todooooo
        }).exec();

        //get top selling courses across all categories 

        const allCategories = await Category.find()
            .populate({
                path: "course",
                populate: {
                    path: "instructor"
                }
            }).exec();

        const allcourses = allCategories.flatMap((category) => category.course)
        ///doubtssssssssssssss
        const mostSellingCourses = allcourses.sort((a, b) => b.studentsEnrolled - a.studentsEnrolled).slice(0, 10);



        return res.status(200).json({
            success: true,
            data: {
                selectedCategoryCourse,
                differentCategory,
                mostSellingCourses
            }
        })

    }
    catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}


