const express = require("express");
const { Post, User } = require("../db/dbUtils");
const authMiddleware = require("../handlers/auth");

const router = express.Router();
router.use(authMiddleware);

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment for a post
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *               - postId
 *               - userId
 *             properties:
 *               body:
 *                 type: string
 *                 description: Content of the comment
 *               postId:
 *                 type: string
 *                 description: ID of the post to comment on
 *               userId:
 *                 type: string
 *                 description: ID of the user making the comment
 *     responses:
 *       201:
 *         description: Comment successfully created.
 *       400:
 *         description: Invalid input data.
 *       404:
 *         description: User or Post not found.
 *       500:
 *         description: Error occurred during update.
 */
// ADD COMMENT TO POST
//TO DO - instead of sending userId take ID from cookies (the comment belongs to the one that is logged in)
router.post("/", async (req, res) => {
  try {
    const { body, postId, userId } = req.body;
    if (!body || !postId || !userId) {
      return res
        .status(400)
        .send({ error: "Please provide body, postId, and userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const newComment = { body, user: user._id };

    const update = { $push: { comments: newComment } };
    const updatedPost = await Post.findByIdAndUpdate(postId, update, {
      new: true,
    });

    if (!updatedPost) {
      return res.status(404).send({ error: "Post not found" });
    }

    res.status(201).send(updatedPost);
  } catch (error) {
    console.error("Error adding comment:", error);
    res
      .status(500)
      .send({ error: "An error occurred while adding the comment" });
  }
});

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *               - postId
 *             properties:
 *               body:
 *                 type: string
 *                 description: Updated content of the comment
 *               postId:
 *                 type: string
 *                 description: ID of the associated post
 *     responses:
 *       201:
 *         description: Comment successfully updated.
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: Post or Comment not found.
 *       500:
 *         description: Error occurred during update.
 */
// UPDATE COMMENT BY ID
//TO DO
router.put("/:id", async (req, res) => {
  try {
    const { postId, body } = req.body;
    const id = req.params.id;

    if (!postId || !body || !id) {
      return res
        .status(400)
        .send({ error: "Please provide comment id, body, and postId" });
    }

    const update = {
      $set: {
        "comments.$[comment].body": body,
        "comments.$[comment].updatedAt": Date.now(),
      },
    };

    const options = {
      arrayFilters: [{ "comment._id": id }],
      returnDocument: "after",
    };

    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      update,
      options
    );

    if (!updatedPost) {
      return res.status(404).send({ error: "Post or comment not found" });
    }

    res.status(201).send(updatedPost);
  } catch (error) {
    console.error("Error updating comment:", error);
    res
      .status(500)
      .send({ error: "An error occurred while updating the comment" });
  }
});

/**
 * @swagger
 * /comments:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - postId
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the comment to delete
 *               postId:
 *                 type: string
 *                 description: ID of the associated post
 *     responses:
 *       200:
 *         description: Comment successfully deleted.
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: Post or Comment not found.
 *       500:
 *         description: Error occurred during delete.
 */
// DELETE COMMENT BY ID
//TO DO
router.delete("/", async (req, res) => {
  try {
    const { id, postId } = req.body;

    if (!postId || !id) {
      return res
        .status(400)
        .send({ error: "Please provide comment id and postId" });
    }

    const update = { $pull: { comments: { _id: id } } };
    const updatedPost = await Post.findByIdAndUpdate(postId, update, {
      new: true,
    });

    if (!updatedPost) {
      return res.status(404).send({ error: "Post or comment not found" });
    }

    res.status(200).send(updatedPost);
  } catch (error) {
    console.error("Error deleting comment:", error);
    res
      .status(500)
      .send({ error: "An error occurred while deleting the comment" });
  }
});

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Retrieve all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: A list of all comments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   body:
 *                     type: string
 *                   postId:
 *                     type: string
 *                   userId:
 *                     type: string
 *       404:
 *         description: No comments found.
 *       500:
 *         description: Error occurred during fetch.
 */
// GET ALL COMMENTS
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    const allComments = posts.flatMap((post) => post.comments);

    if (allComments.length === 0) {
      return res.status(404).send({ error: "No comments found" });
    }

    res.status(200).send(allComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching comments" });
  }
});

/**
 * @swagger
 * /comments/commentId:
 *   get:
 *     summary: Retrieve a comment by its ID
 *     tags: [Comments]
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment
 *       - name: postId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the associated post
 *     responses:
 *       200:
 *         description: Details of the comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 body:
 *                   type: string
 *                 postId:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: Post or Comment not found.
 *       500:
 *         description: Error occurred during fetch.
 */
// GET COMMENT BY ID
router.get("/commentId", async (req, res) => {
  try {
    const { id, postId } = req.query;
    if (!id || !postId) {
      return res
        .status(400)
        .send({ error: "Please provide comment id and postId" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    const comment = post.comments.find((c) => c._id.toString() === id);
    if (!comment) {
      return res.status(404).send({ error: "Comment not found" });
    }

    return res.status(200).send(comment);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching comments" });
  }
});

/**
 * @swagger
 * /comments/postId/{postId}:
 *   get:
 *     summary: Retrieve all comments for a specific post
 *     tags: [Comments]
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to fetch comments for
 *     responses:
 *       200:
 *         description: Comments for the specified post.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   body:
 *                     type: string
 *                   userId:
 *                     type: string
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Error occurred during fetch.
 */
// GET ALL COMMENTS BY POST
router.get("/postId/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    if (!postId) {
      return res.status(400).send({ error: "Please provide postId" });
    }

    const post = await Post.findById(postId).populate("comments.user");
    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    res.status(200).send(post.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching comments" });
  }
});

module.exports = router;
