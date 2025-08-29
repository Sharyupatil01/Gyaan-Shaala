const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payment");
const contactUsRoutes = require("./routes/Contact");
const courseRoute = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileupload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 4000;
database.connect();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}))

app.use(
    fileupload({
        useTempFiles: true,
        tempFileDir: "/tmp"
    })
);
cloudinaryConnect();

//routes 
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoutes);

//def route 

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server is up and running ...."
    });
});

app.listen(PORT, () => {
    console.log(`App is listening on the PORT ${PORT}`);

})
