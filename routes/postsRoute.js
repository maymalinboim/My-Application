const express = require('express');
const Post = require('../db/dbUtils');
const router = express.Router();

// CREATE NEW POST
router.post('/', async (req, res) => {
    try {
        const { title, sender, body } = req.body;
        if (!title || !sender || !body) {
            return res.status(400).send({ error: 'Please provide sender, title and body' });
        }

        const newPost = { title, author: sender, body };
        await Post.create(newPost);
        res.status(201).send(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send({ error: 'An error occurred while creating the post' });
    }
});

// GET ALL POSTS OR POSTS BY SENDER
router.get('/', async (req, res) => {
    try {
        const { sender } = req.query;

        if (sender) {
            const senderPosts = await Post.find({ author: sender });
            if (!senderPosts.length) {
                return res.status(404).send({ error: 'No posts found for this sender' });
            }
            return res.status(200).send(senderPosts);
        }

        const allPosts = await Post.find();
        res.status(200).send(allPosts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send({ error: 'An error occurred while fetching posts' });
    }
});

// GET POST BY ID
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).send({ error: 'Please provide post id' });
        }

        const found = await Post.findById(id);
        if (!found) {
            return res.status(404).send({ error: 'Post not found' });
        }

        res.status(200).send(found);
    } catch (error) {
        console.error('Error fetching post by ID:', error);
        res.status(500).send({ error: 'An error occurred while fetching the post' });
    }
});

// UPDATE POST BY ID
router.put('/:id', async (req, res) => {
    try {
        const updatedPost = {};
        const { title, body } = req.body;
        const id = req.params.id;

        if (!title || !body || !id) {
            return res.status(400).send({ error: 'Please provide post id and update details' });
        }

        if (title) updatedPost.title = title;
        if (body) updatedPost.body = body;

        const postToUpdate = await Post.findOneAndUpdate({ _id: id }, updatedPost, {
            returnDocument: 'after'
        });

        if (!postToUpdate) {
            return res.status(404).send({ error: 'Post not found' });
        }

        res.status(200).send(postToUpdate);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).send({ error: 'An error occurred while updating the post' });
    }
});

module.exports = router;
