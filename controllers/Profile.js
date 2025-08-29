const Profile = require("../models/Profile");
const Course = require("../models/Course");
const User = require("../models/User");
const { imageUploader } = require("../utils/imageUploader");
const CourseProgress = require("../models/CourseProgress");

exports.updateProfile = async (req, res) => {
  try {
    const {
      firstname = "",
      lastname = "",
      dateOfBirth = "",
      about = "",
      phoneNo = "",
      gender = "",
    } = req.body;
    const id = req.user.id;

    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profile = await Profile.findById(userDetails.additionalDetails); // Fixed typo
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    await User.findByIdAndUpdate(id, { firstname, lastname }, { new: true });
    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.phoneNo = phoneNo;
    profile.gender = gender;
    await profile.save();

    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUserDetails,
    });
  } catch (error) {
    console.error("❌ Profile update error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed while updating profile",
      error: error.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;
    console.log("Deleting account for user ID:", id); // Debug
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Profile.findByIdAndDelete(user.additionalDetails); // Fixed typo
    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnrolled: id } },
        { new: true }
      );
    }

    await CourseProgress.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("❌ Account deletion error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed while deleting account",
      error: error.message,
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Fetched user details:", userDetails.email); // Debug
    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    console.error("❌ User details fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed while getting user details",
      error: error.message,
    });
  }
};

exports.updateDisplayPicture = async (req, res) => {
  try {
    if (!req.user) {
      console.error("❌ No user in req.user");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user.id;
    console.log("Updating display picture for user ID:", userId); // Debug
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const Image = req.files.image;
    const uploadDetails = await imageUploader(
      Image,
      process.env.FOLDER_NAME,
      1000,
      1000,
      80
    );
    console.log("Image upload details:", uploadDetails.secure_url); // Debug

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: uploadDetails.secure_url },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("❌ Display picture update error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile image",
      error: error.message,
    });
  }
};