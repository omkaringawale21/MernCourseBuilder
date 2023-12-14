const express = require("express");
const userCollections = require("../Models/User.js");
const paymentCollection = require("../Models/PaymentDetails.js");
const requestCollection = require("../Models/NewRequestCourse.js");
const contactCollection = require("../Models/ContactUs.js");
const adminCollection = require("../Models/Admin.js");
const { v4 } = require("uuid");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const ImageMiddleware = require("../Middleware/ImageMiddleware.js");
const TokenAuthenMiddleware = require("../Middleware/TokenAuthenMiddleware.js");
const VideoMiddleware = require("../Middleware/VideoMiddleware.js");
const GoogleMiddleware = require("../Middleware/GoogleMiddleware.js");
const nodemailer = require("nodemailer");

const router = express.Router();

// Resgister User
router.post("/registerdetails", ImageMiddleware.single("image"), async (request, response) => {
    const { fname, email, mobNum, password, role } = request.body;
    const image = request.file ? request.file.filename : null;

    try {
        const preUserEmail = await userCollections.findOne({ email: email });
        const preUserMobile = await userCollections.findOne({ mobNum: mobNum });

        if (preUserEmail) {
            response.status(422).json({ message: "this user is already present!", status: 422 });
        } else if (preUserMobile || mobNum.length < 10 || mobNum.length > 10) {
            response.status(422).json({ message: "invalid mobile number!", status: 422 });
        } else if (!fname || !email || !mobNum || !password) {
            response.status(422).json({ message: "please fill this!", status: 422 });
        } else {
            const userData = new userCollections({
                fname: fname,
                email: email,
                mobNum: mobNum,
                password: password,
                image: image,
                role: role,
            });

            await userData.save();

            response.sendStatus(201);
        }
    } catch (error) {
        response.status(404).json({ message: "please fill this!", status: 404 });
    }
});

// Login User
router.post("/logindetails", async (request, response) => {
    const { email, password } = request.body;

    if (!email || !password) {
        response.status(422).json({ message: "please fill this!", status: 422 });
    } else {
        try {
            const userEmail = await userCollections.findOne({ email: email });
            const admin = await userCollections.findOne({ email: email, role: "admin" });

            if (userEmail) {
                const isMatch = await bcrypt.compare(password, userEmail.password);

                // Comparing Password
                if (!isMatch) {
                    response.status(422).json({ message: "Invalid Password!", status: 422 });
                } else {
                    // Generating Token
                    const token = await userEmail.genUserAuthentication();

                    // Generating cookie 1 day miliseconds (15 mins miliseconds 900000)
                    response.cookie("udemycookie", token, {
                        expires: new Date(Date.now() + 86400000),
                        httpOnly: true,
                    })

                    admin &&
                        response.status(201).json({ message: "this is an Admin!", status: 200, thisAdmin: true, data: userEmail, profile: true, });
                    !admin &&
                        response.status(201).json({ message: "this is not Admin!", status: 200, thisAdmin: false, data: userEmail, profile: true, });
                }
            } else {
                response.status(422).json({ message: "Invalid Email ID!", status: 422 });
            }
        } catch (error) {
            response.status(404).json({ message: "Invalid Details!", status: 404 });
        }
    }
});

// Get Profil Details Of Users
router.get("/profile/userdetails", TokenAuthenMiddleware, async (request, response) => {
    try {
        const user = await userCollections.findOne({ _id: request.userId });

        response.status(201).json({ user: user, message: "Data get", status: 201, profile: true });
    } catch (error) {
        response.status(404).json({ message: "can not get details!", status: 404, profile: false });
    }
});

// Get User Details In Dashboard When Its Admin
router.get("/dashboard/userdetails", TokenAuthenMiddleware, async (request, response) => {
    try {
        const user = await userCollections.find();

        response.status(201).json(user);
    } catch (error) {
        response.status(404).json({ message: "can not get details!", status: 404 });
    }
});

// Set Role Of User (User OR Admin)
router.post("/dashboard/userdetails/:id", TokenAuthenMiddleware, async (request, response) => {
    try {
        const id = request.params.id;
        const role = request.body;

        const user = await userCollections.updateOne(
            { _id: id },
            { $set: { "role": String(role.role) } }
        );

        response.status(201).json({ message: "changed role", status: 201, user: user });
    } catch (error) {
        response.status(404).json({ message: "can not change role!", status: 404 });
    }
});

// Get User Details
router.delete("/dashboard/userdetails/:id", TokenAuthenMiddleware, async (request, response) => {
    try {
        const id = request.params.id;

        const user = await userCollections.deleteOne({ _id: id });

        response.clearCookie("udemycookie", {
            path: "/",
        })

        response.status(201).json({ message: "deleted user", status: 201, user });
    } catch (error) {
        response.status(404).json({ message: "can not deleted user!", status: 404 });
    }
});

