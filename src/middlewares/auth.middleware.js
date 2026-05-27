import { asyncHandler } from "../utils/asyncHandler.js" 
import { ApiErrors } from "../utils/ApiErrors.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

// Middleware to verify JWT token and authenticate user

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Check for token in cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if(!token) {
            throw new ApiErrors(401, "Access token is missing/Unauthorized request")
        }
    
    // Verify token and extract user information    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    
        if(!user) {
            throw new ApiErrors(404, "Invalid token: user not found")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiErrors(401, "Invalid access token")
    }   
})