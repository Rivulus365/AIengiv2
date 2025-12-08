import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';

const app = express();

// Simple logging middleware
const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};

app.use(loggingMiddleware);
app.use(express.json());

const port = process.env.PORT || 3000;

app.post('/api/gemini', async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not found' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents, generationConfig: config }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return res.status(response.status).json({ error: 'Failed to fetch from Gemini API', details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