// Logout User
router.get("/logout", TokenAuthenMiddleware, async (request, response) => {
    try {
        request.rootUser.tokens = request.rootUser.tokens.filter((currentToken) => {
            return currentToken.token !== request.token;
        })

        response.clearCookie("udemycookie", {
            path: "/",
        })

        request.rootUser.save();
        response.status(201).json({ message: "user loged out successfully", status: 201, thisAdmin: false, profile: false, });
    } catch (error) {
        response.status(404).json({ message: "user can not loged out successfully!", status: 404, thisAdmin: false, profile: false, });
    }
});

// Create New Course
router.post("/admin/dashboard/create_course", ImageMiddleware.single("courseImg"), async (request, response) => {
    const { courseTitle, courseDescription, courseCreater, courseCategory, coursePrice, courseDiscount } = request.body;
    const image = request.file ? request.file.filename : null;

    try {
        if (!courseTitle || !courseDescription || !courseCreater || !courseCategory || !coursePrice || !courseDiscount) {
            response.status(422).json({ message: "please fill this!", status: 422 });
        } else {
            const admin = new adminCollection({
                courseTitle: courseTitle,
                courseDescription: courseDescription,
                courseCreater: courseCreater,
                courseCategory: courseCategory,
                coursePrice: coursePrice,
                courseDiscount: courseDiscount,
                courseImg: image,
                courseid: v4(),
            });

            await admin.save();
            response.sendStatus(201);
        }
    } catch (error) {
        response.status(404).json({ message: "course not added successfully!", status: 404 });
    }
});

// Get Created All Courses
router.get("/admin/dashboard/create_course", TokenAuthenMiddleware, async (request, response) => {
    try {
        const data = await adminCollection.find({});

        response.status(201).json(data);
    } catch (error) {
        response.status(404).json({ message: "can not get data!", status: 404 });
    }
});

// View Specific Course
router.get("/admin/dashboard/view_course/:id", TokenAuthenMiddleware, async (request, response) => {
    try {
        const id = request.params.id;
        const data = await adminCollection.findOne({ courseid: id });

        response.status(201).json(data);
    } catch (error) {
        response.status(404).json({ message: "can not get data!", status: 404 });
    }
});

// Delete Specific Course
router.get("/admin/dashboard/delete_course/:id", TokenAuthenMiddleware, async (request, response) => {
    try {
        const id = request.params.id;
        const data = await adminCollection.deleteOne({ courseid: id });

        response.status(201).json(data);
    } catch (error) {
        response.status(404).json({ message: "can not get data!", status: 404 }); 2
    }
});

// Add Videos In Your That Specific Course
router.post("/admin/dashboard/add_video/:id", VideoMiddleware.single("videolist"), async (request, response) => {
    try {
        const id = request.params.id;
        const { videoTitle } = request.body;
        const video = request.file ? request.file.filename : null;

        const data = await adminCollection.updateOne(
            { courseid: id },
            { $addToSet: { "videolist": { "videoTitle": videoTitle, "videoUrl": video, "videoid": v4() } } }
        );

        response.status(201).json({ message: "Video Details Added", status: 201, data: data });
    } catch (error) {
        response.status(404).json({ message: "can not post data!", status: 404 });
    }
});

// Delete Video And Title
router.put("/admin/dashboard/remove_video/:id", TokenAuthenMiddleware, async (request, response) => {
    try {
        const id = request.params.id;
        const { videoid } = request.body;

        const data = await adminCollection.updateOne(
            { courseid: id },
            { $pull: { videolist: { videoid: videoid } } }
        );

        response.status(201).json({ message: "Video & Title Removed From Course Successfully.", status: 201, data: data });
    } catch (error) {
        response.status(404).json({ message: "video can not deleted!", status: 404 });
    }
});

// View course to candidate
router.get("/getallcourses", async (request, response) => {
    try {
        const courses = await adminCollection.find({});

        response.status(201).json(courses);
    } catch (error) {
        response.status(404).json({ message: "Courses can get!", status: 404 });
    }
});

// Update Profile Photo Of User
router.post("/profile/update/profilephoto", TokenAuthenMiddleware, ImageMiddleware.single("courseImg"), async (request, response) => {
    try {
        const userId = request.userId;
        const image = request.file ? request.file.filename : null;

        const data = await userCollections.updateOne(
            { _id: userId },
            { $set: { image: image } }
        );

        response.status(201).json({ message: "Profile photo updating successfully", status: 201, data: data });
    } catch (error) {
        response.status(404).json({ message: "Can not update profile photo", status: 404 });
    }
});

