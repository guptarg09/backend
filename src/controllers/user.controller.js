import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccesAndREfreshToken = async(userId) => {
    try {
        console.log("Step 1: Finding user with ID:", userId);
        const user = await User.findById(userId)
        console.log("Step 2: User found:", user ? "yes" : "no");

        if (!user) {
            throw new Error("User not found")
        }

        console.log("Step 3: Generating access token");
        const accessToken = user.generateAccessToken()
        console.log("Step 4: Generating refresh token");
        const refreshToken = user.generateRefreshToken()

        console.log("Step 5: Setting refresh token on user");
        user.refreshToken = refreshToken

        console.log("Step 6: Saving user");
        await user.save({validateBeforeSave: false})  //Because only refresh token changed.No need to validate all fields again.

        console.log("Step 7: Returning tokens");
        return { accessToken, refreshToken }


    } catch(error) {
        console.error("Token Generation Error Details:", error);
        throw new ApiErrors(500, `Token generation failed: ${error.message}`)
    }
}

// register user
const registerUser = asyncHandler( async (req, res) => {
    
    // ------ LOGIC TO REGISTER A USER ------

    // get user details from frontend
    // validate user details - not empty, email format, password strength
    // check if user already exists in DB : username, email
    // check for images and avatar
    // upload them to cloudinary, avatar
    // create user object - create entery in DB
    // remove password and refresh token from response
    // check if user created successfully, if not throw error
    // send success response to frontend


    // get user details from frontend
    const { fullName, username, email, password } = req.body

    console.log("User details from frontend:", { fullName, username, email, password })


    // validate user details - not empty, email format, password strength
    if(
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiErrors(400, "All fields are required")
    }
    


    // check if user already exists in DB : username, email
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existingUser) {
        throw new ApiErrors(409, "User with this username or email already exists")
    }

   // logic to handle file uploads, we are using multer for file uploads, multer will save the files in local storage and give us the path of the file, we will get the path of the file and then upload it to cloudinary, after uploading to cloudinary we will get the url of the file and then we will save that url in our DB
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && req.files.coverImage && req.files.coverImage[0] && req.files.coverImage[0].path) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    // console.log("Avatar local path:", avatarLocalPath)
    // console.log("Cover image local path:", coverImageLocalPath)

    // console.log("FILE:", req.file);
    // console.log("FILES:", req.files);
    // console.log("BODY:", req.body);

    if(!avatarLocalPath) {
        throw new ApiErrors(400, "Avatar is required")
    }

    // upload them to cloudinary, avatar
    // const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath)  // uploadOnCloudinary is a function that we have created in utils/cloudinary.js to upload a file on cloudinary and return the response
    // const coverImageUploadResponse = await uploadOnCloudinary(coverImageLocalPath)

    const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath.replace(/\\/g, "/"))
    const coverImageUploadResponse = await uploadOnCloudinary(coverImageLocalPath?.replace(/\\/g, "/"))

    if(!avatarUploadResponse) {
        throw new ApiErrors(404, "Avatar file is required!");
    }

    // create user object - create entery in DB
    const user = await User.create({
        fullName: fullName.trim(),
        avatar: avatarUploadResponse.url,
        coverImage: coverImageUploadResponse?.url || "",
        email: email.toLowerCase(),
        password,
        username: username.toLowerCase()
    })
    
    // remove password and refresh token from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser) {
        throw new ApiErrors(500, "User registration failed")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    ) 

    
}) 


// login user
const loginUser = asyncHandler(async (req, res) => {

    //  req body -> email, password 
    //  username or email 
    //  find the user 
    //  password match 
    //  generate access toekn and refresh token 
    //  send cookie 

    const { email, username, password } = req.body

    // validation
    if ((!email && !username) || !password) {
        throw new ApiErrors(
            400,
            "Email/username and password are required"
        )
    }

    // find user
    const user = await User.findOne({
        $or: [{ email }, { username }]
    }).select("+password +refreshToken")  // we need password and refresh token for login, but we don't want to send them in response, so we select them here and then remove them before sending response  

    if (!user) {
        throw new ApiErrors(404, "User not found")
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiErrors(401, "Invalid password")
    }

    // generate tokens
    const { accessToken, refreshToken } =
        await generateAccesAndREfreshToken(user._id)

    // remove sensitive fields
    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")

    // cookie options
    const options = {
        httpOnly: true,
        secure: true
    }

    // response
    return res.status(200)
        // Stores access token in browser cookies.
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})


// logout user
const logoutUser = asyncHandler( async (req, res) => {
    
    // clear cookie
    // clear refresh token from DB
     await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }
    )

     const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    )

    
})


// regreshing access token
const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken  // We can get refresh token from cookie or from request body, depending on how the frontend is sending it. Some frontend may send it in cookie, some may send it in request body, so we are checking both places.

    if(!incomingRefreshToken) {
        throw new ApiErrors(401, "Refresh token is missing/Unauthorized request")
    }

    // verify incoming refresh token 
    try {
            const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        )
        // find user based on decoded token's user id
        const user = await User.findById(decodedToken._id)
    
        if(!user) {
            throw new ApiErrors(401, "Invalid refresh token: user not found")
        }
    
        // check if incoming refresh token matches the one in DB
        if(user?.refreshToken !== incomingRefreshToken) {
            throw new ApiErrors(401, "Invalid refresh token: token does not match")
        }

        // generate new access token and refresh token
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const { accessToken, newrefreshToken } = await generateAccesAndREfreshToken(user._id)
        return res
        .status(200)
        .cookie("accestoken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponce(
                200,
                { acckessToken, newrefreshToken },
                "Access token refreshed successfully"
    
            )
       )
    }
    catch(error) {
        throw new ApiErrors(401, "Invalid refresh token")
    }


})

export { registerUser, loginUser, logoutUser, refreshAccessToken };




// -------FULL-FLOW OF A REQUEST-------

// Postman
//    ↓
// index.js (server start)
//    ↓
// app.js (route mapping)
//    ↓
// user.routes.js (match endpoint)
//    ↓
// controller (logic runs)
//    ↓
// response