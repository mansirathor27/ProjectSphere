import { connectDB } from "./config/db.js";
import app from "./app.js";
import { initSocket } from "./socket.js";

let server;

try {
    console.log("Starting server initialization...");
    console.log(`Node Environment: ${process.env.NODE_ENV || 'development'}`);

    // Ensure DB is connected before starting the server
    await connectDB();
    console.log("DB connection established.");

    const PORT = process.env.PORT || 4000;
    server = app.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`);
    });

    const io = initSocket(server);
    app.set("io", io); 
    console.log("Socket initialization complete.");
} catch (error) {
    console.error("CRITICAL ERROR during server startup:");
    console.error(error.stack || error.message || error);
    process.exit(1);
}


process.on("unhandledRejection",(err)=>{
    console.log(`Unhandled Rejection: ${err.message}`);
    server.close(()=>process.exit(1));
});

process.on("uncaughtException",(err)=>{
    console.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});
export default server;