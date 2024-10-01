const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionReq = require("../models/connectionRequestModel");
const User = require("../models/userModel");
const userRouter = express.Router();

const dataRequired = [
  "firstName",
  "lastName",
  "photoURL",
  "about",
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
      return res.status(404).json({ message: "No connections found!" });
    }

    res.json({
      message: "connection list successfully fetched!",
      data: connectionList,
    });
  } catch (err) {
    res.status(400).json({ message: "ERROR: " + err.message });
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
      return res.status(404).json({ message: "There is No connection!" });
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

    res.json({
      message: "Connections fetched successfully!",
      data,
    });
  } catch (err) {
    res.status(400).json({ message: "ERROR: " + err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    //PAGINATION:
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 30 ? 30 : limit;
    const skip = (page - 1) * limit;

    //user can see all the users card expect
    //1)his own card
    //2)his connections card
    //3)whom he sent req[intrested ]
    //4)whom he ignored & rejected

    //find all the connection req where the current user in (send+recieved and in any status)
    const connectionReqList = await ConnectionReq.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    //to filter out the current user in every req in connectionReqList recieved and to have only unique users
    const hiddenUsersFromFeed = new Set();
    connectionReqList.forEach((req) => {
      hiddenUsersFromFeed.add(req.fromUserId.toString());
      hiddenUsersFromFeed.add(req.toUserId.toString());
    });

    //filtering out the user whois not in hidden list and the currently logged in user
    const data = await User.find({
      $and: [
        { _id: { $nin: Array.from(hiddenUsersFromFeed) } }, //converting set to  array
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(dataRequired)
      .skip(skip)
      .limit(limit);

    res.json({ message: "data fetched successfully", data });
  } catch (err) {
    res.status(400).json({ message: "ERROR: " + err.message });
  }
});

module.exports = userRouter;
