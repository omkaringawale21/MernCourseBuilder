const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4 } = require("uuid");

const storage = multer.diskStorage({
    destination: function (req, file, cd) {
        if (!fs.existsSync("public")) {
            fs.mkdirSync("public");
        }

        if (!fs.existsSync("public/photos")) {
            fs.mkdirSync("public/photos");
        }

        cd(null, "./public/photos");
    },
    filename: function (req, file, cd) {
        cd(null, `${v4()}_${path.extname(file.originalname)}`);
    },
});

const filterPhotos = (req, file, cd) => {
    const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (allowedFileTypes.includes(file.mimetype)) {
        cd(null, true);
    } else {
        cd(null, false);
    }
}

const ImageMiddleware = multer({ storage, filterPhotos });

module.exports = ImageMiddleware;