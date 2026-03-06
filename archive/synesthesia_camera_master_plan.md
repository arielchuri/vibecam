# The Synesthesia Camera: Master Build Plan

## 1. Executive Overview: The Convergence of Sensory Modalities

The contemporary web landscape is undergoing a paradigm shift, transitioning from text-dominant interfaces to multimodal, sensory-aware experiences. The "Synesthesia Camera" is a web application designed to simulate the neurological condition of synesthesia by algorithmically interpreting visual input—captured via a user's device—into auditory and chromatic outputs.

This document outlines a comprehensive, expert-level implementation strategy for building this application using Next.js, the Vercel AI SDK, and Google’s Gemini 1.5 Flash model. The goal is to engineer a system with minimal latency and maximum semantic fidelity, ensuring the song and color recommendations feel inextricably linked to the user's visual reality.

---

## V1 ARCHITECTURE: IMAGE FILE CAPTURE

This section details the implementation of the Minimum Viable Product (MVP), which relies on a standard file input for image capture. This approach prioritizes simplicity, reliability, and speed of development.

### 2. The Camera Input: `capture="environment"`

The core of the V1 client is a visually hidden HTML file input.

```html
<input 
  type="file" 
  accept="image/*" 
  capture="environment" 
  id="synesthesia-eye" 
  style="display: none;" 
/>
```

The `capture="environment"` attribute is the critical directive. It signals to mobile browsers to prioritize the rear-facing (world-view) camera, creating a more seamless "camera" experience than a standard file picker.

### 3. Optimizing the Visual Payload

To ensure minimal latency, a client-side compression pipeline is necessary before transmitting the image to the AI.

1.  **Event Interception**: The `onChange` event of the input triggers a handler that intercepts the `File` object.
2.  **Canvas Rendering**: The file is read into an `Image` object and drawn onto an off-screen `<canvas>`.
3.  **Resizing & Compression**: The canvas resizes the image (a maximum dimension of 1024px is sufficient) and exports it as a Base64 encoded JPEG string with a quality setting of `0.7`.

This process consistently reduces image payloads to under 500KB, making network transport time negligible compared to AI inference time.

### 4. The Synesthesia Engine: AI Logic

The core of the application is the "Synesthesia Engine," which translates visual data into semantic concepts, governed by a system prompt and validated by a Zod schema.

#### 4.1. System Prompt

The following system prompt is used to guide the AI's personality and output format.

```javascript
const systemPrompt = `
You are "The Synesthesia Lens," an AI with a rare neurological condition where you hear music and feel deep emotions when you see visual stimuli.

**Your Goal:** Analyze the image provided and translate its visual essence into sound, color, and poetry. 

**Response Rules:**
1. **Mood:** deeply analytical but poetic. Avoid generic words. Use words like "melancholic," "ethereal," "gritty," "nostalgic."
2. **Music:** Recommend a REAL song by a REAL artist. Generate an optimized Spotify search query for it.
3. **Color:** Extract the single most "dominant spiritual color" (hex code) - not the most frequent pixel, but the one that represents the *feeling*.

**Output Format:**
Return ONLY a valid JSON object matching the provided schema.
`;
```

#### 4.2. The AI Schema (Zod)

This Zod schema, inspired by the more detailed structure from `planb.md`, enforces a strict, predictable output from the AI. The `.describe()` calls act as micro-prompts for the model.

```javascript
import { z } from 'zod';

export const synesthesiaSchema = z.object({
  analysis: z.object({
    dominant_color_hex: z.string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid Hex Code")
      .describe("The primary hex color defining the mood, e.g., #FF5733"),
    lighting: z.enum(["bright", "dim", "chiaroscuro", "neon", "natural"])
      .describe("The perceived lighting of the scene."),
  }),
  audio_mapping: z.object({
    suggested_genre: z.string().describe("A musical genre that fits the mood."),
    tempo: z.number().describe("Suggested BPM (beats per minute) matching the visual energy."),
    spotify_search_query: z.string().describe("An optimized Spotify search query (e.g., 'track:Bohemian Rhapsody artist:Queen')."),
    reasoning: z.string().describe("A brief, poetic explanation of why this audio matches the visual.")
  })
});
```

#### 4.3. Configuring Google Safety Settings

To prevent false positives on artistic images, safety filters must be adjusted.

```javascript
const model = google('gemini-1.5-flash', {
  safetySettings: [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
  ]
});
```

### 5. Spotify Integration: Metadata Resolution

The AI's text output must be resolved into a playable Spotify track.

#### 5.1. Authentication: Client Credentials Flow

A server-to-server `Client Credentials Flow` is used to get a Spotify API access token. This token should be cached to avoid requesting it on every call.

#### 5.2. Search Strategy

The AI is tasked with generating the optimal search query. Our server action simply passes this query to the Spotify API, which is more robust than manually constructing the query from a separate artist and title.

