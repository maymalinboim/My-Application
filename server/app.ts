import express, { Express } from "express";
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

const promise: Promise<Express> = new Promise((resolve, reject) => {
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

  // Database connection
  mongoose
    .connect(process.env.DATABASE_URL as string, {})
    .then(() => {
      console.log("Connected to MongoDB");
      resolve(app);
    })
    .catch((error) => {
      console.error("Initial connection error", error);
      reject(error);
    });

  const db = mongoose.connection;
  db.on("error", (error) => console.error("MongoDB connection error:", error));
  db.once("open", () => console.log("MongoDB connection established"));
});

export default promise;
