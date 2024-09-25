const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/userModel");
const ConnectionReq = require("../models/connectionRequestModel");

const requestRouter = express.Router();

//api to send connection request
requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    //1)check whether the touser is present or not
    const toUser = await User.findById({ _id: toUserId });
    if (!toUser) {
      throw new Error("User not found");
    }

    //2)check whether the status is either interested || ignored.
    const allowedStatus = ["ignored", "interested"];
    const isAllowedStatus = allowedStatus.includes(status);
    if (!isAllowedStatus) {
      throw new Error(`${status} not allowed`);
    }

    //3)check whether the user is trying to send connection request to himself
    if (fromUserId.equals(toUserId)) {
      throw new Error("You cannot connect with Yourself!");
    }

    //4)check whether the connection req is already established between to users
    const existingConnection = await ConnectionReq.findOne({
      $or: [
        { fromUserId, toUserId }, //user 1->user 2
        { fromUserId: toUserId, toUserId: fromUserId }, //user 2->user 1
      ],
    });
    if (existingConnection) {
      throw new Error("Connection request already established");
    }

    //creating new connection
    const data = new ConnectionReq({
      fromUserId,
      toUserId,
      status,
    });

    await data.save();
    res.json({
      message: `${req.user.firstName} - ${status} - ${toUser.firstName} `,
      data,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = requestRouter;
