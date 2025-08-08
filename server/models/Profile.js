const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
   gender: {
      type: String
   },
   dateOfBirth: {
      type: String
   },
   about: {
      type: String
   },
   phoneNo: {
      type: String
   }
})
module.exports = mongoose.model("Profile", ProfileSchema);
