const socket = require("socket.io");
const crypto = require("crypto")

const getSecretRoomId = (userId,targetUserId)=>{
    return crypto.createHash("sha256").update([userId,targetUserId].sort().join("_")).digest("hex")
}

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: ["http://localhost:5173"],
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    socket.on("joinChat",({userId,targetUserId})=>{
         const room = getSecretRoomId(userId,targetUserId)
         socket.join(room)
    })
    socket.on("sendMessage",({firstName,userId,targetUserId,text})=>{
      const room = getSecretRoomId(userId,targetUserId) 
        io.to(room).emit("messageReceived",{firstName,text})
    })
    socket.on("disconnect",()=>{

    })
  });
};
module.exports = initializeSocket;