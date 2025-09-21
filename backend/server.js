require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// Passport Middleware
app.use(passport.initialize());
require('./middleware/passport-setup')(passport);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected successfully.'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/booking'));

// Test Route for the root URL
app.get('/', (req, res) => {
    res.send('<h1>Backend Server is Running!</h1><p>Ready to handle authentication.</p>');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

