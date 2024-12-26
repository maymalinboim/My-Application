const jwt = require("jsonwebtoken");

const options = { expiresIn: "24 h", algorithm: "HS256" };
const generateToken = (username) =>
  jwt.sign(username, process.env.JWT_SECRET, options);

const auth = (authToken) => {
  try {
    if (!authToken) return false;

    const authSplit = authToken.split(" ");
    if (authSplit.length != 2 || authSplit[0].toLowerCase()) return false;

    const token = authSplit[1];
    const isVerified = jwt.verify(token, process.env.JWT_SECRET, options);
    if (!isVerified) return false;

    console.log("User is authenticated");
    return true;
  } catch (error) {
    console.log("error authenticating user", error);
    return false;
  }
};

const authMiddleware = (req, res, next) => {
  if (auth(req.headers["authorization"])) return next();
  res.status(401).send("Unauthorized");
};

module.exports = { generateToken, auth, authMiddleware };
