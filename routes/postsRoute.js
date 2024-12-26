const express = require("express");
const { Post, User } = require("../db/dbUtils"); // Import both Post and User models
const { authMiddleware } = require("../handlers/auth");

const router = express.Router();
router.use(authMiddleware);

// CREATE NEW POST
router.post("/", async (req, res) => {
  try {
    const { title, sender, body } = req.body;
    if (!title || !sender || !body) {
      return res
        .status(400)
        .send({ error: "Please provide sender, title, and body" });
    }

    const user = await User.findById(sender);
    if (!user) {
      return res.status(400).send({ error: "User not found" });
    }

    const newPost = new Post({
      title,
      body,
      author: user._id,
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

// GET ALL POSTS OR POSTS BY SENDER
router.get("/", async (req, res) => {
  try {
    const { sender } = req.query;

    if (sender) {
      const senderPosts = await Post.find({ author: sender }).populate(
        "author"
      );
      if (!senderPosts.length) {
        return res
          .status(404)
          .send({ error: "No posts found for this sender" });
      }
      return res.status(200).send(senderPosts);
    }

    // Fetch all posts
    const allPosts = await Post.find().populate("author");
    res.status(200).send(allPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send({ error: "An error occurred while fetching posts" });
  }
});

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

    const postToUpdate = await Post.findOneAndUpdate({ _id: id }, updatedPost, {
      returnDocument: "after",
    });

    if (!postToUpdate) {
      return res.status(404).send({ error: "Post not found" });
    }

    res.status(200).send(postToUpdate);
  } catch (error) {
    console.error("Error updating post:", error);
    res
      .status(500)
      .send({ error: "An error occurred while updating the post" });
  }
});

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
