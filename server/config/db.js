import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("FATAL ERROR: MONGO_URI environment variable is not defined.");
            console.error("Please ensure you have set the MongoDB connection string in your Render dashboard environment variables.");
            process.exit(1);
        }

        console.log(`Attempting to connect to MongoDB with URI starting with: ${process.env.MONGO_URI.substring(0, 20)}...`);

        if (process.env.NODE_ENV === "production" && 
           (process.env.MONGO_URI.includes("127.0.0.1") || process.env.MONGO_URI.includes("localhost"))) {
            console.error("FATAL ERROR: A local MongoDB address (127.0.0.1 or localhost) was provided in a production environment.");
            console.error("Render services cannot connect to a local MongoDB. Please update your MONGO_URI in the Render dashboard to a remote instance like MongoDB Atlas.");
            process.exit(1);
        }

        const connection = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "projectsphere"
        });
        console.log(`Connected to MongoDB: ${connection.connection.host}`);
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1); 
    }
};