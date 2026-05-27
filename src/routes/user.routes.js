import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { logoutUser } from "../controllers/user.controller.js"


import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/register").post(

    // multer middleware to handle file uploads for avatar and coverImage
    upload.fields([  
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser)


router.route("/login").post(loginUser)  // login route 


//secured route 
router.route("/logout").post(verifyJWT, logoutUser)  // logout route - to clear cookie and refresh token from DB


export default router