import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    });
    
    // Global listeners can go here if needed
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  }
  return socket;
};

export const connectSocket = (userId) => {
  if (!userId) return;
  const skt = getSocket();
  
  if (!skt.connected) {
    skt.connect();
    
    // Register on initial connect
    skt.once("connect", () => {
      skt.emit("register", userId);
    });
    
    // Important: Re-register on reconnection
    skt.on("reconnect", () => {
      skt.emit("register", userId);
    });
  } else {
    // Already connected, just register in case of user switch
    skt.emit("register", userId);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
