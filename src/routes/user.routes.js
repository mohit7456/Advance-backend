const Router = require("express");
const { loginUser, registerUser, logoutUser, refreshAccessToken } = require("../controllers/user.controller.js");
const { upload } = require("../middlewares/multer.middleware.js")
const verifyJWT = require("../middlewares/auth.middleware.js")


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
    registerUser
)

router.route("/login").post(loginUser)

// For logout apne pas ek he traika toh h ki user login h ya nahi toh hum midlleware use karnege joh humne likha tha - verifyJWT
// ye middleware pehle run hoke user ki saari information la dega or check bhi ka rlega user h bhi ya nahi ya login h  bhi ya nahi..
// Below this all are Secured routes -- means login required for this.
router.route("/logout").post(verifyJWT, logoutUser)

// When user Access-token is expired then it hit on this URL to re-generate new tokens.
router.route("/refresh-token").post(refreshAccessToken)

module.exports = router