const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const otpTemplate=require("../mail/template/emailVerification");


const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,

        default: Date.now(),
        expires: 5 * 60,
    }
});
//
async function sendEmailVerification(email, otp) {
    try {
        const mailresponse = await mailSender(email, "Verification mail", otpTemplate(otp));
        console.log("Email sent successfully", mailresponse);

    }
    catch (error) {
        console.log("Error While sendinf verification mail", error.message());
        throw error;
    }
}
OTPSchema.pre('save', async function (next) {
    if(this.isNew)
    {
    await sendEmailVerification(this.email, this.otp);
    }
    next();
})



module.exports = mongoose.model('OTP', OTPSchema);