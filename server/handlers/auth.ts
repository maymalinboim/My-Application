import { Request, Response, NextFunction } from "express";
const { auth } = require("./authUtils");

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.url === "/register" || req.url === "/login") {
    res.clearCookie("Authorization", {
      path: "/",
      httpOnly: true,
      secure: true,
    });
    return next();
  }

  if (auth(req)) return next();

  res.status(401).send("Unauthorized");
};

export default authMiddleware;