```javascript
const searchParams = new URLSearchParams({
  q: aiData.audio_mapping.spotify_search_query, // Directly use the AI-generated query
  type: 'track',
  limit: '1'
});
```

### 6. Frontend UX and Animation

#### 6.1. The "Scanning" Animation

A scanning animation is used to mask the ~2-3 second latency of the full pipeline. A simple and effective version is a vertical glowing line that moves up and down the image preview.

```jsx
<motion.div
  initial={{ top: "0%" }}
  animate={{ top: "100%" }}
  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
  className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent"
/>
```

#### 6.2. Alternative Animation Style: Radar Sweep

As a stylistic alternative, a rotating radar sweep (from `planb.md`) can also communicate "analysis" effectively.

```jsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
  className="w-full h-full bg-gradient-to-t from-green-500/50 to-transparent"
/>
```

#### 6.3. Interpolating Color with Physics

When the new color is received, the background should transition smoothly using a spring physics model from Framer Motion for a more natural, "breathing" effect.

```jsx
<motion.main
  animate={{ backgroundColor: result ? result.hexColor : "#000" }}
  transition={{ type: "spring", stiffness: 50, damping: 20 }}
>
  {/* ... content ... */}
</motion.main>
```

### 7. V1 Implementation Roadmap

#### 7.1. Dependencies and Environment

*   **Packages**: `ai`, `@ai-sdk/google`, `zod`, `framer-motion`, `lucide-react`.
*   **Environment**: `GOOGLE_GENERATIVE_AI_API_KEY`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`.

#### 7.2. Server Action: `scanImage.ts`

This file encapsulates the entire business logic, updated to use the new, more detailed schema.

```typescript
'use server';

import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { synesthesiaSchema } from './schema'; // The new, detailed schema

// Helper to get Spotify Token (implement with caching in production)
async function getSpotifyToken() {
  // ... (same as plana.md)
}

export async function scanImage(base64Image: string) {
  try {
    // 1. AI Analysis with the new schema
    const { object: aiData } = await generateObject({
      model: google('gemini-1.5-flash', { /* safety settings */ }),
      schema: synesthesiaSchema,
      system: "You are The Synesthesia Lens...", // Full system prompt
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: "Analyze this image's soul." },
            { type: 'image', image: base64Image } 
          ]
        }
      ]
    });

    // 2. Spotify Search using the AI-generated query
    const token = await getSpotifyToken();
    const searchParams = new URLSearchParams({
      q: aiData.audio_mapping.spotify_search_query,
      type: 'track',
      limit: '1'
    });

    const spotifyRes = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const spotifyData = await spotifyRes.json();
    const track = spotifyData.tracks?.items?.[0];

    // 3. Return Combined, Restructured Payload
    return {
      success: true,
      hexColor: aiData.analysis.dominant_color_hex,
      lighting: aiData.analysis.lighting,
      genre: aiData.audio_mapping.suggested_genre,
      reasoning: aiData.audio_mapping.reasoning,
      track: track ? {
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        uri: track.uri,
        url: track.external_urls.spotify,
        id: track.id,
        previewUrl: track.preview_url,
        coverArt: track.album.images?.[0]?.url
      } : null
    };

  } catch (error) {
    console.error("Pipeline Error:", error);
    return { success: false, error: "Failed to synthesize input." };
  }
}
```

---

## V2 ENHANCEMENT: LIVE CAMERA FEED

This section outlines a more advanced architecture for a "Version 2" of the app. It replaces the file input with a live camera feed for a more immersive and magical user experience, as detailed in `planb.md`.

### 8. The `getUserMedia` API

Instead of an `<input>`, V2 uses the browser's Media Devices API to request a live video stream from the user's camera.

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment', // Forces the rear camera
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  }
});
```

The resulting `stream` is then attached to an HTML `<video>` element.

### 9. The Video-to-Canvas Bridge

To "take a picture" from the live feed, an invisible `<canvas>` element is used:

1.  **Stream**: The `<video>` element displays the live feed to the user.
2.  **Capture**: On a user trigger (e.g., a button press), the current frame of the video is drawn onto the canvas: `context.drawImage(video, 0, 0)`.
3.  **Extraction**: The canvas content is converted to a Base64 string for the server action: `canvas.toDataURL('image/jpeg', 0.8)`.

### 10. Handling iOS Video Quirks

Developing with live video on the mobile web, especially iOS, requires handling specific attributes and policies:

*   **`playsinline`**: This attribute must be added to the `<video>` tag. Without it, iOS will force the video into its native fullscreen player, breaking the UI.
*   **Autoplay Policies**: Browsers block video autoplay if the stream has audio. Since the camera feed should be muted (`<video muted>`), autoplay is generally permitted, but using an explicit "Start Camera" button is the most robust implementation pattern.
