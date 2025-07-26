const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../../src/models/chat");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: ["http://localhost:5173"],
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const room = getSecretRoomId(userId, targetUserId);
      socket.join(room);
    });
    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        try {
          // Check if there's an accepted connection
          const connection = await ConnectRequest.findOne({
            $or: [
              { fromUserId: userId, toUserId: targetUserId },
              { fromUserId: targetUserId, toUserId: userId },
            ],
            status: "accepted",
          });

          if (!connection) {
            // If not connected, deny joining
            return socket.emit("chatDenied", {
              message: "You can only chat with accepted connections.",
            });
          }

          const room = getSecretRoomId(userId, targetUserId);
          // save message to db

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          })
            .select("messages")
            .slice("messages", -20);
            
          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }
          chat.messages.push({
            senderId: userId,
            text,
          });
          io.to(room).emit("messageReceived", { firstName, lastName, text });
          await chat.save();
        } catch (err) {
          console.log(err);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};
module.exports = initializeSocket;
