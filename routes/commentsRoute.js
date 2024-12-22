const express = require('express');
const Post = require('../db/dbUtils');
const router = express.Router();

// ADD COMMENT TO POST
router.post('/', async (req, res) => {
    try {
        const { body, postId } = req.body;
        if (!body || !postId) {
            return res.status(400).send({ error: 'Please provide body and postId' });
        }

        const newComment = { body, date: Date.now() };
        const update = { $push: { comments: newComment } };

        const updatedPost = await Post.findOneAndUpdate({ _id: postId }, update, {
            returnDocument: 'after'
        });

        res.status(201).send(updatedPost);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send({ error: 'An error occurred while adding the comment' });
    }
});

// UPDATE COMMENT BY ID
router.put('/:id', async (req, res) => {
    try {
        const { postId, body } = req.body;
        const id = req.params.id;

        if (!postId || !body || !id) {
            return res.status(400).send({ error: 'Please provide comment id, body and postId' });
        }

        const update = {
            $set: {
                "comments.$[comment].body": body,
                "comments.$[comment].date": Date.now()
            }
        };

        const options = {
            arrayFilters: [{ "comment._id": id }],
            returnDocument: 'after'
        };

        const updatedPost = await Post.findOneAndUpdate({ _id: postId }, update, options);

        if (!updatedPost) {
            return res.status(404).send({ error: 'Post or comment not found' });
        }

        res.status(201).send(updatedPost);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).send({ error: 'An error occurred while updating the comment' });
    }
});

// DELETE COMMENT BY ID
router.delete('/', async (req, res) => {
    try {
        const { id, postId } = req.query;
        if (!postId || !id) {
            return res.status(400).send({ error: 'Please provide comment id and postId' });
        }

        const update = { $pull: { "comments": { _id: id } } };

        const deleted = await Post.findOneAndUpdate({ _id: postId }, update, { returnDocument: 'after' });

        if (!deleted) {
            return res.status(404).send({ error: 'Comment not found' });
        }

        res.status(200).send(deleted);
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send({ error: 'An error occurred while deleting the comment' });
    }
});

// GET ALL COMMENTS OR COMMENTS BY ID
router.get('/', async (req, res) => {
    try {
        const { id, postId } = req.query;

        if (id && postId) {
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).send({ error: 'Post not found' });
            }

            const comment = post.comments.find(c => c._id.toString() === id);
            if (!comment) {
                return res.status(404).send({ error: 'Comment not found' });
            }

            return res.status(200).send(comment);
        }

        const posts = await Post.find();
        const allComments = posts.flatMap(post => post.comments);

        if (allComments.length === 0) {
            return res.status(404).send({ error: 'No comments found' });
        }

        res.status(200).send(allComments);

    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).send({ error: 'An error occurred while fetching comments' });
    }
});

// GET ALL COMMENTS OF POST
router.get('/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        if (!postId) {
            return res.status(400).send({ error: 'Please provide postId' });
        }

        const postOfComments = await Post.findById(postId);

        if (!postOfComments) {
            return res.status(404).send({ error: 'Post not found' });
        }

        res.status(200).send(postOfComments.comments);
    } catch (error) {
        console.error('Error fetching comments of post:', error);
        res.status(500).send({ error: 'An error occurred while fetching comments of the post' });
    }
});

module.exports = router;
