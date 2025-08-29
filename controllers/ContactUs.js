const { contactUsEmail } = require("../mail/template/contactForm");

const mailSender = require("../utils/mailSender");

exports.contactUs = async (req, res) => {

    const { email, firstname, lastname, message, phoneNo, countrycode } = req.body;
    console.log(req.body);
    try {
        const emailres = await mailSender(
            email,
            "Your Data send Successfully",
            contactUsEmail(
                email, firstname, lastname, message, phoneNo, countrycode
            )

        )
        console.log("Email res", emailres);
        return res.json({
            success: true,
            message: "Email send successfully!"
        })
    }
    catch (error) {
        console.log("Error", error.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong..!"
        })
    }
}

