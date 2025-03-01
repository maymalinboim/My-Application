import express, { Request, Response } from "express";
import { Post, User } from "../db/dbUtils";
import authMiddleware from "../handlers/auth";
import jwt from "jsonwebtoken";
import { IPost, IUser } from "../models/models";
import { getAccessToken, verifyAccessToken } from "../handlers/authUtils";
import upload from "../handlers/uploadUtils";

const router = express.Router();
router.use(authMiddleware);

interface PostRequestBody {
  title: string;
  body: string;
  image: string;
}

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the post
 *               body:
 *                 type: string
 *                 description: Content of the post
 *     responses:
 *       201:
 *         description: Post successfully created.
 *       400:
 *         description: Invalid input data.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Error occurred during creation.
 */
// CREATE NEW POST
router.post("/", upload.single("image"), async (req: Request, res: Response) => {
  try {
    const { title, body }: PostRequestBody = req.body;
    const image = req.file ? `${req.file?.destination}${req.file?.filename}` : undefined;

    if (!title || !body) {
      res.status(400).send({ error: "Please provide title and body" });
      return;
    }

    const token = getAccessToken(req) || "";
    const { userId } = verifyAccessToken(token) || { userId: "" };
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).send({ error: "User not found" });
      return;
    }

    const newPost = new Post({
      title,
      body,
      author: userId,
      image
    });

    await newPost.save();

    user.posts.push(newPost._id);
    await user.save();

    res.status(201).send(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res
      .status(500)
      .send({ error: "An error occurred while creating the post" });
  }
});

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Retrieve all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of all posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *       500:
 *         description: Error occurred during fetch.
 */
// GET ALL POSTS
router.get("/", async (req: Request, res: Response) => {
  try {
    const allPosts = await Post.find().populate("author").sort({ createdAt: -1 });
    res.status(200).send(allPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send({ error: "An error occurred while fetching posts" });
  }
});

/**
 * @swagger
 * /posts/sender/{authorId}:
 *   get:
 *     summary: Retrieve posts by a specific author
 *     tags: [Posts]
 *     parameters:
 *       - name: authorId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the author
 *     responses:
 *       200:
 *         description: A list of posts by the specified author.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   authorId:
 *                     type: string
 *                     description: The ID of the author who created the post
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: No posts found for the given author.
 *       500:
 *         description: Error occurred during fetch.
 */
// GET ALL POSTS BY SENDER
router.get("/sender/:sender", async (req: Request, res: Response) => {
  try {
    const sender = req.params.sender;

    if (!sender) {
      res.status(400).send({ error: "Please provide sender id" });
      return;
    }
    const senderPosts = await Post.find({ author: sender }).populate("author").sort({ createdAt: -1 });;
    if (!senderPosts.length) {
      res.status(404).send({ error: "No posts found for this sender" });
      return;
    }
    res.status(200).send(senderPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send({ error: "An error occurred while fetching posts" });
  }
});

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Retrieve a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details.
 *       400:
 *         description: Ivalid input.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Error occurred during fetch.
 */
// GET POST BY ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).send({ error: "Please provide post id" });
      return;
    }

    const found = await Post.findById(id).populate("author");
    if (!found) {
      res.status(404).send({ error: "Post not found" });
      return;
    }

    res.status(200).send(found);
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching the post" });
  }
});

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post successfully updated.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Error occurred during update.
 */
// UPDATE POST BY ID
router.put("/:id", upload.single("image"), async (req: Request, res: Response) => {
  try {
    const updatedPost: Partial<PostRequestBody> = {};
    const { title, body } = req.body;
    const image = `${req.file?.destination}${req.file?.filename}`;
    const id = req.params.id;

    if (!title || !body || !id) {
      res
        .status(400)
        .send({ error: "Please provide post id and update details" });
      return;
    }

    if (title) updatedPost.title = title;
    if (body) updatedPost.body = body;
    if (image) updatedPost.image = image;

    const post = await Post.findById(id).populate("author");
    const postToUpdate = post as unknown as IPost & { author: IUser };

    if (!postToUpdate) {
      res.status(404).send({ error: "Post not found" });
      return;
    }

    const token = getAccessToken(req) || "";
    const { userId } = verifyAccessToken(token) || { userId: "" };

    if (postToUpdate.author._id.toString() !== userId) {
      res.status(401).send({ error: "No permission to update this post" });
      return;
    }

    const updated = await Post.findOneAndUpdate({ _id: id }, updatedPost, {
      returnDocument: "after",
    });

    res.status(200).send(updated);
  } catch (error) {
    console.error("Error updating post:", error);
    res
      .status(500)
      .send({ error: "An error occurred while updating the post" });
  }
});

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post successfully deleted.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Error occurred during delete.
 */
// DELETE POST BY ID
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    if (!postId) {
      res.status(400).send({ error: "Please provide post id" });
      return;
    }

    const post = await Post.findById(postId).populate("author");
    const postToDelete = post as unknown as IPost & { author: IUser };

    if (!postToDelete) {
      res.status(404).send({ error: "Post not found" });
      return;
    }

    const token = getAccessToken(req) || "";
    const { userId } = verifyAccessToken(token) || { userId: "" };

    if (postToDelete.author._id.toString() !== userId) {
      res.status(401).send({ error: "No permission to delete this post" });
      return;
    }

    const user = postToDelete.author;
    user.posts.pull(postId);
    await user.save();

    await Post.findByIdAndDelete(postId);

    res.status(200).send({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .send({ error: "An error occurred while deleting the post" });
  }
});

export default router;
