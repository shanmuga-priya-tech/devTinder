const express = require("express");
const connectDB = require("./config/db");
const app = express();
const cookieParser = require("cookie-parser");

//importing routers
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");

//built-in middleware to convert json to js obj
app.use(express.json());

//built-in middleware to parse cookies
app.use(cookieParser());

//connecting to routers
app.use("/", authRouter);
app.use("/profile", profileRouter);

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
