// COntrollers is used to define the methods.

const { asyncHandler } = require("../utils/asyncHandler.js")
const { ApiError } = require("../utils/ApiErrors.js")
const { User } = require("../models/user.model.js")
const uploadOnCloudinary = require("../utils/cloudinary.js")
const { ApiResponse } = require("../utils/ApiResponse.js")
const jwt = require("jsonwebtoken")

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
    });

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
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

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
    // yaha toh koi option nahi h user id find krne ka.
    // Toh ek solution nikala like jis type se hum multer ko middleware ki tarah use karke usko routes me pass kar rahe the same vase 
    // hum khudka middleware design karenge(), joh ki user jab login karega toh hum login functionality me usko access or refresh token
    // bhi de rahe h toh voh usek browser me add ho jaegi jab bhi voh login karega or iske sath hum hamara design kara hua middleware
    // bhi pass karenge joh humne user ko access karne dega jisse hum url se request karke id access kar paenge.
    // Basially in short-terms humne joh hamare tokens beje usme humne define kar rakha h ki tokens me kya - kya available hoga
    // user.model file me toh vaha humne id bhi define kar rakhi h toh hum id user ke token se access kar lenge.

    // Now ab apne pas middleware(auth.middleware.js) se user ki saari information a gayi ab hum easily user ki information nikal ke 
    // usse logout karva paenge.
    

    // Find and update its value in mongodb
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: undefined},
        },
        {
            new: true       // ye updated value(undefined) de dega varna purani value show karega.
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    // Now send updated refresh(undefined) and access token value.
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))


})

// Now we have to check when acces token time expires then we have to genearte new token with the help of refresh token
// So we need to check user is valid with tokens, so we take user token(encrypt from) from request(req)
// validate that it our database refresh token and that both should be same.
const refreshAccessToken = asyncHandler(async (req, res) => {

    // If user is on mobile ---> req.body.refreshToken
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    // If token is not available, return error
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")

    }

    try {
        // Verify unencrpyt user token that user token is valid or expires. 
        // Now jwt.verify returns payload value(._id)
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOEKN_SECRET)
        
        // Extract id from decoded token
        const user = await User.findById(decodedToken?._id)
    
        // if it is empty, return error...
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
    
        }
    
        // Now we checking user browser refresh-token and our databse refresh token is same
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used.")
    
        }
    
        // At this point , now both matching, now generate new access token using define function at top of file
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        // now send response to the user browser and our database also.
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")

    }

        
})

module.exports = { registerUser, loginUser, logoutUser, refreshAccessToken }

// User ---> model vala user(whole databse) represent kar raha h(.findbyID,etc)
// user ---> current user(joh method humne user model pe implement kiye voh yaha lagte h - isPasswordCorrect(), generateRefreshToken())