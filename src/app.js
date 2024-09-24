const express = require("express");
const connectDB = require("./config/db");
const app = express();
const User = require("./models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateSignUp } = require("./utils/validation");
const { userAuth } = require("./middlewares/auth");
const cookieParser = require("cookie-parser");
const { connect } = require("mongoose");

//built-in middleware to convert json to js obj
app.use(express.json());

//built-in middleware to parse cookies
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //Getting user doc based on email
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Incorrect email Id/password");
    }
    //comparing the password with hashed one
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      //create a jwt token and send back with cookie along with response
      const token = await jwt.sign(
        { _id: user._id },
        process.env.JWTSECRETKEY,
        { expiresIn: process.env.JWTEXPIRY }
      );

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

app.get("/profile", userAuth, async (req, res) => {
  try {
    //getting the user from auth middleware
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("DB connected successfully");
    //start the server
    app.listen(7777, () => {
      console.log(`Server is running on port ${7777}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
