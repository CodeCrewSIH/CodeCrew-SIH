const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Load User model
const User = require('../models/User');

// --- Traditional Email & Password Routes ---

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { displayName, email, password } = req.body;

        // Basic validation
        if (!displayName || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        // Check for existing user
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user instance
        const newUser = new User({
            displayName,
            email,
            password, // Password will be hashed before saving by the middleware in User.js
        });

        // Save the user (password hashing is handled by pre-save hook in User.js)
        await newUser.save();
        
        // Create JWT Payload
        const payload = { id: newUser.id, name: newUser.displayName };

        // Sign token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token: 'Bearer ' + token,
                });
            }
        );

    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(500).send('Server error');
    }
});


// --- Google OAuth Routes ---

// @route   GET api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }), // We use tokens, not sessions
    (req, res) => {
        // Successful authentication, create JWT
        const payload = { id: req.user.id, name: req.user.displayName };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                // Redirect to a frontend page with the token
                // In a real app, you might redirect to a specific success page
                // For now, we will send it back as JSON
                 res.redirect(`http://localhost:3000/auth-success?token=${token}`);
            }
        );
    }
);

// This line is crucial: it exports the router object.
module.exports = router;