const express = require('express');
const router = express.Router();
const axios = require('axios');

// @route   POST /api/calculate-distance
// @desc    Calculate distance between two places using Google Distance Matrix API
// @access  Public
router.post('/calculate-distance', async (req, res) => {
    // Get the place IDs from the frontend request
    const { startPlaceId, endPlaceId } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!startPlaceId || !endPlaceId) {
        return res.status(400).json({ msg: 'Missing start or end location data' });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${startPlaceId}&destinations=place_id:${endPlaceId}&units=metric&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        // Check if Google's response is valid
        if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
            // Extract the human-readable distance (e.g., "1,045 km")
            const distance = data.rows[0].elements[0].distance.text;
            res.json({ distance });
        } else {
            console.error('Google API Error:', data);
            res.status(500).json({ msg: 'Error calculating distance from Google API' });
        }
    } catch (error) {
        console.error('Server Error:', error.message);
        res.status(500).json({ msg: 'Server error while calculating distance' });
    }
});

module.exports = router;
