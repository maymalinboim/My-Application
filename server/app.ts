import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import postsRoute from "./routes/postsRoute";
import commentsRoute from "./routes/commentsRoute";
import usersRoute from "./routes/usersRoute";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig";
import cors from "cors";
import path from "path";
import expressSession from "express-session";
import passport from "passport";
import googleRoute from "./routes/googleRoute";

dotenv.config();
const app = express();

const corsOptions: cors.CorsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  credentials: true,
};

const expressSessionOptions = {
  secret: process.env.SESSION_SECRET || "mysecret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
};

// Middlewares
app.use(cors(corsOptions));
app.use(expressSession(expressSessionOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use("/auth", googleRoute);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/posts", postsRoute);
app.use("/comments", commentsRoute);
app.use("/users", usersRoute);
app.use("/images", express.static(path.join(__dirname, "images")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Database connection
try {
  mongoose.connect(process.env.DATABASE_URL as string, {});
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Initial connection error", error);
}

// Handle MongoDB events
const db = mongoose.connection;
db.on("error", (error) => console.error("MongoDB connection error:", error));
db.once("open", () => console.log("MongoDB connection established"));
