import express from "express";
import passport from "passport";
import "../handlers/passportConfig";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../handlers/authUtils";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const { userId } = req.user as any;

    const accessToken = generateAccessToken({ userId });
    const refreshToken = generateRefreshToken({ userId });

    res.cookie("refreshToken", refreshToken);
    res.cookie("Authorization", `Bearer ${accessToken}`);

    const clientPort = process.env.CLIENT_PORT || 5173;

    res.redirect(`http://localhost:${clientPort}`);
  }
);

export default router;
