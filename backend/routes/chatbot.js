const express = require('express');
const router = express.Router();
const axios = require('axios'); // We're using axios for API calls

// This is the endpoint your frontend will call: POST /api/chat
router.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    // Basic validation
    if (!userMessage) {
        return res.status(400).json({ msg: 'Message is required' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        console.error("Gemini API key is not configured on the server.");
        return res.status(500).json({ msg: 'Server is not configured for AI chat.' });
    }

    // The official URL for the Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;

    // A system prompt to give the AI its personality and instructions.
    // This is where you define the chatbot's role.
    const systemPrompt = `You are SparroBot, a friendly and helpful customer support assistant for a logistics company named Sparro. Your purpose is to answer questions about Sparro's services, such as pricing, delivery types (like shared, reserved, express), vehicle options, and how to book a delivery. Your tone should be professional but conversational. Do not answer questions that are not related to logistics, transport, or Sparro. Keep your answers clear and concise.`;
    
    // The data structure required by the Gemini API
    const payload = {
        contents: [{
            parts: [{ text: userMessage }]
        }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    try {
        // Make the API call to Google Gemini
        const response = await axios.post(apiUrl, payload);
        
        // Extract the text from the AI's response
        const botMessage = response.data.candidates[0].content.parts[0].text;
        
        // Send the AI's reply back to the frontend
        res.json({ reply: botMessage });

    } catch (error) {
        console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
        res.status(500).json({ msg: 'Sorry, I seem to be having trouble thinking right now. Please try again in a moment.' });
    }
}); // <-- The missing closing brace and parenthesis were here.

module.exports = router;

