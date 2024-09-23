const mongoose = require("mongoose");
const validator = require("validator");

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
          // const emailRegex =
          //   /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
          // // Test the email against the regex
          // if (emailRegex.test(value)) {
          //   return true; // Email is valid
          // } else {
          //   return false; // Email is invalid
          // }
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
          const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!passwordRegex.test(value)) {
            return false;
          } else {
            return true;
          }
        },
        message:
          "Password must contain 8 charcters long with one uppercase,one lower case,one special character and one number.",
      },
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["male", "female", "others"], // Valid enum values
        message: "Please select male, female, or others.",
      },
    },
    age: {
      type: Number,
      required: true,
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
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
