const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_URL);
};

module.exports = connectDB;
