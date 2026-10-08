/**
 * CodeAlpha AI Internship - Task 1: Language Translation Tool
 * File: server.js
 * Description: Lightweight Express backend proxy for the Google Translate web translation endpoint.
 */

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_TEXT_LENGTH = 5000;
const REQUEST_TIMEOUT_MS = 10000; // 10-second timeout

// Middleware: Parse JSON bodies
app.use(express.json({ limit: '1mb' }));

// Serve static frontend files from current directory
app.use(express.static(path.join(__dirname)));

/**
 * POST /api/translate
 * Body: { text: string, sourceLang: string, targetLang: string }
 * Response: { success: boolean, translation?: string, error?: string }
 */
app.post('/api/translate', async (req, res) => {
    try {
        const { text, sourceLang = 'auto', targetLang } = req.body;

        // 1. Validate Text
        if (!text || typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Please provide text to translate.'
            });
        }

        // 2. Validate Text Length Limit
        if (text.length > MAX_TEXT_LENGTH) {
            return res.status(400).json({
                success: false,
                error: `Text exceeds the maximum allowed limit of ${MAX_TEXT_LENGTH} characters.`
            });
        }

        // 3. Validate Target Language
        if (!targetLang || typeof targetLang !== 'string' || !targetLang.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Please specify a valid target language.'
            });
        }

        const sanitizedSource = (sourceLang && sourceLang.trim()) ? sourceLang.trim() : 'auto';
        const sanitizedTarget = targetLang.trim();

        // 4. Build Upstream URL (Google Translate Web Translation Endpoint)
        const upstreamUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sanitizedSource)}&tl=${encodeURIComponent(sanitizedTarget)}&dt=t&q=${encodeURIComponent(text)}`;

        // 5. Send Request with Timeout
        const response = await fetch(upstreamUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });

        if (!response.ok) {
            if (response.status === 429) {
                return res.status(429).json({
                    success: false,
                    error: 'Translation service rate limit reached. Please wait a moment and try again.'
                });
            }
            return res.status(response.status).json({
                success: false,
                error: `Upstream translation service returned an error (${response.status}).`
            });
        }

        const data = await response.json();

        // 6. Parse Segment Array from Upstream Response
        // Format: [ [ [ "Translated segment", "Original segment", ... ], ... ], ... ]
        if (!Array.isArray(data) || !Array.isArray(data[0])) {
            return res.status(502).json({
                success: false,
                error: 'Unexpected response format from translation service.'
            });
        }

        const translation = data[0]
            .filter(item => Array.isArray(item) && typeof item[0] === 'string')
            .map(item => item[0])
            .join('');

        if (!translation && translation !== '') {
            return res.status(502).json({
                success: false,
                error: 'Could not extract translated text from service response.'
            });
        }

        // 7. Successful Response
        return res.status(200).json({
            success: true,
            translation: translation
        });

    } catch (error) {
        // Handle AbortSignal timeout
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
            return res.status(504).json({
                success: false,
                error: 'Translation request timed out. Please check your internet connection and try again.'
            });
        }

        // Handle generic network or parsing failure
        console.error('Translation error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'An internal server error occurred while processing your translation.'
        });
    }
});

// Fallback Route: Serve index.html for root path
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`CodeAlpha Translation Tool server running at http://localhost:${PORT}`);
});
