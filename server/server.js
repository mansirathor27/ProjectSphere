import { connectDB } from "./config/db.js";
import app from "./app.js";
import { initSocket } from "./socket.js";

// Ensure DB is connected before starting the server
await connectDB();

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});

const io = initSocket(server);
app.set("io", io); // make io accessible in controllers if needed


process.on("unhandledRejection",(err)=>{
    console.log(`Unhandled Rejection: ${err.message}`);
    server.close(()=>process.exit(1));
});

process.on("uncaughtException",(err)=>{
    console.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});
export default server;