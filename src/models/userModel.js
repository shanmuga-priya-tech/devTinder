const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [4, "FirstName should be atleast 4 characters long"],
      maxLength: [10, "FirstName should not be more than 10 charcters"],
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      maxLength: [10, "lastName should not be more than 10 charcters"],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => {
          if (!validator.isEmail(value)) {
            return false;
          }
        },
        message:
          "Email ID is not in correct format.It should be something like xyz@gmail.com",
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => {
          if (!validator.isStrongPassword(value)) {
            return false;
          }
        },
        message:
          "Password must contain 8 charcters long with one uppercase,one lower case,one special character and one number.",
      },
    },

    gender: {
      type: String,

      enum: {
        values: ["male", "female", "others"], // Valid enum values
        message: "Please select male, female, or others.",
      },
    },
    age: {
      type: Number,

      min: [18, "You should be atleast 18 years old!"],
      max: [75, "Age should be below 75"],
    },
    photoURL: {
      type: String,
      default:
        "https://img.freepik.com/free-psd/3d-icon-social-media-app_23-2150049569.jpg?size=626&ext=jpg&ga=GA1.1.2117531757.1706517121&semt=ais_hybrid",
      validate: {
        validator: (value) => {
          if (!validator.isURL(value)) {
            return false;
          }
        },
        message: "Invalid image URL",
      },
    },
    about: {
      type: String,
      default: "This is the default about you can edit it if you wish.",
      maxLength: [200, "about can contain 200 characters"],
    },
    passwordChangedAt: Date,
    resetToken: String,
    resetTokenExpires: Date,
  },
  {
    timestamps: true,
  }
);

//schema methods

//creating jwt token
userSchema.methods.createJWTToken = async function () {
  //create a jwt token and send back with cookie along with response
  const token = await jwt.sign({ _id: this._id }, process.env.JWTSECRETKEY, {
    expiresIn: process.env.JWTEXPIRY,
  });

  return token;
};

//validating pwd
userSchema.methods.validPassword = async function (incomingPassword) {
  const isPasswordValid = await bcrypt.compare(incomingPassword, this.password);
  return isPasswordValid;
};

//creating reset token for forgot password
userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  //encrypted version for db
  this.resetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetTokenExpires = Date.now() * 10 * 60 * 1000; //10 mins

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
