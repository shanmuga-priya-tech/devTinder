const socket = require("socket.io");
const crypto = require("crypto");

//fn to hash the roomid for security
const getSecretRoomId = (userId, receiverId) => {
  return crypto
    .createHash("sha256")
    .update([userId, receiverId].sort().join("$"))
    .digest("hex");
};

const createSocketConnection = (server) => {
  //socket configuration
  const io = socket(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
    },
  });

  //establishing connection
  io.on("connection", (socket) => {
    //handle events
    socket.on("joinChat", ({ firstName, userId, receiverId }) => {
      const roomId = getSecretRoomId(userId, receiverId);
      console.log(`${firstName} joined ${roomId}`);
      socket.join(roomId);
    });

    socket.on("sendMessage", () => {});

    socket.on("disconnect", () => {});
  });
};

module.exports = createSocketConnection;
