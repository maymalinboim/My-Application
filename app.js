const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

let posts = [];
let currentId = 1;

app.post('/post', (req, res) => {
    const { sender, description } = req.body;

    if (!sender || !description) {
        return res.status(400).send({ error: 'Provide sender and description' });
    }

    const newPost = { id: currentId++, sender, description };
    posts.push(newPost);
    res.status(201).send(newPost);
});

app.get('/posts', (req, res) => {
    res.status(200).send(posts);
});

app.get('/post/:id', (req, res) => {
    const found = posts.find(post => post.id === parseInt(req.params.id));

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});