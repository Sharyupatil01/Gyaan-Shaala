const mongoose = require('mongoose');

const RatingAndReviewsSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    rating:{
        type:Number,
        required:true,
    },
    reviews:{
        type:String,
    
    }
        
});

module.exports = mongoose.model('RatingAndReviews', RatingAndReviewsSchema);