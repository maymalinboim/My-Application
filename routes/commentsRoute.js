const express = require("express");
const { Post, User } = require("../db/dbUtils");
const authMiddleware = require("../handlers/auth");

const router = express.Router();
router.use(authMiddleware);

// ADD COMMENT TO POST
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
      return res.status(400).send({ error: "User not found" });
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

// GET ALL COMMENTS OR COMMENT BY ID
router.get("/", async (req, res) => {
  try {
    const { id, postId } = req.query;

    if (id && postId) {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).send({ error: "Post not found" });
      }

      const comment = post.comments.find((c) => c._id.toString() === id);
      if (!comment) {
        return res.status(404).send({ error: "Comment not found" });
      }

      return res.status(200).send(comment);
    }

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

// GET ALL COMMENTS BY POST
router.get("/:postId", async (req, res) => {
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
