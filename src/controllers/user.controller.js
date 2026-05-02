import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message : "ok"
    })
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