const User=require("../models/User");
const mailSender=require("../utils/mailSender");

const bcrypt=require("bcrypt");

const crypto=require("crypto");

exports.resetPasswordToken=async(req,res)=>{
    try{
           
        const email=req.body.email; ///not same line as sir 
        const user=await User.findOne({email:email});

        if(!user)
        {
            return res.json({
                success:false,
                message:`This Email :${email} is not Registered with us Enter a valid Email`
            })
        }

        const token=crypto.randomBytes(20).toString("hex");

        const updatedDetails=await User.findOneAndUpdate(
            {email:email},
            {
                token:token,
                resetPasswordExpiry:Date.now()+3600000,
            },
            {
                new:true
            }

        )

        console.log("DETAILS OF UPDATED USER DB :",updatedDetails);

        const url=`http://localhost:3000/update-password/${token}`;

        await mailSender(
            email,
            "Password Reset",
            `Your Link for email verification is ${url} .Please click this url to reset your password`
        );
        res.json({
            succces:true,
            message:"Email Sent Successfully,Please check your email to continue Further"
        });


    }
    catch(error)
    {
      return res.status(500).json({
        success:false,
        error:error.message,
        message:`Some error in sending the reset message`
      })
    }
}

exports.resetPassword=async(req,res)=>{
    try{
         const {password,confirmPassword,token}=req.body;

         if(confirmPassword!==password)
         {
            return res.json({
                success:false,
                message:`Password and confirm password Don't match Please try again`
            });
         }
         const userDetails=await User.findOne({token:token});

         if(!userDetails)
         {
            return res.json({
                success:false,
                message:`Token is invalid`
            });
         }
         if(userDetails.resetPasswordExpiry < Date.now())
         {
            return res.status(403).json({
                success:false,
                message: `Token is expired , Please regenerate Your token `
            });
         }
         const encryptedPassword=await bcrypt.hash(password,10);
         await User.findOneAndUpdate(
            {token:token},
            {password:encryptedPassword},
            {new:true}
         );
         return res.json({
            success:true,
            message:`Password Reset Successfully !`
         })
    }
    catch(error)
    {
         return res.json({
            error:error.message,
            success:false,
            message:`Some error in updating the password`
         })
    }
}