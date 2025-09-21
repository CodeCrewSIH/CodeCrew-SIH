// Load environment variables from .env file
require('dotenv').config();

// Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');

// Initialize the Express app
const app = express();

// --- Middleware Setup ---

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors()); 

// Parse incoming JSON requests
app.use(express.json()); 

// Parse incoming URL-encoded requests
app.use(express.urlencoded({ extended: false }));

// Initialize Passport for authentication
app.use(passport.initialize());
require('./middleware/passport-setup')(passport);

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected successfully.'))
.catch(err => console.error('MongoDB Connection Error:', err));

// --- API Routes ---

// Use the authentication routes (for login, signup, google auth)
app.use('/api/auth', require('./routes/auth'));

// Use the booking routes (for distance calculation)
app.use('/api', require('./routes/booking'));

// Use the chatbot routes (for the AI chat)
app.use('/api', require('./routes/chatbot'));

// A simple base route to confirm the server is running
app.get('/', (req, res) => {
    res.send('<h1>Backend Server is Running!</h1><p>Ready to handle all API requests.</p>');
});

// --- Start The Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

