const jwt = require("jsonwebtoken");

const options = { expiresIn: "24 h", algorithm: "HS256" };
const generateToken = (username) =>
  jwt.sign(username, process.env.JWT_SECRET, options);

const auth = (authToken) => {
  try {
    if (!authToken) return false;

    // const authSplit = authToken.split(" ");
    // if (authSplit.length != 2 || authSplit[0].toLowerCase()) return false;

    // const token = authSplit[1];

    const { userId } = jwt.verify(authToken, process.env.JWT_SECRET, options);

    if (!userId) return false;

    console.log("User is authenticated");
    return true;
  } catch (error) {
    console.log("error authenticating user", error);
    return false;
  }
};

module.exports = { generateToken, auth, options };
