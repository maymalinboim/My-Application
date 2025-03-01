import { Request, Response, NextFunction } from "express";
import { auth } from "./authUtils";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.url === "/register" || req.url === "/login") {
    res.clearCookie("Authorization", {
      path: "/",
      httpOnly: true,
      secure: true,
    });
    return next();
  }

  if (auth(req, res)) return next();
};

export default authMiddleware;
