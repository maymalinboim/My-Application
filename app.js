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

app.post('/post', (req, res) => {
    const { title, sender, body } = req.body;

    if (!sender || !title || !body) {
        return res.status(400).send({ error: 'Provide sender, title and body' });
    }

    const newPost = { title, author: sender, body };
    Post.create(newPost)
    res.status(201).send(newPost);
});

app.get('/posts', (req, res) => {
    console.log('--------here');
    
    console.log(Post.find());
    
    res.status(200).send(JSON.parse(Post.find()));
});

app.get('/post/:id', (req, res) => {
    const found = Post.findById(req.params.id);

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



let comments = [];
let currentCommentId = 1;

app.post('/comment', (req, res) => {
    const { sender, message } = req.body;

    if (!sender || !message) {
        return res.status(400).send({ error: 'Provide sender and message' });
    }

    const newComment = { id, sender, message, postId: currentCommentId++, creationTime: Date.now() };
    comments.push(newComment);
    res.status(201).send(newComment);
});