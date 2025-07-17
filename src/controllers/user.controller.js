// COntrollers is used to define the methods.

const { asyncHandler } = require("../utils/asyncHandler.js")

const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "Okay Api response reecived."
    })
})

module.exports = {registerUser}