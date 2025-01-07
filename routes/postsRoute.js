const express = require("express");
const { Post, User } = require("../db/dbUtils"); // Import both Post and User models
const authMiddleware = require("../handlers/auth");
const { options, getToken } = require("../handlers/authUtils");
const jwt = require("jsonwebtoken");

const router = express.Router();
router.use(authMiddleware);

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
router.post("/", async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).send({ error: "Please provide title, and body" });
    }

    const token = getToken(req);
    const { userId } = jwt.verify(token, process.env.JWT_SECRET, options);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const newPost = new Post({
      title,
      body,
      author: userId,
    });

    await newPost.save();

    // Add post reference to the user's posts array
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
router.get("/", async (req, res) => {
  try {
    const allPosts = await Post.find();
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
router.get("/sender/:sender", async (req, res) => {
  try {
    const sender = req.params.sender;

    if (!sender) {
      return res.status(400).send({ error: "Please provide sender id" });
    }
    const senderPosts = await Post.find({ author: sender }).populate("author");
    if (!senderPosts.length) {
      return res.status(404).send({ error: "No posts found for this sender" });
    }
    return res.status(200).send(senderPosts);
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
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).send({ error: "Please provide post id" });
    }

    const found = await Post.findById(id).populate("author");
    if (!found) {
      return res.status(404).send({ error: "Post not found" });
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
router.put("/:id", async (req, res) => {
  try {
    const updatedPost = {};
    const { title, body } = req.body;
    const id = req.params.id;

    if (!title || !body || !id) {
      return res
        .status(400)
        .send({ error: "Please provide post id and update details" });
    }

    if (title) updatedPost.title = title;
    if (body) updatedPost.body = body;

    const postToUpdate = await Post.findOne({ _id: id });

    if (!postToUpdate) {
      return res.status(404).send({ error: "Post not found" });
    }

    const token = getToken(req);
    const { userId } = jwt.verify(token, process.env.JWT_SECRET, options);

    if (postToUpdate.author.toString() !== userId) {
      return res
        .status(401)
        .send({ error: "No permission to update this post" });
    }

    res.status(200).send(
      await Post.findOneAndUpdate({ _id: id }, updatedPost, {
        returnDocument: "after",
      })
    );
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
router.delete("/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    if (!postId) {
      return res.status(400).send({ error: "Please provide post id" });
    }

    const postToDelete = await Post.findById(postId).populate("author");
    if (!postToDelete) {
      return res.status(404).send({ error: "Post not found" });
    }

    const token = getToken(req);
    const { userId } = jwt.verify(token, process.env.JWT_SECRET, options);

    if (postToDelete.author._id.toString() !== userId) {
      return res
        .status(401)
        .send({ error: "No permission to delete this post" });
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

module.exports = router;
