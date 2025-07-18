/*
This are common lines to every model

-- const mongoose = require("mongoose")

-- const exampleSchema = new mongoose.Schema({})

-- export const User = mongoose.model("User", exampleSchema)

*/

const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")   // USed for generating the tokens
const bcrypt = require("bcrypt")      // Used for hashing the passwords.(encyrption + decyrption)

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true                // It is expensive but uses in searching faster.
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true               // Removes white spaces from both the ends.
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,        // In string it take Cloudinary URL, it convert photo into url then we save in our database.
            required: true
        },
        coverImage: {
            type: String        // In string it take Cloudinary URL
        },
        watchHistory: [         // For watching-History what we do when user open a video we noted its video id and store in our array.
            {          
            type: mongoose.Schema.Types.ObjectId, // video id is in another table and watchHistory array in another.So we use syntax like this
            ref: "Video"                          // We have to always write its refernce(model-name)
            }                       
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

// Now we use here "pre" middleware that when a user save its username and password then when it click on save and before
// password save to database we encrypt it using bycrpt and their functions.
userSchema.pre("save", async function (next) {     // Here we use function instead of arrow function because we need "this" here.

    // But there is a problem it encyrpted everytime like when user update its avatar photo then it again encrpted it.
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// Now we have to ensure that it correctly encrypted the user password so we have a function 'comapre(user's password, encrypted password)'.
// We define custome method here...
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

// Now generating tokens using jwt, Here wwe don't need async-await it is fast already.
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            //payload
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        // our accesstoken define in .env file
        process.env.ACCESS_TOKEN_SECRET,
        {
            // our Expiry token in .env file
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.methods.generateRefreshToken = function(){
    // Generally refresh token have less payload because it refreshes more.
    return jwt.sign(
        {
            // payload
            _id: this._id,
        },
        // our refreshtoken define in .env file
        process.env.REFRESH_TOEKN_SECRET,
        {
            // our Expiry token in .env file
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", userSchema)      // 2nd User is for when we using refernce of it, this User is responsible 
//                                                      if we need to access database.
module.exports = User