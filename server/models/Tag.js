const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
   name:{
      type:String,
      required:true,
   },
   description:{
    type:String,
    rrquired:true,
   },
   course:[
   {
      type:mongoose.Schema.Types.ObjectId,
      required:true,
      ref:"Course"
   }
   ]
});

module.exports = mongoose.model('Tag', TagSchema);