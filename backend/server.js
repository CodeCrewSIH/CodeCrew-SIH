require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const app = express();

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
require('./middleware/passport-setup')(passport);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected successfully.'))
.catch(err => console.error('MongoDB Connection Error:', err));

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('<h1>Backend Server is Running!</h1><p>Ready to handle authentication.</p>');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

