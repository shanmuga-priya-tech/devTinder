const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userController = require("../controllers/userController");

const userRouter = express.Router();

//api to fetch the received request which all are pending to accept or reject
userRouter.get("/requests/received", userAuth, userController.reqReceived);

//get the list of connections one have
userRouter.get("/connections", userAuth, userController.allConnections);

userRouter.get("/feed", userAuth, userController.feed);

module.exports = userRouter;
