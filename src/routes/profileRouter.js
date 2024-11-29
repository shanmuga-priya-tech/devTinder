const express = require("express");
const profileController = require("../controllers/profileController");

const { userAuth } = require("../middlewares/auth");

const profileRouter = express.Router();

profileRouter.get("/view", userAuth, profileController.getCurrentUser);

profileRouter.patch("/edit", userAuth, profileController.editProfile);

module.exports = profileRouter;
