// COntrollers is used to define the methods.

const { asyncHandler } = require("../utils/asyncHandler.js")
const { ApiError } = require("../utils/ApiErrors.js")
const User = require("../models/user.model.js")
const uploadOnCloudinary = require("../utils/cloudinary.js")
const { ApiResponse } = require("../utils/ApiResponse.js")

const generateAccessAndRefereshTokens = async(userId) => 
{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refereshToken = user.generateRefreshToken()

        // Save one refernce in our databse...
        user.refereshToken = refereshToken
        await user.save({ validateBeforeSave: false })      // When you save anything to existing object you need password,but here
                                                        // we explicitly mana kar rahe h ki ki paassword mat mangana kyuki hume pata
        return {accessToken, refereshToken}                 // sab ki user validate ho chuka h pehle he.
        
    } catch (error) {                                      
        throw new ApiError(500, "Something went wrong while generating referesh and access token")

    }
}

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
    // console.log(username);
    // console.log(password);
    // console.log(email);
    // console.log(fullName);

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
    const existedUser = await User.findOne({
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
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;        // avatar[0] extracting the property present on 0th position.

    // ab apan ne coverImage ko "required" nahi kar rakha mtlb must nahi h ki user fill kare ya nahi...lets suppose user fill nahi
    // karta toh uper vali line -- req.files?.coverImage[0]?.path -- req.file me jaegi or vaha 'undefined' hoga or humne array defined 
    // kar rakha h uski 0th property access karne ki koshish karegi joh h he mahi toh usko error milega, toh hum ek check laga denge 
    // ki req.files me cover image ho jab he uska path nikale.
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
        
    }

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

const loginUser = asyncHandler( async (req, res) => {
    // req body -> data
    // validate with username or email        // we dont decide at this time ki humhe kisse login karvana h toh dono le liye.
    // find the user
    // password check
    // access and refresh token generate
    // send them these tokens in cookies

    // Taking data from body----
    const {email, username, password} = req.body

    if(!(username || email)){ 
        throw new ApiError(400, "username and password is  required.")

    }

    //Finding user in database....
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    // user --> current user which are logging in
    // User --> mongodb saved user.

    if (!user) {
        throw new ApiError(404, "User does not exist")

    }

    // Chesking password....Joh apan ne models me joh function likhe h password-check, generate-tokens voh apan ko current user me 
    // milenge , mongodb value(User) me nahi kyuki apan ko jispe pe apply karna hota h usse acces hote h yeh.
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {                             // false
        throw new ApiError(404, "Password Incorrect!!!")

    }

    // Hum refresh token or access token ko sidha yaha bhi call kara sakte h but isko uper ek function me define kar denge then us 
    // function ko yaha call kar lenge. At this point refresh and acess token are added to the user.
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    // Now select when user login which data we need to send
    const loggedInUser = await user.findById(user._id).select("-password -refreshToken")

    // Now send the remaining information and tokens in cookies

    const options = {
        httpOnly: true,             // These options are used in cookies that we dont want these cookies are editeable by user browser,
        secure: true                // these are only editable by server only, by-default cookies are ediatble by user-browser.
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser, accessToken, refreshToken  // Better practice to pass one more time, sometime user save it in local.
            },
            "User logged In Successfully"
        )
    )

    

})

// Now we have to take care of logout-functionality also.
// For log-out we have to remove these tokens from the user
const logoutUser = asyncHandler(async (req, res) => {
    // ab vaha toh humne url mila tha vaha se user ka email,usernmae se uski databse id finnd out kar li thi but,
    // yaha toh koi option nahi h use find akrne ka.
    // Toh ek solution nikala like jis type se hum multer ko middleware ki tarah use karke usko routes me pass kar rahe the same vase 
    // hum khudka middleware design karenge()
})

module.exports = {registerUser}