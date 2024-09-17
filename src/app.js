const express = require("express");

const app = express();

app.use("/test", (req, res) => {
  res.send("testing at diff routes");
});

app.use("/", (req, res) => {
  res.send("hello from server");
});
app.listen(7777, () => {
  console.log("server running on 7777...🥳");
});
