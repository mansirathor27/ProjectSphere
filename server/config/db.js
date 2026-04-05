import mongoose from "mongoose";    

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "projectsphere"
        });
        console.log(`Connected to MongoDB: ${connection.connection.host}`);
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1); 
    }
}