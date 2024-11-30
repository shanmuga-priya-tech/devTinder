const validator = require("validator");

const validateSignUp = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  }
  if (!email || !validator.isEmail(email)) {
    throw new Error("Email is not valid");
  }
  if (!password) {
    throw new Error("password not valid");
  }
};

const validateEditProfile = (req) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",

    "photoURL",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedFields.includes(field)
  );

  return isEditAllowed;
};

const validateEmail = (req) => {
  const { email } = req.body;

  if (!email || !validator.isEmail(email)) {
    throw new Error("Email is not valid");
  }
};

module.exports = {
  validateSignUp,
  validateEditProfile,
  validateEmail,
};
