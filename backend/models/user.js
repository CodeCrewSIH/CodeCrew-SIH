const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Create the User Schema
const UserSchema = new Schema({
    googleId: {
        type: String,
        required: false, // Not required because of email/password login
    },
    displayName: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Each email must be unique
    },
    password: {
        type: String,
        required: false, // Not required for Google OAuth users
    },
    image: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Mongoose middleware to hash the password before saving a new user
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new) and is not a Google user
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// This is the crucial line that exports the compiled model
module.exports = mongoose.model('User', UserSchema);

