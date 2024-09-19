const adminAuth = (req, res, next) => {
  console.log("checking for authorization!");
  const token = "xyz";
  const isAuthorised = token === "xyz";
  if (!isAuthorised) {
    res.status(401).send("Unauthorized");
  }
  next();
};

module.exports = {
  adminAuth,
};
