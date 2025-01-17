const socket = require("socket.io");

export const createSocketConnection = (server) => {
  //socket configuration
  const io = socket(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
    },
  });

  //establishing connection
  io.on("connection", (socket) => {
    //handle events
    socket.on("joinChat", () => {});

    socket.on("sendMessage", () => {});
  });
};

module.exports = createSocketConnection;
