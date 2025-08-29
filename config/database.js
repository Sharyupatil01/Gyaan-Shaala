const mongoose=require("mongoose");
require("dotenv").config();

exports.connect=()=>{
    mongoose.connect(process.env.MONGODB_URL,{})
    .then(()=>{
        console.log("database is connected succesfully ");
    })
    .catch((error)=>{
        console.log(error);
        console.log("failed to connect with database");
         process.exit(1);
    })
};
