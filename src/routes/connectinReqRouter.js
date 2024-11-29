const express = require("express");
const { userAuth } = require("../middlewares/auth");
const connectionReqController = require("../controllers/connectionReqController");

const requestRouter = express.Router();

//api to send connection request
requestRouter.post(
  "/send/:status/:toUserId",
  userAuth,
  connectionReqController.sendConnectionReq
);

requestRouter.post(
  "/review/:status/:requestId",
  userAuth,
  connectionReqController.reviewReq
);

module.exports = requestRouter;
