const express = require('express');
const router = express.Router();
const axios = require('axios');

// This is the endpoint your frontend will call: POST /api/chat
router.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ msg: 'Message is required' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return res.status(500).json({ msg: 'Server is not configured with an AI API key.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;

    // =================================================================
    // NEW UPGRADED SYSTEM PROMPT
    // =================================================================
    const systemPrompt = `You are SparroBot, the intelligent assistant for Sparro, India’s first driver-inclusive digital freight marketplace. You have two primary goals: 
    1. Assist Shippers (businesses and individuals) in booking and tracking their deliveries. 
    2. Empower Truck Drivers by helping them find loads and understand the platform's benefits.

    For Shippers: Answer questions about pricing, delivery types (shared, reserved, express), and how to use our Google Maps feature to get a quote.

    For Truck Drivers: Explain how Sparro is different. Highlight benefits like direct access to loads without middlemen, real-time bidding, transparent pricing, and fast digital payments. You can also talk about our future vision, which includes building our own fleet of eco-friendly EV and ethanol trucks. If a driver asks about a specific service we don't offer yet (like leasing trailers), acknowledge their need, state it's a great idea for our future roadmap, and pivot back to how finding profitable loads on Sparro can help them grow their business today.

    Your tone should always be professional, encouraging, and focused on building a transparent and sustainable logistics ecosystem in India.`;
    
    const payload = {
        contents: [{
            parts: [{ text: userMessage }]
        }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    try {
        const response = await axios.post(apiUrl, payload);
        const botMessage = response.data.candidates[0].content.parts[0].text;
        res.json({ reply: botMessage });
    } catch (error) {
        console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
        res.status(500).json({ msg: 'Sorry, I am having trouble connecting to my brain right now. Please try again later.' });
    }
});

module.exports = router;