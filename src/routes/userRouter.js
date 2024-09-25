const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionReq = require("../models/connectionRequestModel");
const userRouter = express.Router();

//api to fetch the received request which all are pending to accept or reject
userRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionList = await ConnectionReq.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "photoURL",
      "about",
      "skills",
      "age",
      "gender",
    ]);

    if (!connectionList) {
      return res.status(404).send("No connections found!");
    }

    res.json({
      message: "connection list successfully fetched!",
      data: connectionList,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = userRouter;
