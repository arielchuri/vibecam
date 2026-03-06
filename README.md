# Vibecam

AI Synesthesia Camera. Transforms images into poetic moods, colors, and sounds using Gemini AI.

[https://sonoptic.netlify.app](https://sonoptic.netlify.app)

## Local Development

```bash
cd vibecam_app/vibecam-simple
npm install
npx netlify dev
```
**URL:** http://localhost:8888

## Setup

1. Get a Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
2. Add it to `vibecam_app/vibecam-simple/.env`:
   ```
   GOOGLE_API_KEY=your_api_key
   ```

## Deploy

```bash
npx netlify deploy --prod
```
