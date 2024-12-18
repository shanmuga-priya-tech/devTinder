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
    origin: process.env.FRONTEND_URL, // Your frontend Netlify URL
    credentials: true, // Required to allow sending cookies
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

//middleware to handle undefined routes
app.all("*", (req, res, next) => {
  res
    .status(404)
    .json({ message: `can't find ${req.originalUrl} on this server!` });
});

const server = connectDB()
  .then(() => {
    console.log("DB connected successfully");
    //start the server
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

//to handle any uncaught promise
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

//to handle any occurs in sync code
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
