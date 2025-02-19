import jwt, { SignOptions } from "jsonwebtoken";
import { Request } from "express";

export const options: SignOptions = { expiresIn: "24h", algorithm: "HS256" };

export const generateToken = (username: { userId: string }): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(username, process.env.JWT_SECRET, options);
};

export const getToken = (req: Request): string | undefined => {
  if (req.cookies) {
    const authHeader = req.cookies["Authorization"];
    if (authHeader) {
      return decodeURIComponent(authHeader.replace("Bearer%20", ""))
        .split(" ")[1]
        .slice(0, -1);
    }
  }
};

export const auth = (req: Request): boolean => {
  try {
    const token = getToken(req);
    console.log("token: ", token);
    if (!token) return false;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      options
    ) as {
      userId: string;
    };

    if (!decoded?.userId) return false;

    console.log("User is authenticated");
    return true;
  } catch (error) {
    console.error("Error authenticating user:", error);
    return false;
  }
};
