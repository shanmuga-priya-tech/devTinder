const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chatModel");

//fn to hash the roomid for security
const getSecretRoomId = (userId, receiverId) => {
  return crypto
    .createHash("sha256")
    .update([userId, receiverId].sort().join("$"))
    .digest("hex");
};

const createSocketConnection = (server) => {
  //1)socket configuration
  const io = socket(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
    },
  });

  //2)establishing connection and listening up multiple events
  io.on("connection", (socket) => {
    //handle events
    socket.on("joinChat", ({ firstName, userId, receiverId }) => {
      const roomId = getSecretRoomId(userId, receiverId);
      //   console.log(`${firstName} joined ${roomId}`);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, profilepic, userId, receiverId, msg }) => {
        const roomId = getSecretRoomId(userId, receiverId);

        //save msg in db
        try {
          //1) trying to find if there is any existing enteries for these two particpants
          let chat = await Chat.findOne({
            participants: { $all: [userId, receiverId] },
          });

          //2)if not trying to create new entry
          if (!chat) {
            chat = new Chat({
              participants: [userId, receiverId],
              messages: [],
            });
          }
          //3)no matter whether its a new entry or existing entry we need to append the new msg to msgs array
          chat.messages.push({
            senderId: userId,
            text,
          });

          //saving msg in db
          await chat.save();

          //sending the msg to a room
          io.to(roomId).emit("messageReceived", { firstName, profilepic, msg });
        } catch (err) {
          console.log(err);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = createSocketConnection;
