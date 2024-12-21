const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const Post = require('./db/dbUtils');

const app = express();
app.use(bodyParser.json());

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

try{
    mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true})
}
catch (error){
    console.log('Initial connection error', error);
}

const db = mongoose.connection;
db.on('error', error=> console.log(error));
db.once('open', () => console.log('connected to mongo'))

//------------------------------------------------------------------->

//CREATE NEW POST
app.post('/post', (req, res) => {
    const { title, sender, body } = req.body;
    if (!title || !sender || !body) {
        return res.status(400).send({ error: 'Please provide sender, title and body' });
    }

    const newPost = { title, author: sender, body };
    Post.create(newPost)
    res.status(201).send(newPost);
});

//GET ALL POSTS
app.get('/posts', async (req, res) => {
    const posts = await Post.find();
    
    res.status(200).send(posts)
});

//GET POST BY ID
app.get('/post/:id', async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).send({ error: 'Please provide post id' });
    }

    const found = await Post.findById(id);
    if (!found) {
        return res.status(404).send({ error: 'Post not found' });
    }

    res.status(200).send(found);
});

//GET POSTS BY AUTHOR
app.get('/post', async (req, res) => {
    const { sender } = req.query;
    if (!sender) {
        return res.status(400).send({ error: 'Please provide sender id' });
    }

    const senderPosts = await Post.find({author: sender});
    if (!senderPosts.length) {
        return res.status(404).send({ error: 'No posts found for this sender' });
    }

    res.status(200).send(senderPosts);
});

//UPDATE POST BY ID
app.put('/post/:id', async (req, res) => {
    const updatedPost = {};
    const { title, body } = req.body;
    const id = req.params.id;

    if (!title || !body || !id) {
        return res.status(400).send({ error: 'Please provide post id and update details' });
    }

    if (title) updatedPost.title = title;
    if (body) updatedPost.body = body;
    
    const postToUpdate = await Post.findOneAndUpdate({_id: id}, updatedPost, {
        returnDocument: 'after'});

    if (!postToUpdate) {
        return res.status(404).send({ error: 'Post not found' });
    }

    res.status(200).send(postToUpdate);
});

//------------------------------------------------------------------->

//ADD COMMENT TO POST
app.post('/comment', async (req, res) => {
    const { body, postId } = req.body;
    if (!body || !postId) {
        return res.status(400).send({ error: 'Please provide body and postId' });
    }

    const newComment = { body, date: Date.now() };
    const update = { $push: { comments: newComment } };

    const updatedPost = await Post.findOneAndUpdate({_id: postId}, update, {
        returnDocument: 'after'});

    res.status(201).send(updatedPost);
});

//FIND COMMENT BY ID
app.get('/comment', async (req, res) => {
    const { id, postId } = req.query;    
    if (!postId || !id) {
        return res.status(400).send({ error: 'Please provide comment id and postId' });
    }

    const postOfComment = await Post.findById(postId);

    const found = postOfComment && postOfComment.comments.find(comment => comment._id.toString() === id);

    if (!found) {
        return res.status(404).send({ error: 'Comment not found' });
    }
    
    res.status(200).send(found);
});

//UPDATE COMMENT BY ID
app.put('/comment/:id', async (req, res) => {
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
        arrayFilters: [{ "comment._id": id } ],
        returnDocument: 'after'
    };

    const updatedPost = await Post.findOneAndUpdate({_id: postId}, update, options);

    if (!updatedPost) {
        return res.status(404).send({ error: 'Post or comment not found' });
    }

    res.status(201).send(updatedPost);
});

//DELETE COMMENT BY ID
app.delete('/comment', async (req, res) => {
    const { id, postId } = req.query;   
    if (!postId || !id) {
        return res.status(400).send({ error: 'Please provide comment id and postId' });
    }    
    
    const update = { $pull: { "comments": { _id: id } }};

    const deleted = await Post.findOneAndUpdate({_id: postId}, update, { returnDocument: 'after' });
    
    if (!deleted) {
        return res.status(404).send({ error: 'Comment not found' });
    }

    res.status(200).send(deleted);
});

//GET ALL COMMENTS
app.get('/comments', async (req, res) => {
    const allComments = [];
    const posts = await Post.find();

    posts.map(post => allComments.push(post.comments));

    if (!allComments.length) {
        return res.status(404).send({ error: 'No comments found' });
    }
    
    res.status(200).send(allComments);
});

//GET ALL COMMENTS OF POST
app.get('/comments/:postId', async (req, res) => {
    const postId = req.params.postId;    
    if (!postId) {
        return res.status(400).send({ error: 'Please provide postId' });
    }

    const postOfComments = await Post.findById(postId);

    if (!postOfComments) {
        return res.status(404).send({ error: 'Post not found' });
    }
    
    res.status(200).send(postOfComments.comments);
});