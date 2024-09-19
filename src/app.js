const express = require("express");
const { adminAuth } = require("./middlewares/auth");

const app = express();

//this middleware fn runs for all the route that starts with "/admin"
app.use("/admin", adminAuth);

//if the middleware fn didn't send the res will continue to this fn
app.get("/admin/getAllUser", (req, res) => {
  res.send("All user data");
});

//error handling middleware
app.use("/", (err, req, res, next) => {
  if (err) {
    res.status(500).send("something went wrong");
  }
});

app.listen(7777, () => {
  console.log("server running on 7777...🥳");
});
