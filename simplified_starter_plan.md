# The Synesthesia Camera: Simplified Starter Plan (V0.5)

## 1. Why Start Simple

This is a **proof-of-concept version** designed to get you from zero to a working app in **one weekend**. It strips away complexity while preserving the core magic: point your camera at the world, and the AI tells you what it sounds like.

**What you'll build:**

- A clean, single-page web app
- Image upload → AI analyzes vibe → background changes color → generative lo-fi music plays
- Unique ambient/lo-fi soundtrack generated for each photo
- Works on desktop and mobile browsers

**What we're skipping for now:**

- TypeScript (we'll use plain JavaScript)
- Complex server setup (everything runs client-side where possible)
- Advanced animations (simple CSS transitions instead)
- Live camera feed (starts with file upload)

Once this works, you can upgrade to the full V1 plan incrementally.

---

## 2. Tech Stack (Minimal Edition)

| Component        | Technology           | Why                                    |
| ---------------- | -------------------- | -------------------------------------- |
| Framework        | **Vite + React**     | Fastest setup, no server complexity    |
| Language         | **JavaScript**       | No type errors to debug                |
| Styling          | **Tailwind CSS**     | Copy-paste classes, looks good fast    |
| AI Model         | **Gemini 1.5 Flash** | Fast, cheap, handles images            |
| Music Generation | **Mubert API**       | Lo-fi/ambient specialist, royalty-free |
| AI SDK           | **Direct API calls** | No SDK abstraction, simpler to debug   |
| Hosting          | **Netlify**          | Deploy with drag-and-drop              |

---

## 3. Project Setup (Copy-Paste Commands)

### Step 1: Create the Project

```bash
npm create vite@latest vibecam-simple -- --template react
cd vibecam-simple
npm install
```

**Note**: If you're setting up a monorepo (recommended for portfolio), create your project inside a parent directory like `vibecam/vibecam_app/vibecam-simple/` to keep planning docs at the root.

### Step 2: Install Tailwind CSS v4

```bash
npm install -D tailwindcss@next @tailwindcss/vite@next
```

### Step 3: Configure Vite

Add the Tailwind plugin to your `vite.config.js`:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### Step 4: Update CSS

Replace `src/index.css` with:

```css
@import "tailwindcss";
```

That's it! No config file needed with v4.

### Step 5: Create Environment File

Create `.env` in the root:

```
VITE_GOOGLE_API_KEY=your_google_key_here
VITE_MUBERT_LICENSE=your_mubert_license_here
```

**Get your API keys:**

- **Google**: https://aistudio.google.com → "Get API Key"
- **Mubert**: https://mubert.com/render/api → Sign up for free tier (500 tracks/month)

**Important**: Add `.env` to your `.gitignore`!

---

## 4. The Core Logic: Image → AI Analysis

### The AI Function (src/utils/analyzeImage.js)

This function sends the image to Gemini and gets back the vibe.

````javascript
export async function analyzeImage(base64Image) {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  const systemPrompt = `You are "The Synesthesia Lens," an AI with synesthesia who hears music when you see images.

Analyze this image and return ONLY a valid JSON object (no markdown, no explanations):

{
  "mood": "2-sentence poetic description",
  "hexColor": "#RRGGBB",
  "musicParams": {
    "moodTags": ["tag1", "tag2", "tag3"],
    "intensity": "low/medium/high",
    "tempo": "slow/medium/fast"
  }
}

Rules:
- Use evocative words like "melancholic," "ethereal," "gritty," "nostalgic"
- hexColor should be the EMOTIONAL dominant color, not pixel average
- moodTags should be 3-5 descriptive words for music generation (e.g., "chill", "dark", "uplifting", "ambient", "lofi")
- intensity describes energy level
- tempo describes the pace`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image.split(",")[1], // Remove "data:image/jpeg;base64," prefix
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      },
    );

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      throw new Error("No response from AI");
    }

    const text = data.candidates[0].content.parts[0].text;

    // Clean up potential markdown formatting
    const jsonText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const result = JSON.parse(jsonText);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
