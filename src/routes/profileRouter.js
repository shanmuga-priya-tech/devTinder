const express = require("express");
const User = require("../models/userModel");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfile } = require("../utils/validation");

const profileRouter = express.Router();

profileRouter.get("/view", userAuth, async (req, res) => {
  try {
    //getting the user from auth middleware
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/edit", userAuth, async (req, res) => {
  try {
    //validation
    validateEditProfile(req);

    const loggedInUser = req.user;

    Object.keys(req.body).every(
      (field) => (loggedInUser[field] = req.body[field])
    );

    await loggedInUser.save();
    res.json({
      message: "user updated successfully",
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = profileRouter;
