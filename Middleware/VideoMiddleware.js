const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4 } = require("uuid");

const storage = multer.diskStorage({
    destination: function (req, file, cd) {
        if (!fs.existsSync("public")) {
            fs.mkdirSync("public");
        }

        if (!fs.existsSync("public/videos")) {
            fs.mkdirSync("public/videos");
        }

        cd(null, "./public/videos");
    },
    filename: function (req, file, cd) {
        cd(null, `${v4()}_${path.extname(file.originalname)}`);
    }
});

const filterVideos = (req, file, cd) => {
    const allowedFileTypes = ["video/mp4", "video/mkv"];

    if (allowedFileTypes.includes(file.mimetype)) {
        cd(null, true);
    } else {
        cd(true, null);
    } 
}

const VideoMiddleware = multer({ storage: storage, fileFilter: filterVideos });

module.exports = VideoMiddleware;