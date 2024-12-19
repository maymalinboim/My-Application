const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const blogSchema = require('./db/dbUtils');
require('dotenv').config();

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

const Post = mongoose.model('posts', blogSchema);

//POSTS
//-------------------------------------------------------------------------------->

//working
app.post('/post', (req, res) => {
    const { title, sender, body } = req.body;

    if (!title || !sender || !body) {
        return res.status(400).send({ error: 'Provide sender, title and body' });
    }

    const newPost = { title, author: sender, body };
    Post.create(newPost)
    res.status(201).send(newPost);
});

//working
app.get('/posts', async (req, res) => {
    const posts = await Post.find();
    
    res.status(200).send(posts)
});

//working
app.get('/post/:id', async (req, res) => {
    const found = await Post.findById(req.params.id);

    if (!found) {
        return res.status(404).send({ error: 'Post not found' });
    }

    res.status(200).send(found);
});

app.get('/post', (req, res) => {
    const { sender } = req.query;

    if (!sender) {
        return res.status(400).send({ error: 'Provide sender id' });
    }

    const senderPosts = posts.filter(post => post.sender === sender);

    if (!senderPosts.length) {
        return res.status(404).send({ error: 'No posts found for this sender' });
    }

    res.status(200).send(senderPosts);
});

app.put('/post/:id', (req, res) => {
    const postToUpdate = posts.find(post => post.id === parseInt(req.params.id));

    if (!postToUpdate) {
        return res.status(404).send({ error: 'Post not found' });
    }

    const { sender, description } = req.body;

    if (sender) postToUpdate.sender = sender;
    if (description) postToUpdate.description = description;

    res.status(200).send(postToUpdate);
});

//COMMENTS
//-------------------------------------------------------------------------------->

//working
app.post('/comment', async (req, res) => {
    const { body, postId } = req.body;

    if (!body || !postId) {
        return res.status(400).send({ error: 'Provide body and postId' });
    }

    const currentPost = await Post.findById(postId);
    const newComment = { body, date: Date.now() };
    //currentPost.comments.push(newComment)
    console.log(1, currentPost);
    
    currentPost.comments.push(newComment);
    console.log(2, currentPost);

    Post.findOneAndUpdate(currentPost).catch(error => console.log(error)
    )
    console.log(3);
    
    res.status(201).send(currentPost);
});

app.get('/comment/:id', async (req, res) => {
    const found = await Post.findById({"comments._id": new mongoose.Types.ObjectId(req.params.id)});

    if (!found) {
        return res.status(404).send({ error: 'Comment not found' });
    }

    res.status(200).send(found);
});

app.get('/comments/:postId', async (req, res) => {
    console.log(2);
    
    console.log("check", req.query);
    
    const found = await Post.findById(req.query.postId);

    if (!found) {
        return res.status(404).send({ error: 'Comments by post not found' });
    }

    res.status(200).send(found);
});