import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"


import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/register").post(

    // multer middleware to handle file uploads for avatar and coverImage
    upload.fields([  
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser)
    
// User submits signup form (name, email, password, avatar)
//         ↓
// Multer uploads files → saves in public/temp
//         ↓
// Validate input + check user already exists
//         ↓
// Upload avatar/coverImage to Cloudinary
//         ↓
// Create user in MongoDB
//         ↓
// Password auto-hashed (pre-save middleware)
//         ↓
// User created successfully
//         ↓
// Response sent (user data)





// login route 
router.route("/login").post(loginUser)

// User enters email + password
//         ↓
// Find user in DB
//         ↓
// Check password (bcrypt compare)
//         ↓
// Generate access token + refresh token
//         ↓
// Save refresh token in DB
//         ↓
// Set cookies (accessToken + refreshToken)
//         ↓
// Response sent (user logged in)




// logout route
router.route("/logout").post(verifyJWT, logoutUser)  //secured route 

// User clicks logout
//         ↓
// verifyJWT middleware runs
//         ↓
// req.user is available
//         ↓
// refreshToken removed from DB
//         ↓
// cookies cleared from browser
//         ↓
// response sent


// refresh token route
router.route("/refresh-token").post(refreshAccessToken)   //secured route 

export default router