import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../db/dbUtils";
import authMiddleware from "../handlers/auth";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
  getAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../handlers/authUtils";

const router = express.Router();
router.use(authMiddleware);

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered.
 *       400:
 *         description: Invalid input data.
 *       500:
 *         description: Error occurred during creation.
 */
// REGISTER
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).send({ error: "Please provide all fields" });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(400).send({ error: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    const user = await newUser.save();
    const userId = user._id.toString();

    const accessToken = generateAccessToken({ userId });
    const refreshToken = generateRefreshToken({ userId });

    res.cookie("refreshToken", refreshToken);
    res.cookie("Authorization", `Bearer ${accessToken}`);

    res.status(201).send({ accessToken });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({ error: "An error occurred" });
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully logged in.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Invalid credentials.
 *       500:
 *         description: Error occurred during creation.
 */
// LOGIN
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).send({ error: "Please provide all fields" });
      return;
    }

    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const userId = existingUser._id.toString();
    const accessToken = generateAccessToken({ userId });
    const refreshToken = generateRefreshToken({ userId });

    res.cookie("refreshToken", refreshToken);
    res.cookie("Authorization", `Bearer ${accessToken}`);

    res.status(201).send({ accessToken });
  } catch (error) {
    console.error("Error login user:", error);
    res.status(500).send({ error: "An error occurred" });
  }
});

// router.post("/refresh", (req: Request, res: Response) => {
//   const refreshToken = req.cookies["refreshToken"];
//   if (!refreshToken) {
//     res.status(403).send("Refresh token is required");
//     return;
//   }

//   const decoded = verifyRefreshToken(refreshToken);
//   if (!decoded) {
//     res.status(403).send("Invalid or expired refresh token");
//     return;
//   }

//   const newAccessToken = generateAccessToken({ userId: decoded.userId });
//   res.cookie("Authorization", `Bearer ${newAccessToken}`);

//   res.json({ accessToken: newAccessToken });
// });

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully logged out.
 *       401:
 *         description: Unauthorized.
 */
// LOGOUT
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("Authorization");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 */
// GET ALL USERS
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ error: "An error occurred while fetching users" });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details.
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Error occurred during fetch.
 */
// GET USER BY ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).send({ error: "Please provide user id" });
      return;
    }

    const user = await User.findById(id).populate("posts");

    if (!user) {
      res.status(404).send({ error: "User not found" });
      return;
    }

    res.status(200).send(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching the user" });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully updated.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Error occurred during update.
 */
// UPDATE USER BY ID
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const id = req.params.id;

    if (!id) {
      res
        .status(400)
        .send({ error: "Please provide user id and update details" });
      return;
    }

    const updateData: { username?: string; email?: string; password?: string } =
      {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (password) updateData.password = hashedPassword;

    const userToUpdate = await User.findOne({ _id: id });

    if (!userToUpdate) {
      res.status(404).send({ error: "User not found" });
      return;
    }

    const token = getAccessToken(req) || "";
    const { userId } = verifyAccessToken(token) || { userId: "" };

    if (userToUpdate._id.toString() !== userId) {
      res.status(401).send({ error: "No permission to update this user" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedUser) {
      res.status(404).send({ error: "User not found" });
      return;
    }

    res.status(200).send(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .send({ error: "An error occurred while updating the user" });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User successfully deleted.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Error occurred during delete.
 */
// DELETE USER BY ID
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).send({ error: "Please provide user id" });
      return;
    }

    const token = getAccessToken(req) || "";
    const { userId } = verifyAccessToken(token) || { userId: "" };

    if (id !== userId) {
      res.status(401).send({ error: "No permission to delete this post" });
      return;
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      res.status(404).send({ error: "User not found" });
      return;
    }

    res.status(200).send(deletedUser);
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .send({ error: "An error occurred while deleting the user" });
  }
});

export default router;
