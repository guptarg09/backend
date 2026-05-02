// import dns from "node:dns";
// dns.setServers(["8.8.8.8", "1.1.1.1"]); // Forces Google & Cloudflare DNS

// import dotenv from "dotenv";
// import express from "express";
// import mongoose from "mongoose";
// import connectDB from "./db/index.js";
// import { error } from "node:console";
// // ... rest of your code


// // import dotenv from "dotenv";
// // import express from "express";
// // import mongoose from "mongoose";

// dotenv.config();

// const app = express();

// // (async () => {
// //     try {

// //         console.log("Mongo URI:", process.env.MONGODB_URI);

// //         // Connect MongoDB
// //         await mongoose.connect(process.env.MONGODB_URI);

// //         console.log("✅ MongoDB Connected");

// //         app.on("error", (error) => {
// //             console.log("ERROR:", error);
// //             throw error;
// //         });

// //         app.listen(process.env.PORT || 8000, () => {
// //             console.log(`🚀 App is listening on port ${process.env.PORT}`);
// //         });

// //     } catch (error) {
// //         console.error("❌ ERROR:", error);
// //         process.exit(1);
// //     }
// // })();




// connectDB()
// .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//         console.log(`server is running at port : ${process.env.PORT}`);
//     })
// })
// .catch((err) => {
//     console.log("MONGO DB connection failed !!!", err);
// })




import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";   // IMPORT EXISTING APP

dotenv.config();

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at port : ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log("MONGO DB connection failed !!!", err);
});