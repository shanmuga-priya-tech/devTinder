const express = require("express");
const connectDB = require("./config/db");
const app = express();
const User = require("./models/userModel");
const bcrypt = require("bcrypt");
const { validateSignUp } = require("./utils/validation");

//built-in middleware to convert json to js obj
app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    //API LEVEL VALIDATION
    validateSignUp(req);

    const { firstName, lastName, email, password } = req.body;
    //pASSWORD HASH
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await user.save();
    res.send("user created successfully");
  } catch (err) {
    //console.log(err);
    res.status(400).send("failed to create user" + err.message);
  }
});

app.get("/user", async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(404).send("user not found");
    } else {
      res.send(user);
    }
  } catch (err) {
    //console.log(err);
    res.status(400).send("something went wrong");
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) {
      res.status(404).send("users not found");
    } else {
      res.send(users);
    }
  } catch (err) {
    //console.log(err);
    res.status(400).send("something went wrong");
  }
});

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;
  try {
    //API LEVEL VALIDATION
    const allowed_fields = ["skills", "about", "photoURL"];
    //foe every key in the incomng data we are checking whether these fields are included in allowed field or not
    const isUpdateAllowed = Object.keys(data).every((k) =>
      allowed_fields.includes(k)
    );

    if (!isUpdateAllowed) {
      throw new Error(
        "You can update only particular fields(photoURL,about,skills)! "
      );
    }

    if (data.skills.length > 10) {
      throw new Error("Only 10 skills are allowed!");
    }

    const user = await User.findByIdAndUpdate(userId, data, {
      runValidators: true,
    });
    res.send("user updated successfully");
  } catch (err) {
    res.status(400).send("update failed:" + " " + err.message);
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await User.findByIdAndDelete(userId);
    res.send("user deleted successfully");
  } catch (err) {
    res.status(400).send("something went wrong");
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
