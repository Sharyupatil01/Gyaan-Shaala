const express=require("express");
const router=express.Router();

const {login,signup,sendOtp,changePassword}=require("../controllers/Auth");

const {resetPasswordToken,resetPassword}=require("../controllers/ResetPassword");

const {auth}=require("../middlewares/auth");

//Authentication Routes 

//Route for the user loginn
router.post("/login",login);

router.post("/signup",signup);

router.post("/sendOtp",sendOtp);

router.post("/changePassword",auth,changePassword);

//reset password 

router.post("/reset-password-token",resetPasswordToken);

router.post("/reset-password",resetPassword);

module.exports=router;