````

---

## 5. Image Compression Helper

Before sending images to the AI, compress them to save time and money.

### src/utils/compressImage.js

```javascript
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        // Resize to max 1024px on longest side
        let width = img.width;
        let height = img.height;
        const maxSize = 1024;

        if (width > height && width > maxSize) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width / height) * maxSize;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG at 70% quality
        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(base64);
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

## 6. Music Generation with Mubert

This function takes the AI's mood analysis and generates a custom lo-fi track.

### src/utils/generateMusic.js

```javascript
export async function generateMusic(musicParams) {
  const license = import.meta.env.VITE_MUBERT_LICENSE;

  // Convert AI params to Mubert format
  const tags = musicParams.moodTags.join(",");

  // Map intensity and tempo to duration (low energy = longer, calmer)
  const duration = musicParams.intensity === "high" ? 30 : 60;

  const requestBody = {
    method: "RecordTrack",
    params: {
      license: license,
      mode: "loop",
      duration: duration,
      tags: tags,
      bitrate: 128,
    },
  };

  try {
    const response = await fetch("https://api-b2b.mubert.com/v2/RecordTrack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.status === 1 && data.data) {
      // Mubert returns a task that we need to poll
      const taskId = data.data;

      // Poll for the result (usually ready in 5-15 seconds)
      const audioUrl = await pollForTrack(taskId, license);

      return {
        success: true,
        audioUrl: audioUrl,
        duration: duration,
      };
    } else {
      throw new Error(data.error || "Music generation failed");
    }
  } catch (error) {
    console.error("Mubert API Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper function to poll for the completed track
async function pollForTrack(taskId, license, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

    const response = await fetch("https://api-b2b.mubert.com/v2/TrackStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "TrackStatus",
        params: {
          license: license,
          task_id: taskId,
        },
      }),
    });

    const data = await response.json();

    if (
      data.status === 1 &&
      data.data.result &&
      data.data.result.download_link
    ) {
      return data.data.result.download_link;
    }

    // If not ready, continue polling
  }

  throw new Error("Track generation timed out");
}
```

---

## 7. The Main App Component

### src/App.jsx

```jsx
import { useState, useRef } from "react";
import { compressImage } from "./utils/compressImage";
import { analyzeImage } from "./utils/analyzeImage";
import { generateMusic } from "./utils/generateMusic";

