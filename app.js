const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const postsRoute = require("./routes/postsRoute");
const commentsRoute = require("./routes/commentsRoute");
const usersRoute = require("./routes/usersRoute");

const app = express();
app.use(bodyParser.json());

app.use("/posts", postsRoute);
app.use("/comments", commentsRoute);
app.use("/users", usersRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

try {
  mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} catch (error) {
  console.log("Initial connection error", error);
}

const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("connected to mongo"));
