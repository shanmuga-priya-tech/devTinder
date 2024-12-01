const User = require("../models/userModel");
const sendEmail = require("../utils/email");
const { validateSignUp, validateEmail } = require("../utils/validation");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.signup = async (req, res) => {
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
};

exports.login = async (req, res) => {
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
};

exports.logout = (req, res) => {
  //expire the cookie
  res.cookie("token", null, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(Date.now()),
  });

  res.json({ message: "logged out successfully" });
};

exports.forgotPassword = async (req, res) => {
  let user;
  try {
    //check whether the email is present or not
    const { email } = req.body;
    if (!email) {
      throw new Error("please provide a valid Email.");
    }

    //validate email
    validateEmail(req);

    //find user based on provided email
    user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("No user Found with this Email ID !");
    }

    //create a resetUrl with resetToken from method created on userschema
    const resetToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const subject = "Password Reset Token(valid for only 10 minutes)";

    const message = `
    <p>You can reset your password by clicking the button below:</p>
    <a href="http://localhost:5173/resetpassword/${resetToken}" style="
        display: inline-block;
        background-color: #007BFF;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        font-weight: bold;
    ">Reset Password</a>
    <p>If you remember your password, please ignore this email.</p>
  `;

    //send it to user's email
    await sendEmail({ email: user.email, subject: subject, message: message });

    res.status(200).json({ message: "Email sent succesfully" });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(400).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    console.log(req.params.resetToken);
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    //getting user based on resetToken and check for token expiry
    const user = await User.findOne({
      passwordResetToken: hashedResetToken,
      passwordResetTokenExpires: { $gte: Date.now() },
    });
    console.log(user);
    if (!user) {
      throw new Error("Invalid User or Token!");
    }

    //validating the incoming password
    const { password, passwordConfirm } = req.body;
    if (password !== passwordConfirm) {
      throw new Error("password mismatch!");
    }
    //updatinng the user doc with new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    //log the user in by sending jwt
    // Create JWT token
    const token = await user.createJWTToken();

    // Send it with a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None", // Needed for cross-origin
      expires: new Date(Date.now() + 1 * 3600000),
    });

    res.status(200).json({ message: "password changed successfully!" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
