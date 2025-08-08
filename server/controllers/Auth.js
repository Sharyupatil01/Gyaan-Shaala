const User = require('../models/User');

const OTP = require("../models/OTP");

const otpgenerator = require("otp-generator");


const bcrypt = require("bcrypt");

const Profile = require('../models/Profile');

require("dotenv").config();
const jwt = require("jsonwebtoken");
const mailSender = require('../utils/mailSender');







exports.signup = async (req, res) => {
    try {
        //destructure the fields from signup ui 
        const {
            firstname,
            lastname,
            email,
            password,
            acoountType,
            additonalDetails,
            confirmPassword,
            contactNo,
            otp

        } = req.body;

        // check if all details are validate 

        if (!firstname || !lastname || !email || !password || !confirmPassword || !otp) {
            return res.statuc(403).json({
                success: false,
                message: `Please fill all the details !`
            })
        }

        //checking the password and confirm password are matching 
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: `Passwords are mismatched ! try again `
            })
        }

        // checking if the user already exist in User Schema db 

        const existingUser = await User.find({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: `Alreeady registered ! try to login `
            })
        }

        //get the most recent otp of user from the OTP Schema db 
        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(response);

        //validate the otp

        if (response.length === 0) {
            return res.status(400).json({
                success: false,
                message: `OTP is not valid`
            })
        }
        else if (otp !== response.otp) {
            return res.status(400).json({
                success: false,
                message: `OTP is not valid`
            })
        }

        //hashing of password 

        const hashedPassword = await bcrypt.hash(password, 10);

        const ProfileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNo: null



        })

        const user = await User.create({
            firstname,
            lastname,
            email,
            contactNo,
            password: hashedPassword,
            additonalDetails: ProfileDetails._id,
            image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstname}${lastname}&backgroundColor=b6e3f4,c0aede,d1d4f9`


        })

        return res.status(200).json({
            success: false,
            message: `User successfully registered`
        })






    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: `User can't be register ! please retry`
        })
    }
}

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // check is the user is already register 
        // is yes message then that then have already the registered user 
        // hence ->> login 
        const CheckExistingUser = await User.find({ email });

        if (CheckExistingUser) {
            return res.status(401).json({
                message: "User is already registered ! try to login",
                success: false
            })
        }
        var otp = otpgenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,

        })
        const result = await OTP.findOne({ otp: otp });
        console.log("Result is Generate OTP Func")
        console.log("OTP", otp)
        console.log("Result", result)

        // if the otp is already in the db
        // create new until the unique otp is generated 
        while (result) {
            otp = otpgenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,


            })

        }
        const payload = { email, otp };
        const otpBody = await OTP.create(payload);
        console.log(`OTP BODY `, otpBody);
        res.status(200).json({
            success: true,
            message: "OTP Send Successfully",
            otp
        })



    }
    catch (error) {

        return res.status(500).json({
            message: `error.message`,
            success: false
        })
    }
}


exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: `Fill all the details`
            })
        }

        //find the user exist 

        const existingUser = await User.find({ email }).populate("additionalDetails");

        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: `User is not registered ! Please signup to continue `
            })
        }

        // generate jwt token 
        if (await bcrypt.compare(password, existingUser.password)) {
            const token = jwt.sign(
                {
                    email: existingUser.email,
                    id: existingUser._id,
                    role: existingUser.role

                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h",
                }
            )
            // Save token to user document in database
            existingUser.token = token;
            existingUser.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                existingUser,
                message: `User login successfully`
            })
        }
        else {
            return res.status(400).json({
                success: false,
                message: `Passwords don't match ! try again`
            })

        }



    }
    catch (error) {
        // Return 500 Internal Server Error status code with error message
        console.log(error.message());

        return res.status(500).json({
            success: false,
            message: `Login failure try again`
        })
    }
}

exports.changePassword = async (req, res) => {

    try {
        const userDetails = await User.findById(req.user.id);

        // get the user details from user to compare the password 
        
        //destructure the old password and new password from the ui 

        const { oldPassword, newPassword } = req.body;

        //compare the old passowrd and new password 
        //by bcrpyt.compare method 

        const isPasswordMatch = await bcrypt.compare(
            oldPassword, userDetails.password
        );
        //if the oldpassword and password into db dont 
        //match return error (passwords dont match )
        if(!isPasswordMatch)
        {
            return res.status(401).json({
                success:false,
                message:`Passwords don't match ! try again`
            })
        }

        //hash the new encrypyed password 
        //update it into the db

        const encryptedPassword=await bcrypt.hash(newPassword,10);
        const updatedDetails=await User.findByIdAndUpdate(
            req.user.id,
            
            {password:encryptedPassword},
            {new:True}
            
        )

        //send the notification to user email id 
         try{
            const sendmail=await mailSender(
                updatedDetails.email,
                "Password for your Account has been updated",
                passwordUpdated(
                    updatedDetails.email,
                    `Password updated successfully for ${updatedDetails.firstname} ${updatedDetails.lastname}`
                )
            )
            console.log("Email sent Successfully !!",sendmail.response);

         }
         catch(error)
         {
            console.log(error.message());
            return res.status(500).json({
                success:false,
                message:`Error occured while sending the email`
            })
         }
         return res.status(200).json({
            success:true,
            message:`User password is updated succesfully !`
         })
         
    }
    catch (error) {
        console.error(error.message());
        return res.status(500).json({
            success:false,
            message:`Error occured while updating the password`,
            error:error.message,
            
        })

    }
}