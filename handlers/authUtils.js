const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const options = { expiresIn: "24 h", algorithm: "HS256" };
const generateToken = (username) =>
  jwt.sign(username, process.env.JWT_SECRET, options);

const getToken = (req) => {
  if (req.headers.cookie) {
    const cookies = cookie.parse(req.headers.cookie);

    return decodeURIComponent(cookies.Authorization.replace("Bearer%20", ""))
      .split(" ")[1]
      .slice(0, -1);
  }
};

const auth = (req) => {
  try {
    const token = getToken(req);

    if (!token) return false;

    const { userId } = jwt.verify(token, process.env.JWT_SECRET, options);

    if (!userId) return false;

    console.log("User is authenticated");
    return true;
  } catch (error) {
    console.log("error authenticating user", error);
    return false;
  }
};

module.exports = { generateToken, auth, options, getToken };