// Get Personal Info For Updating Personal Info
router.get("/profile/update/profile", TokenAuthenMiddleware, async (request, response) => {
    try {
        const userId = request.userId;

        const data = await userCollections.findById({ _id: userId });

        response.status(201).json(data);
    } catch (error) {
        response.status(404).json({ message: "Can not update profile info", status: 404 });
    }
});

// Successfully Updating Personal Info
router.post("/profile/update/av/details/profile_information", TokenAuthenMiddleware, async (request, response) => {
    try {
        const userId = request.userId;
        const { fname, email, mobNum } = request.body;

        if (!fname | !email | !mobNum) {
            response.status(422).json({ message: "Please Fill This!", status: 422 });
        } else if (mobNum.length < 10 || mobNum.length > 10) {
            response.status(422).json({ message: "Invalid Mobile Number!", status: 422 });
        } else {
            const data = await userCollections.updateOne(
                { _id: userId },
                { $set: { fname: fname, email: email, mobNum: mobNum } }
            );

            response.status(201).json({ message: "Profile photo updating successfully", status: 201, data: data });
        }
    } catch (error) {
        response.status(404).json({ message: "Can not update profile information", status: 404 });
    }
});

// Change Password Of User Or Admin
router.post("/profile/update/av/details/profile_information_password", TokenAuthenMiddleware, async (request, response) => {
    try {
        const userId = request.userId;
        const { password } = request.body;

        if (!password) {
            response.status(422).json({ message: "Please Fill This!", status: 422 });
        } else {
            const pass = await bcrypt.hash(password, 12);

            if (pass) {
                const details = await userCollections.findByIdAndUpdate(
                    { _id: userId },
                    { $set: { password: pass } }
                )

                response.status(201).json({ message: "Profile password updating successfully", status: 201, data: details });
            } else {
                response.status(404).json({ message: "Can not hash profile password", status: 404 });
            }
        }
    } catch (error) {
        response.status(404).json({ message: "Can not update profile password", status: 404 });
    }
});

// Add Course To PlayList
router.get("/add/course/av1/toplaylist/:courseid", TokenAuthenMiddleware, async (request, response) => {
    try {
        const courseId = request.params.courseid;
        const userId = request.userId;

        const courseExists = await userCollections.findOne(
            { _id: userId, "playlist.courseid": courseId },
        );

        if (courseExists) {
            response.status(404).json({ message: "Already course added in playlist!", status: 404 });
        } else {
            const course = await adminCollection.findOne({ courseid: courseId });

            const { courseTitle, courseDescription, courseCreater, courseCategory, coursePrice, courseDiscount, courseImg, videolist, courseid } = course;

            const user = await userCollections.updateOne(
                { _id: userId },
                {
                    $addToSet: {
                        playlist:
                        {
                            "courseid": courseid,
                            "courseTitle": courseTitle,
                            "courseDescription": courseDescription,
                            "courseCreater": courseCreater,
                            "courseCategory": courseCategory,
                            "coursePrice": coursePrice,
                            "courseDiscount": courseDiscount,
                            "courseImg": courseImg,
                            "videolist": videolist,
                        }
                    }
                }
            );

            response.status(201).json({ message: "Course added in PlayList Successfully.", status: 201, data: user });
        }
    } catch (error) {
        response.status(404).json({ message: "Course Not added in PlayList!", status: 404 });
    }
});

// Get All Courses From PlayList (For Profile Page)
router.get("/add/course/av2/toplaylist", TokenAuthenMiddleware, async (request, response) => {
    try {
        const userId = request.userId;

        const user = await userCollections.findOne({ _id: userId });

        response.status(201).json(user);
    } catch (error) {
        response.status(404).json({ message: "All Courses can not get from PlayList.!", status: 404 });
    }
});

// Delete Course From Playlist (For Profile Page)
router.put("/delete/course/av3/toplaylist", TokenAuthenMiddleware, async (request, response) => {
    try {
        const { deletecourseid } = request.body;
        const userId = request.userId;

        const data = await userCollections.updateOne(
            { _id: userId },
            { $pull: { playlist: { courseid: deletecourseid } } }
        );

        response.status(201).json({ message: "Course Deleted from PlayList Successfully.!", status: 201, data: data });
    } catch (error) {
        response.status(404).json({ message: "Can not delete Course from PlayList.!", status: 404 });
    }
});

// Buy Product Using Razorpay
router.route("/payment/bs1/integrate/checkout").post(TokenAuthenMiddleware, async (request, response) => {
    try {
        const { amount, courseid } = request.body;
        const userId = request.userId;

        const user = await userCollections.findOne({ _id: userId });

        const exists = await paymentCollection.findOne({ userId: userId, courseid: courseid });
        if (exists) {
            response.status(404).json({ message: "The Course already Subscribed!", status: 404 });
        } else {

            const instance = new Razorpay({
                key_id: process.env.RAZORPAY_API_KEY,
                key_secret: process.env.RAZORPAY_API_SECRET,
            });

            const order = await instance.orders.create({
                amount: amount * 100,
                currency: "INR",
            });

            response.status(201).json({ message: "Successful", status: 201, data: order, user: user });
        }
    } catch (error) {
        response.status(404).json({ message: "Please login frist!", status: 404, });
    }
});

