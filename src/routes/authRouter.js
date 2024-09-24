const express = require("express");
const { validateSignUp } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    //API LEVEL VALIDATION
    validateSignUp(req);

    const { firstName, lastName, email, password } = req.body;
    //pASSWORD HASH
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await user.save();
    res.send("user created successfully");
  } catch (err) {
    //console.log(err);
    res.status(400).send("failed to create user" + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //Getting user doc based on email
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Incorrect email Id/password");
    }
    //comparing the password with hashed one
    const isPasswordValid = await user.validPassword(password);

    if (isPasswordValid) {
      const token = await user.createJWTToken();
      //send it with cookie
      res.cookie("token", token, { expiry: process.env.COOKIEEXPIRY });

      res.send("user logged in successfully");
    } else {
      throw new Error("Incorrect emailID/password");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = authRouter;
