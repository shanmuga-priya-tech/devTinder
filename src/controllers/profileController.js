const { validateEditProfile } = require("../utils/validation");

exports.getCurrentUser = async (req, res) => {
  try {
    //getting the user from auth middleware
    const user = req.user;
    res.json({ data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.editProfile = async (req, res) => {
  try {
    //validation
    validateEditProfile(req);

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfuly`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).json({ message: "ERROR: " + err.message });
  }
};
