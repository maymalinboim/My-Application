const { auth } = require("./authUtils");

const authMiddleware = async (req, res, next) => {
  if (req.url === "/register" || req.url === "/login") {
    res.clearCookie("Authorization", {
      path: "/",
      httpOnly: true,
      secure: true,
    });
    return next();
  }

  if (auth(req)) return next();

  res.status(401).send("Unauthorized");
};

module.exports = authMiddleware;
