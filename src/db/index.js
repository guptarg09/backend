import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {

    console.log("Mongo URI:", process.env.MONGODB_URI);
    console.log("DB NAME:", DB_NAME);

    try{
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        )

        console.log(`✅ MongoDB connected: ${connectionInstance.connection.host}`);

    } catch (error) {

        console.log("❌ MONGODB connection error:", error);

        process.exit(1)
    }
}

export default connectDB