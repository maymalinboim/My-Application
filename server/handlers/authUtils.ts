import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const accessTokenOptions: SignOptions = {
  expiresIn: "15m",
  algorithm: "HS256",
};
const refreshTokenOptions: SignOptions = {
  expiresIn: "7d",
  algorithm: "HS256",
};

export const generateAccessToken = (user: { userId: string }): string => {
  if (!process.env.JWT_SECRET)
    throw new Error("JWT_SECRET is not defined in environment variables");
  return jwt.sign(user, process.env.JWT_SECRET, accessTokenOptions);
};

export const generateRefreshToken = (user: { userId: string }): string => {
  if (!process.env.JWT_REFRESH_SECRET)
    throw new Error(
      "JWT_REFRESH_SECRET is not defined in environment variables"
    );
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, refreshTokenOptions);
};

export const getAccessToken = (req: Request): string | undefined => {
  if (req.cookies) {
    const authHeader = req.cookies["Authorization"];
    if (authHeader) {
      return decodeURIComponent(authHeader.replace("Bearer%20", "")).split(
        " "
      )[1];
    }
  }
};

export const verifyAccessToken = (token: string): { userId: string } | null => {
  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing");
    return jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (
  token: string
): { userId: string } | null => {
  try {
    if (!process.env.JWT_REFRESH_SECRET)
      throw new Error("JWT_REFRESH_SECRET is missing");
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as {
      userId: string;
    };
  } catch (error) {
    return null;
  }
};

export const auth = (req: Request, res: Response): boolean => {
  try {
    const authHeader = req.cookies?.Authorization;
    if (!authHeader) {
      res.status(401).json({ error: "Unauthorized" });
      return false;
    }

    let token = authHeader.replace("Bearer ", "");
    let decoded = verifyAccessToken(token);

    if (!decoded) {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ error: "Unauthorized" });
        return false;
      }

      const refreshDecoded = verifyRefreshToken(refreshToken);
      if (!refreshDecoded) {
        res.status(403).json({ error: "Invalid refresh token" });
        return false;
      }

      const newAccessToken = generateAccessToken({
        userId: refreshDecoded.userId,
      });
      res.cookie("Authorization", `Bearer ${newAccessToken}`, {
        httpOnly: true,
        secure: true,
        domain: ".cs.colman.ac.il",
      });

      decoded = refreshDecoded;
    }

    (req as any).user = decoded;

    console.log("User is authenticated");
    return true;
  } catch (error) {
    console.error("Error authenticating user:", error);
    return false;
  }
};
