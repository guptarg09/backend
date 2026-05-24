import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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
        fullName,
        avatar: avatarUploadResponse.url,
        coverImage: coverImageUploadResponse?.url || "",
        email,
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
export { registerUser }



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