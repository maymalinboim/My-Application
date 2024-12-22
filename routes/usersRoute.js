const express = require('express');
const { User } = require('../db/dbUtils');
const router = express.Router();

// CREATE NEW USER
router.post('/', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).send({ error: 'Please provide username, email, and password' });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).send({ error: 'User already exists with that username or email' });
        }

        const newUser = new User({
            username,
            email,
            password
        });

        await newUser.save();
        res.status(201).send(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send({ error: 'An error occurred while creating the user' });
    }
});

// GET ALL USERS
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send({ error: 'An error occurred while fetching users' });
    }
});

// GET USER BY ID
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).send({ error: 'Please provide user id' });
        }

        const user = await User.findById(id)
            .populate('posts');

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.status(200).send(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).send({ error: 'An error occurred while fetching the user' });
    }
});

// UPDATE USER BY ID
router.put('/:id', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const id = req.params.id;

        if (!id) {
            return res.status(400).send({ error: 'Please provide user id and update details' });
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (password) updateData.password = password;

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.status(200).send(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ error: 'An error occurred while updating the user' });
    }
});

// DELETE USER BY ID
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).send({ error: 'Please provide user id' });
        }

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.status(200).send(deletedUser);
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({ error: 'An error occurred while deleting the user' });
    }
});

module.exports = router;
