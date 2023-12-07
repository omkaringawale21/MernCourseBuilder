const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const Connection = require("./DataBase/Connection.js");
const router = require("./Routes/Routes.js");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

const userName = process.env.MONGODB_UER;
const userPass = process.env.MONGODB_PA;
const userDB = process.env.MONGODB_DB_NAME;

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

Connection(userName, userPass, userDB);

app.use(express.json());
app.use(cookieParser("*"));
app.use(cors("*", {
    origin: true,
    Credential: true,
}));

app.use(router);

app.use("/public/photos", express.static(path.join(__dirname, "public/photos")));

app.use("/public/videos", express.static(path.join(__dirname, "public/videos")));

app.listen(PORT, () => {
    console.log(`Back End server is running on port ${PORT}`);
});