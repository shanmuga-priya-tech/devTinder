const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const userAuth = async (req, res, next) => {
  try {
    //getting the token from cookie
    const { token } = req.cookies;
    console.log(token);
    if (!token) {
      return res.status(401).send("Please Login!");
    }
    //validating the token
    const decodedToken = await jwt.verify(token, process.env.JWTSECRETKEY);
    const { _id } = decodedToken;

    //getting the user based on token
    const user = await User.findById(_id);

    if (!user) {
      throw new Error("user not found!");
    }

    //set the user to req inorder to use it in request handler
    req.user = user;

    next();
  } catch (err) {
    res.status(400).json({ message: "ERROR: " + err.message });
  }
};

module.exports = {
  userAuth,
};