// Get Key Razorpay
router.route("/getkey").get(TokenAuthenMiddleware, async (request, response) => {
    response.status(201).json({ message: "Successful", status: 201, key: process.env.RAZORPAY_API_KEY });
});

// Payment Varification Url
router.route("/api/payment/verification/:courseid").post(TokenAuthenMiddleware, async (request, response) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = request.body;
    const userId = request.userId;
    const courseid = request.params.courseid;

    const body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(body.toString())
        .digest("hex")

    const isMatched = expectedSignature === razorpay_signature;

    if (isMatched) {
        const paymentData = await new paymentCollection({
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpaySignature: razorpay_signature,
            userId: userId,
            courseid: courseid,
        });

        await paymentData.save();
        response.redirect(`/paymentsuccess?reference=${razorpay_payment_id}`);
    } else {
        response.status(404).json({ message: "Payment Failure!", status: 404 });
    }
});

// When Candidate Buy a Course Then go to Watch Video
router.route("/validate/watch/course").get(TokenAuthenMiddleware, async (request, response) => {
    try {
        const userId = request.userId;

        const exists = await paymentCollection.aggregate([
            { $match: { userId: `${userId}` } },
            { $project: { courseid: 1 } },
            { $group: { _id: "$courseid" } },
        ]);

        response.status(201).json(exists);
    } catch (error) {
        response.status(404).json({ message: "Can not get Data!", status: 404 });
    }
});

// Dashboard Subscription
router.route("/subscription/bf/info").get(TokenAuthenMiddleware, async (request, response) => {
    try {
        const exists = await paymentCollection.find({});

        response.status(201).json(exists);
    } catch (error) {
        response.status(404).json({ message: "Can not get Data!", status: 404 });
    }
});

// New Request For Course
router.post("/api/new/course_request", async (request, response) => {
    try {
        const { fname, email, coursename } = request.body;

        if (!fname | !email | !coursename) {
            response.status(404).json({ message: "Please Fill This!", status: 404 });
        } else {
            const newRequest = new requestCollection({
                fname: fname,
                email: email,
                coursename: coursename,
            });

            await newRequest.save();

            response.sendStatus(201);
        }
    } catch (error) {
        response.status(404).json({ message: "Request Can Not Send!", status: 404 });
    }
});

// New Contact Us
router.post("/api/new/contactus", async (request, response) => {
    try {
        const { fname, email, coursename } = request.body;

        if (!fname | !email | !coursename) {
            response.status(404).json({ message: "Please Fill This!", status: 404 });
        } else {
            const newRequest = new contactCollection({
                fname: fname,
                email: email,
                coursename: coursename,
            });

            await newRequest.save();

            response.sendStatus(201);
        }
    } catch (error) {
        response.status(404).json({ message: "Conatct Request Can Not Send!", status: 404 });
    }
});

// Send Email to user when loged in website
router.route("/send/login/email").post((request, response) => {
    const { email } = request.body;

    try {
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_ID,
                pass: process.env.GMAIL_PASS,
            }
        });

        const mailOption = {
            from: process.env.GMAIL_ID,
            to: email,
            subject: "From Course Builer",
            html: `
            <h1>User Login Successfully.</h1>
            <h1>Welcome to Course Builer</h1>
            `,
        }

        transport.sendMail(mailOption, (error, info) => {
            if (error) {
                response.status(404).json({message: "Can not send mail!", status: 404});
            } else {
                response.status(201).json({message: "Mail send successfully.", status: 201});
            }
        })
    } catch (error) {
        response.status(404).json({message: "Can not send mail!", status: 404});
    }
});

router.route("/send/register/email").post((request, response) => {
    const { email } = request.body;

    try {
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_ID,
                pass: process.env.GMAIL_PASS,
            }
        });

        const mailOption = {
            from: process.env.GMAIL_ID,
            to: email,
            subject: "From Course Builer",
            html: `
            <h1>User Registered Successfully.</h1>
            <h1>Welcome to Course Builer</h1>
            `,
        }

        transport.sendMail(mailOption, (error, info) => {
            if (error) {
                response.status(404).json({message: "Can not send mail!", status: 404});
            } else {
                response.status(201).json({message: "Mail send successfully.", status: 201});
            }
        })
    } catch (error) {
        response.status(404).json({message: "Can not send mail!", status: 404});
    }
});

module.exports = router;