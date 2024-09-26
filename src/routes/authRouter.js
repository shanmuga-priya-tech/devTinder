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
    res.status(200).json({ message: "user created successfully" });
  } catch (err) {
    //console.log(err);
    res.status(400).json({ message: "failed to create user" + err.message });
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

      res.json({ message: "user logged in successfully", data: user });
    } else {
      throw new Error("Incorrect emailID/password");
    }
  } catch (err) {
    res.status(400).json({ message: "ERROR: " + err.message });
  }
});

authRouter.post("/logout", (req, res) => {
  //expire the cookie
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  res.json({ message: "logged out successfully" });
});

//dummy forget password implementation without email
authRouter.patch("/forgetPassword", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    //finding user based on email
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("user not found");
    }

    //compare the incoming password with the already existing hashed password
    const isPasswordSame = await user.validPassword(newPassword, user.password);
    if (isPasswordSame) {
      throw new Error("New password is similar to the existing one!");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "password updated successfully!", data: user });
  } catch (err) {
    res.status(400).json({ message: "ERROR: " + err.message });
  }
});

//Actual implementation
// authRouter.post("/forgetPassword", async (req, res) => {
//   try {
//     const email = req.body;
//     //getting user based on email id
//     const user = await User.findOne({ email: email });
//     if (!user) {
//       throw new Error("user not found");
//     }
//     //generating random reset token which expires in 10 mins
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const resetTokenExpiry = Date.now() + process.env.RESETTOKENEXPIRY;

//     //save reset token and expiry time to db
//     user.resetToken = resetToken;
//     user.resetTokenExpiry = resetTokenExpiry;
//     await user.save();

//     //send the resetLink in email
//     const resetEmailLink = `https://devTinder/reset-password/${resetToken}`;
//     await sendPasswordResetLink(user.email, resetEmailLink);
//   } catch (err) {
//     res.status(400).send("ERROR: " + err.message);
//   }
// });
module.exports = authRouter;
