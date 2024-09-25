const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionReq = require("../models/connectionRequestModel");
const userRouter = express.Router();

const dataRequired = [
  "firstName",
  "lastName",
  "photoURL",
  "about",
  "skills",
  "age",
  "gender",
];

//api to fetch the received request which all are pending to accept or reject
userRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionList = await ConnectionReq.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", dataRequired);

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

//get the list of connections one have
userRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    //get the doc with the status "accepted" and loggedin user  id matches either in fromuserId || toUserId
    const connectionList = await ConnectionReq.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", dataRequired)
      .populate("toUserId", dataRequired);

    if (!connectionList) {
      return res.status(404).send("There is No connection!");
    }

    //checking whether the user is sender or not.
    //if sender,we give the detail of reciever who recieved the coonection
    //if reciever,we give the detail of sender who send the connection
    const data = connectionList.map((connection) => {
      if (
        connection.fromUserId._id.toString() === loggedInUser._id.toString()
      ) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });

    if (data.length === 0) {
      return res.status(404).send("NO connection found!");
    }

    res.json({
      message: "Connections fetched successfully!",
      data,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = userRouter;
