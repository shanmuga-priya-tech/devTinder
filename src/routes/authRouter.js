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
    const savedUser = await user.save();
    // Create JWT token
    const token = await savedUser.createJWTToken();

    // Send it with a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None", // Needed for cross-origin
      expires: new Date(Date.now() + 1 * 3600000),
    });

    res
      .status(200)
      .json({ message: "user created successfully", data: savedUser });
  } catch (err) {
    res.status(400).json({ message: "failed to create user" + err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Getting user doc based on email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Incorrect Email Id/Password");
    }

    // Comparing the password with the hashed one
    const isPasswordValid = await user.validPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = await user.createJWTToken();

    // Send it with a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None", // Needed for cross-origin
      expires: new Date(Date.now() + 1 * 3600000),
    });

    // Send success response
    return res
      .status(200)
      .json({ message: "User logged in successfully", data: user });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

authRouter.post("/logout", (req, res) => {
  //expire the cookie
  res.cookie("token", null, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(Date.now()),
  });

  res.json({ message: "logged out successfully" });
});

module.exports = authRouter;
