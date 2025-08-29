const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const otpgenerator = require("otp-generator");
const otpTemplate = require("../mail/template/emailVerification");
const { mailSender } = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/template/passwordUpdated");

exports.signup = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      accountType,
      confirmPassword,
      contactNo,
      otp,
    } = req.body;

    if (!firstname || !lastname || !email || !password || !confirmPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered. Please log in",
      });
    }

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileDetails = await Profile.create({
      dateOfBirth: "",
      about: "",
      phoneNo: "",
      gender: "",
    });

    const user = await User.create({
      firstname,
      lastname,
      email,
      contactNo,
      password: hashedPassword,
      additionalDetails: profileDetails._id, // Fixed typo
      accountType,
      image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstname}${lastname}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
    });

    console.log("User created:", user.email); // Debug
    return res.status(200).json({
      success: true,
      user,
      message: "User successfully registered",
    });
  } catch (error) {
    console.error("❌ Signup error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const existingUser = await User.findOne({ email }).populate("additionalDetails");
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not registered. Please sign up",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(password, existingUser.password);
    if (!checkPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser._id,
        accountType: existingUser.accountType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Generated token for user:", existingUser.email); // Debug
    existingUser.token = token;
    existingUser.password = undefined;

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    return res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user: existingUser,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const checkExistingUser = await User.findOne({ email });
    if (checkExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered. Please log in",
      });
    }

    let otp = otpgenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await OTP.findOne({ otp });
    while (result) {
      otp = otpgenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp });
    }

    const payload = { email, otp };
    const otpBody = await OTP.create(payload);
    console.log("Generated OTP for:", email); // Debug

    try {
      const emailTemplate = otpTemplate(otp);
      await mailSender(email, "OTP Verification - Gyaan Shaala", emailTemplate);
      console.log("OTP email sent to:", email); // Debug
    } catch (emailError) {
      console.error("❌ Error sending OTP email:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("❌ Send OTP error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    try {
      await mailSender(
        updatedDetails.email,
        "Password Updated - Gyaan Shaala",
        passwordUpdated(
          updatedDetails.email,
          `Password updated successfully for ${updatedDetails.firstname} ${updatedDetails.lastname}`
        )
      );
      console.log("Password update email sent to:", updatedDetails.email); // Debug
    } catch (emailError) {
      console.error("❌ Error sending password update email:", emailError.message);
      return res.status(500).json({
        success: false,
        message: "Error sending password update email",
        error: emailError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("❌ Change password error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: error.message,
    });
  }
};