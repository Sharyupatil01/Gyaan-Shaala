const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");

const mailSender = require("../utils/mailSender");
const crypto = require("crypto");
const mongoose = require("mongoose");
const CourseProgress = require("../models/CourseProgress");
const { paymentSuccessEmail } = require("../mail/template/paymentSuccessEmail");

const { courseEnrollmenEmail } = require("../mail/template/courseEnrollmentEmail");

exports.capturePayment = async (req, res) => {

    const { courses } = req.body;
    const userid = req.user.id;
    if (courses.length === 0) {
        return res.json({
            success: false,
            message: `please provide course id`
        })
    }
    let total_amount = 0;
    for (const course_id of courses) {
        let course
        try {
            //find the course id of course 
            course = await Course.findById(course_id);

            //if the course is not found,return an error

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: "Could not find the course"
                })
            }

            //check if the user already entrolled for the course 

            const uid = new mongoose.Types.ObjectId.createFromHexString(userid);


            if (course.studentsEnrolled.includes(uid)) {
                return res.status(200).json(
                    {
                        success: true,
                        message: "Student is already enrolled"
                    }
                )
            }

            //if not enrolled then add the amount of money 
            total_amount += course.price;
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

    const options = {
        amount: total_amount * 100,
        currency: "INR",
        receipt: Math.random(Date.now()).toString(),

    }
    try {
        //inititate the payment using Razorpay 
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        res.json({
            success: true,
            data: paymentResponse,
        })


    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Could not initate order."
        })
    }



}

exports.verifyPayment = async (req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id
    const razorpay_payment_id = req.body?.razorpay_payment_id
    const razorpay_signature = req.body?.razorpay_signature
    const courses = req.body?.courses;

    const userid = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userid) {
        return res.status(200).json
            ({
                success: true,
                message: "Payment Failed"
            })
    }
    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const exceptedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (exceptedSignature === razorpay_signature) {
        await enrollStudents(courses, userid, res);
        return res.status(200).json({
            success: true,
            message: "Payment Verified"
        })






    }
    return res.status(500).json({
        success: false,
        message: "Payment Failed"
    })

}
exports.sendPaymentSuccessEmail = async (req, res) => {

    const { orderid, paymentid, amount } = req.body;
    const userid = req.user.id;

    if (!orderid || !paymentid || !amount || !userid) {
        return res.status(400).json({
            succes: false,
            message: "Please provide all the details"
        })
    }


    try {

        //find the data of entrolled user (studeny)
        const enrolledStudent = await User.findById(userid);
        await mailSender(
            enrolledStudent.email,
            `Payment Received`,
            paymentSuccessEmail(
                `${enrolledStudent.firstname} ${enrolledStudent.lastname}`,
                amount / 100,
                orderid,
                paymentid
            )
        )

    }
    catch (error) {
        console.log("Error in sending email", error);
        return res.status(400).json({
            success: false,
            message: "Could not send email"
        })
    }
}

const enrollStudents = async (courses, userid, res) => {
    if (!courses || !userid) {
        return res.status(400).json({
            success: false,
            message: "Please provide course id and user id"
        })
    }
    for (const course_id of courses) {
        try {
            const courseEnrolled = await Course.findByIdAndUpdate(
                { _id: course_id },
                {
                    $push: {
                        studentsEnrolled: userid
                    }
                },
                {
                    new: true
                }
            )
            if (!courseEnrolled) {
                return res.status(500).json({
                    success: false,
                    error: "Course not found"
                })
            }
            console.log("updatedCourse", courseEnrolled);

            const courseProgress = await CourseProgress.create({
                courseId: course_id,
                userId: userid,
                completedVideos: [],





            })

            const enrolledStudent = await User.findByIdAndUpdate(
                userid,
                {
                    $push: {
                        courses: course_id,
                        courseProgress: courseProgress._id,


                    }
                },
                {
                    new: true
                }

            )
            console.log("Enrolled Student .....................................:");

            //send an email notification to the entrolled student 
            const emailResponse = await mailSender(
                enrolledStudent.email,
                `Successfully enrolled into ${courseEnrolled.courseName}`,
                courseEnrollmenEmail(
                    courseEnrolled.courseName,
                    `${enrolledStudent.firstname} ${enrolledStudent.lastname}`
                )
            )
            console.log("Email send successfully", emailResponse.response);
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({
                success: false,
                error: error.message
            })
        }
    }
}

