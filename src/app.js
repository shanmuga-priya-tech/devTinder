const express = require("express");
const connectDB = require("./config/db");
const app = express();
const User = require("./models/userModel");

//built-in middleware to convert json to js obj
app.use(express.json());

app.post("/user", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.send("user created successfully");
  } catch (err) {
    //console.log(err);
    res.status(400).send("failed to create user");
  }
});

connectDB()
  .then(() => {
    console.log("DB connection successfull...🥳");
    app.listen(7777, () => {
      console.log("server running on 7777...🥳");
    });
  })
  .catch((err) => {
    console.log("error while connecting DB", err);
  });
