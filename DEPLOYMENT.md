# ENGINE Bot Deployment Guide

This is a full-stack web application combining a Node.js Express backend and a static HTML frontend, both served from a single Node process.

## Local Setup

1. Clone the repository
2. Navigate to `bot engine` directory:
   ```bash
   cd "bot engine"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
5. Fill in your environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `PORT`: Server port (defaults to 5001)

6. Run the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5001`

## Deployment on Railway or Render

### Railway

1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard matching `.env.example`
3. Railway will auto-detect Node.js and run `npm start`

### Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Select Node environment
4. Set start command to `npm start`
5. Add environment variables matching `.env.example`

## Features

- **Rate Limiting**: AI API calls are limited to 10 requests per minute per IP
- **AI Integration**: Uses Google Gemini API for responses
- **Database**: MongoDB for conversation storage
- **Responsive UI**: Works on desktop and mobile with sidebar toggle
- **Message History**: Recent conversations displayed with latest first

## Running Tests

```bash
npm test
```

## Project Structure

```
.
├── bot engine/
│   ├── src/
│   │   ├── server.js           # Main Express server
│   │   ├── config/
│   │   │   ├── db.js           # MongoDB connection
│   │   │   └── ratelimit.js    # Rate limiting
│   │   ├── controllers/
│   │   │   └── conversationController.js
│   │   ├── middlewares/
│   │   │   └── rateLimiter.js
│   │   ├── models/
│   │   │   └── conversation.js
│   │   ├── routes/
│   │   │   └── conversationRoutes.js
│   │   ├── services/
│   │   │   └── geminiService.js
│   │   └── config/
│   ├── test/
│   │   └── rateLimit.test.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── engine.html         # Frontend
├── engine.css          # Styles
└── src/
    └── frontend/
        └── chat.js     # Client-side logic
```
