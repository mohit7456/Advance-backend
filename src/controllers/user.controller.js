// COntrollers is used to define the methods.

const { asyncHandler } = require("../utils/asyncHandler.js")
const { ApiError } = require("../utils/ApiErrors.js")
const User = require("../models/user.model.js")
const uploadOnCloudinary = require("../utils/cloudinary.js")
const { ApiResponse } = require("../utils/ApiResponse.js")

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend(Postman)
    // Check validation - not empty
    // check if user already exists: - username, email
    // check for images, check for avatar(required)
    // upload them to cloudinary, avatar
    // create user object(for saving data in mongoDB) - Create entry in db
    // after saving in mongodb , it send response to server, then server send this response to user without password and refresh token.
    // check for user creat or not ?
    // reurn response.

    const {fullName, email, username, password} = req.body
    console.log(username);
    console.log(password);
    console.log(email);
    console.log(fullName);

    // if (fullName === "") {
    //     throw new ApiError(400, "fullname is required")
    // }
    // if (email === "") {
    //     throw new ApiError(400, "email is required")
    // } This is hectic to write for every field, so

    // We use some(), it return true or false, and run on every element.
    if ( [fullName, email, username, password].some( (field) => field?.trim() === "")) {      // Checking empty
        throw new ApiError(400, "All fields are required")
    }             

    // Checking existing user by importing User from usermodel.js
    // User.findOne({username})                      // If we need to check only with 'username'
    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists.")
    }

    // for uploading file ka backend -
    // 1. pehle multer ki configuration likh do(middleware me), or export kardo.
    // 2. route me jake 'files' vala ek parameter active ho jaega then usko use karke vaha define kardo konsi file leni h.
    // 3. uske bad controller me jake usko fetch karke server pe temporrary store karado.
    // 4. then cloudinary ka function call kardo parameter me path dalke.
    // Now fetching and validate for files - avatar etc., question-mark(?)- optionally chaining(exist or not exist).
    const avatarLocalPath = req.files?.avatar[0]?.path;         // Give tempraory server store path of the file.
    const coverImageLocalPath = req.fies?.coverImage[0]?.path;        // avatar[0] extracting the property present on 0th position.

    if (!avatarLocalPath){
        throw new ApiError(400, "Avatar file is reqquired.")
    }

    // Uploading on Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar){
        throw new ApiError(400, "Avatar file is reqquired.")
    }

    // Now create a object to save the user to monodb
    const user = await User.create({
        fullName,
        avatar: avatar.url,             // Cloudinary send many thinngs but we need only URL.
        coverImage: coverImage?.url || "", // coverImage ko "required" nahi kara tha monodb me toh a bhi user de bhi sakta h or nahi
        email,                                   // bhi isleye question-mark(?) diya mtlb ye field aa bhi sakti h or nahi bhi
        password,
        username: username.toLowerCase()
    })

    // Checking user is really save in mongodb? and doing chaining to remove passowrd and refreshtoken from mongodb response.
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"

    )

    if (!createdUser) {
        throw new ApiError("500", "Something went wrong, while registring the User")

    }

    // return res.status(201).json({createdUser}) normal way below side is standard way.
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully.")
    )
    
})

module.exports = {registerUser}