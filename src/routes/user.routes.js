const Router = require("express");
const { registerUser } = require("../controllers/user.controller.js");
const { upload } = require("../middlewares/multer.middleware.js")


const router = Router()

// It is a simple route , but here we need file upload middleware also so import 'multer' here and define in method.
// router.route("/register").post(registerUser)

// route with multer accepting two files avatar, coverimage
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

module.exports = router