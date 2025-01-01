const { auth } = require("./authUtils");

const authMiddleware = async (req, res, next) => {
  if (req.url === "/register" || req.url === "/login") return next();

  const { token } = req.body;
  // if (auth(req.headers["authorization"])) return next();

  if (auth(token)) return next();

  res.status(401).send("Unauthorized");
};

module.exports = authMiddleware;
