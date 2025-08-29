const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
dotenv.config();

exports.auth = async (req, res, next) => {
  try {
    // Extract token from cookies, body, or Authorization header
    const token =
      req.cookies.token ||
      req.body.token ||
      (req.header("Authorization") && req.header("Authorization").replace("Bearer ", ""));

    console.log("Received token:", token ? "Token present" : "No token"); // Debug

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found",
      });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Decoded JWT payload:", decode);
      req.user = decode; // Attach decoded payload to req.user
    } catch (error) {
      console.log("❌ Token verification failed:", error.message);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired, please log in again",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
        error: error.message,
      });
    }

    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while validating the token",
      error: error.message,
    });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });
    if (!userDetails || userDetails.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for students",
      });
    }
    next();
  } catch (error) {
    console.error("❌ Student middleware error:", error.message);
    return res.status(500).json({
      success: false,
      message: "User role can't be verified",
      error: error.message,
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });
    if (!userDetails || userDetails.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admin",
      });
    }
    next();
  } catch (error) {
    console.error("❌ Admin middleware error:", error.message);
    return res.status(500).json({
      success: false,
      message: "User role can't be verified",
      error: error.message,
    });
  }
};

exports.isInstructor = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });
    if (!userDetails || userDetails.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Instructor",
      });
    }
    next();
  } catch (error) {
    console.error("❌ Instructor middleware error:", error.message);
    return res.status(500).json({
      success: false,
      message: "User role can't be verified",
      error: error.message,
    });
  }
};