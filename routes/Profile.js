const express = require("express");
const router = express.Router();

const { auth, isInstructor } = require("../middlewares/auth");
const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
} = require("../controllers/Profile");


router.delete("/deleteProfile", auth, deleteAccount);
router.put("/updateProfile", auth, updateProfile);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);
router.get("/getUserDetails", auth, getAllUserDetails);

module.exports = router;