const express = require("express");
const connectDB = require("./config/db");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

//importing routers
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const connectionReqRouter = require("./routes/connectinReqRouter");
const userRouter = require("./routes/userRouter");

//cors middleware to allow other IP address and setting thedomains which we want to allow
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

//built-in middleware to convert json to js obj
app.use(express.json());

//built-in middleware to parse cookies
app.use(cookieParser());

//connecting to routers
app.use("/", authRouter);
app.use("/profile", profileRouter);
app.use("/request", connectionReqRouter);
app.use("/user", userRouter);

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
