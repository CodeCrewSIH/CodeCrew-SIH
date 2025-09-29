const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/calculate-distance', async (req, res) => {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
        return res.status(400).json({ msg: 'Origin and destination are required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error("Google Maps API key is not configured on the server.");
        return res.status(500).json({ msg: 'Server configuration error' });
    }

    // --- THE FIX IS HERE ---
    // We must URL-encode the origin and destination to handle spaces and commas
    const encodedOrigin = encodeURIComponent(origin);
    const encodedDestination = encodeURIComponent(destination);

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodedOrigin}&destinations=${encodedDestination}&key=${apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
            const distance = data.rows[0].elements[0].distance.text;
            res.json({ distance });
        } else {
            // If Google couldn't find the route
            console.warn('Google Maps API could not calculate distance:', data.status, data.rows[0].elements[0].status);
            res.status(404).json({ msg: 'Could not find a route between the specified locations.' });
        }
    } catch (error) {
        console.error('Error calling Google Maps API:', error.message);
        res.status(500).json({ msg: 'An error occurred while calculating the distance.' });
    }
});

module.exports = router;
