// simply check karega user authenticated h ki nahi , if h!! toh uski cookie me se information nikal lo....
// humne isko alag file me banake isleye likha ki ye  kahi bhi re-use kar sake.
// iska itna sa kam h bss ki hume logout ke time humhe user ki need hogi jab he usko logout karva paenge.Toh yaha hum token se 
// user ki id le rahe h taki use logout karva pae.

const { ApiError } = require("../utils/ApiErrors.js")
const { asyncHandler } = require("../utils/asyncHandler.js")
const jwt = require("jsonwebtoken")
const { User } = require("../models/user.model.js")

const verifyJWT = asyncHandler(async (req, _, next) => {   // Now here there is no use of response(res) so marked as underscore(_)

    try {
        // Hamare pas yaha per cookies ka access h kyuki humne app.js me cookie-parser as a middleware use kiya h or login time pe hum us
        // user ke browser per access or refresh token bej rahe h, mtlb voh login h ja tak uske pas access or refresh token rahega or hum
        // easily token se id leke logout vale function ko batake ki ye user h or logout karva denge.
    
        // kai bar user jab phone me login hota h toh voh header(" Authorization ") bejta h na ki URL or uska format hota h " Bearer  
        // <token> " toh hume ye bhi handle karna hoga, toh hum "bearer " ko replace kar denge space se toh hamare pas sirf <token> rehh 
        // jaega jiski hume need h.
    
        const token = req.cookies?.accessToken || req.jeader("Authorization")?.replace("Bearer ", "")
    
        // If token is missing, throw error
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
    
        }
        
        // If token is available, then check it matches to our env token.
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        // if token is valid, then find user by its id
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        // If there is no such user, throw error
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
    
        }
    
        // Now here we confirm that user is exist, now user ki saari information 'req' me add kardo taki hum usko access kar sake req.
        // se for logout.
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})

module.exports = verifyJWT