function App() {
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setAudioUrl(null);

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      // Show preview
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      // Compress image
      setIsAnalyzing(true);
      const base64 = await compressImage(file);

      // Analyze with AI
      const analysis = await analyzeImage(base64);

      if (analysis.success) {
        setResult(analysis.data);
        setIsAnalyzing(false);

        // Generate music based on the analysis
        setIsGeneratingMusic(true);
        const music = await generateMusic(analysis.data.musicParams);

        if (music.success) {
          setAudioUrl(music.audioUrl);

          // Auto-play the generated music
          const audio = new Audio(music.audioUrl);
          audio.volume = 0.6;
          audio.loop = true;
          audioRef.current = audio;

          // Play after a small delay for better UX
          setTimeout(() => audio.play(), 500);
        } else {
          setError(`Music generation failed: ${music.error}`);
        }
      } else {
        setError(analysis.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
      setIsGeneratingMusic(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  const backgroundColor = result?.hexColor || "#000000";

  return (
    <div
      className="min-h-screen transition-colors duration-1000 flex flex-col items-center justify-center p-4"
      style={{ backgroundColor }}
    >
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Synesthesia Camera
          </h1>
          <p className="text-white/80">What does your world sound like?</p>
        </div>

        {/* Upload Button */}
        <div className="flex justify-center mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all text-lg shadow-lg"
          >
            📸 Capture a Vibe
          </button>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-6 relative">
            <img
              src={imagePreview}
              alt="Your capture"
              className="w-full rounded-lg shadow-2xl"
            />
            {(isAnalyzing || isGeneratingMusic) && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">
                  {isAnalyzing && "🎵 Listening to the image..."}
                  {isGeneratingMusic && "🎹 Composing your soundtrack..."}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
            <div className="mb-4">
              <h2 className="text-sm uppercase tracking-wide text-white/60 mb-1">
                The Mood
              </h2>
              <p className="text-lg italic">{result.mood}</p>
            </div>

            <div className="mb-4">
              <h2 className="text-sm uppercase tracking-wide text-white/60 mb-1">
                Sonic Atmosphere
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.musicParams.moodTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white/20 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-white/60 mt-2">
                {result.musicParams.intensity} intensity •{" "}
                {result.musicParams.tempo} tempo
              </p>
            </div>

            {audioUrl && (
              <div className="mb-4">
                <button
                  onClick={toggleAudio}
                  className="w-full bg-white/20 hover:bg-white/30 transition-colors px-6 py-3 rounded-lg font-semibold"
                >
                  {audioRef.current?.paused === false ? "⏸️ Pause" : "▶️ Play"}{" "}
                  Generative Soundtrack
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <h2 className="text-sm uppercase tracking-wide text-white/60">
                Dominant Color
              </h2>
              <div
                className="w-12 h-12 rounded-full border-2 border-white/50"
                style={{ backgroundColor: result.hexColor }}
              />
              <span className="font-mono text-sm">{result.hexColor}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-white">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
```

---

## 8. Clean Up Default Files

### src/main.jsx

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

---

## 9. Testing Locally

```bash
npm run dev
```

Open the URL (usually `http://localhost:5173`) on your computer.

### Testing on Your Phone

1. Find your computer's local IP (on Mac: System Settings → Network)
2. Make sure phone and computer are on same WiFi
3. Visit `http://YOUR_IP:5173` on your phone

---

## 10. Production Setup with Netlify Functions (RECOMMENDED)

**Why you need this for production/portfolio:**

The code above works locally, but **exposes your API key** in the client-side code - anyone can steal it and rack up charges! For a portfolio deployment, you need:

1. **API Key Security**: Keep keys server-side
2. **Rate Limiting**: Prevent abuse and control costs
3. **Budget Protection**: Set hard limits on usage

**This section shows you how to move your AI logic to Netlify Functions (serverless backend) with built-in rate limiting.**

### Step 1: Install Netlify CLI

```bash
npm install -D netlify-cli
```

### Step 2: Create Netlify Functions Directory

```bash
mkdir -p netlify/functions
```

### Step 3: Create the Serverless Function

Create `netlify/functions/analyzeImage.js`:

```javascript
// Rate limiting: simple in-memory store (resets on function cold start)
const requestCounts = new Map();
const RATE_LIMIT = 5; // requests per IP per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || [];

  // Filter out old requests outside the time window
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);

  if (recentRequests.length >= RATE_LIMIT) {
    return false; // Rate limit exceeded
  }

  // Add new request
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  return true;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGeminiAPI(base64Image, retries = 3) {
  const apiKey = process.env.GOOGLE_API_KEY;

  const systemPrompt = `You are "The Synesthesia Lens," an AI with synesthesia who hears music when you see images.

Analyze this image and return ONLY a valid JSON object (no markdown, no explanations):

{
  "mood": "2-3 sentence poetic description of the emotional atmosphere",
  "hexColor": "#RRGGBB",
  "soundscape": "1-2 sentence description of what this scene would sound like",
  "vibes": ["vibe1", "vibe2", "vibe3"]
}

Rules:
- Use evocative words like "melancholic," "ethereal," "gritty," "nostalgic," "serene," "chaotic"
- hexColor should be the EMOTIONAL dominant color, not pixel average
- soundscape describes the imagined sonic atmosphere
- vibes should be 3-5 descriptive mood words`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
    }
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // If overloaded and we have retries left, wait and retry
      if (data.error?.message?.includes('overloaded') && retries > 0) {
        console.log(`API overloaded, retrying in 2 seconds... (${retries} retries left)`);
        await sleep(2000);
        return callGeminiAPI(base64Image, retries - 1);
      }
      throw new Error(`API Error: ${data.error?.message || response.statusText}`);
    }

    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No response from AI');
    }

    const text = data.candidates[0].content.parts[0].text;
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(jsonText);

    return result;

  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw error;
  }
}

export async function handler(event) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Rate limiting based on IP
  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';

  if (!checkRateLimit(ip)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({
        error: 'Rate limit exceeded. You can analyze 5 images per hour. This is a portfolio demo with cost limits.'
      })
    };
  }

  try {
    const { base64Image } = JSON.parse(event.body);

    if (!base64Image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing base64Image in request' })
      };
    }

    // Remove data URL prefix if present
    const cleanBase64 = base64Image.includes(',')
      ? base64Image.split(',')[1]
      : base64Image;

    const result = await callGeminiAPI(cleanBase64);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: result })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      })
    };
  }
}
```

### Step 4: Create Netlify Configuration

Create `netlify.toml` in your project root:

```toml
[build]
  base = "vibecam_app/vibecam-simple"
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Note**: The `base` path is set to `vibecam_app/vibecam-simple` to support a monorepo structure where your app is in a subdirectory. This allows you to keep planning docs, notes, and the app all in one repository.

### Step 5: Update Your Frontend Code

Update `src/utils/analyzeImage.js` to call your Netlify Function instead of the API directly:

```javascript
export async function analyzeImage(base64Image) {
  try {
    // In production, call the Netlify Function
    // In development, it will use /.netlify/functions/analyzeImage
    const response = await fetch('/.netlify/functions/analyzeImage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze image');
    }

    return data;

  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Step 6: Update Your .env File

You now need a `.env` file for the Netlify Function (not the client):

Create `.env`:
```
GOOGLE_API_KEY=your_google_api_key_here
```

**IMPORTANT**: This is for local testing. For production, you'll add this to Netlify's environment variables (shown in deployment section).

### Step 7: Test Locally with Netlify Dev

```bash
npx netlify dev
```

This runs your site with Netlify Functions working locally at `http://localhost:8888`.

---

## 11. Deployment to Netlify

### Option A: Drag and Drop (Quick Test)

**Note**: This works but you won't be able to use Netlify Functions. Use Option B for the full setup.

1. Run `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag the `dist` folder onto the page

### Option B: GitHub Integration (RECOMMENDED - Required for Netlify Functions)

1. **Create a GitHub repository** and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Vibecam app with planning docs"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/vibecam.git
   git push -u origin main
   ```

   **Monorepo Structure**: Your repo can include planning docs, notes, and the app:
   ```
   vibecam/
   ├── concept.md
   ├── simplified_starter_plan.md
   ├── synesthesia_camera_master_plan.md
   ├── vibecam_app/
   │   └── vibecam-simple/  (your app lives here)
   ├── README.md
   └── .gitignore
   ```

2. **Go to Netlify** (https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your `vibecam` repository

3. **Configure build settings**:
   - Base directory: `vibecam_app/vibecam-simple` (should auto-detect from netlify.toml)
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions` (should auto-detect from netlify.toml)

4. **Add Environment Variables**:
   - Go to "Site settings" → "Environment variables"
   - Add new variable:
     - Key: `GOOGLE_API_KEY`
     - Value: `your_google_api_key_here`

   **IMPORTANT**:
   - Do NOT use `VITE_` prefix for server-side variables
   - The API key stays server-side (secure!)
   - If you're using Mubert later, add `MUBERT_LICENSE` as well

5. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy automatically
   - Get your live URL: `your-app.netlify.app`

6. **Test your deployment**:
   - Visit your site URL
   - Try uploading an image
   - Check the browser console for any errors
   - You should see rate limit messages when you hit 5 requests per hour

### Important Notes:

- **Rate Limiting**: The function limits each IP to 5 requests/hour
- **Cost Control**: This protects you from unexpected API charges
- **Cold Starts**: First request might be slower (~1-2 seconds) after inactivity
- **User Experience**: Consider adding a message: "Portfolio demo - limited to 5 analyses per hour"

---

## 12. What's Different from the Full V1?

| Feature        | V0.5 (This Plan)   | V1 (Master Plan)             |
| -------------- | ------------------ | ---------------------------- |
| Language       | JavaScript         | TypeScript                   |
| Framework      | Vite + React       | Next.js                      |
| AI Integration | Direct API calls   | Vercel AI SDK                |
| Music          | Mubert generative  | Mubert + Spotify integration |
| Animations     | CSS transitions    | Framer Motion                |
| Server         | None (client-side) | Next.js API routes           |
| Deployment     | Netlify drag-drop  | Vercel                       |

---

## 13. Upgrade Path (After This Works)

Once you have this running, add features one at a time:

### Phase 1: Better UX

- Add waveform visualizer for playing audio
- Add "Try another" button
- Save history (localStorage) with ability to replay old tracks
- Add volume control slider

### Phase 2: Enhanced Music Experience

- Add option to download generated tracks
- Show music generation progress bar
- Add song recommendation text alongside generative audio (hybrid approach)

### Phase 3: Live Camera (V2)

- Replace file input with `getUserMedia()`
- Add live preview feed
- Add "capture" button
- Continuous analysis mode (music changes as you pan)

### Phase 4: Migrate to Next.js (V1)

- Move to TypeScript
- Move AI and Mubert logic to server actions (keeps API keys secret)
- Add user accounts to save favorite generations
- Add Vercel deployment

---

## 14. Common Beginner Mistakes to Avoid

1. **Forgetting the .env file**: You'll see "API key undefined" errors
2. **Not cleaning base64 strings**: Gemini needs just the data, not the `data:image/jpeg;base64,` prefix
3. **Not handling JSON parsing**: The AI sometimes returns markdown-wrapped JSON
4. **Testing only on desktop**: Mobile has different behavior (especially camera input and audio autoplay)
5. **Not compressing images**: A 4MB photo costs 100x more than a 400KB compressed one
6. **Audio autoplay blocking**: Some browsers block autoplay. Always have a manual play button
7. **Not polling Mubert correctly**: Music generation takes 5-15 seconds. Don't timeout too early
8. **Exposing API keys**: Never commit `.env` to GitHub. Use environment variables in production

---

## 15. Estimated Costs

- **Gemini 1.5 Flash**: ~$0.01 per 1000 images (essentially free for personal use)
- **Mubert API**: Free tier = 500 tracks/month, then $11/month for 1500 tracks
- **Netlify hosting**: Free tier (100GB bandwidth/month)
- **Total for personal use**: $0/month (free tiers cover ~16 photos/day)
- **If you go viral**: ~$11/month (Mubert) + minimal Gemini costs

---

## 16. Time Estimate

- **Setup + First Working Version**: 3-4 hours
- **Music Integration + Testing**: 1-2 hours
- **Polish + Mobile Testing**: 1 hour
- **Deployment**: 30 minutes
- **Total**: One weekend (6-8 hours spread across Saturday/Sunday)

---

## 17. Next Steps

1. **Copy-paste the setup commands** from Section 3
2. **Get your API keys**:
   - Google AI Studio: https://aistudio.google.com
   - Mubert: https://mubert.com/render/api
3. **Create the four core files**:
   - `src/utils/compressImage.js`
   - `src/utils/analyzeImage.js`
   - `src/utils/generateMusic.js`
   - `src/App.jsx`
4. **Test locally** with a photo of your current view
5. **Test on your phone** (important for camera and audio)
6. **Deploy to Netlify** and share with friends

When this works and you feel confident, come back to the Master Plan for the TypeScript + Next.js upgrade.

**The goal isn't to build the perfect app right now. It's to build something magical that works today.**
