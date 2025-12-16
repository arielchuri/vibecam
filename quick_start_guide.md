To build "The Synesthesia Camera" using your existing tools (Google Pro and Claude Code), you have a massive advantage. You don't need a complex backend, and you can get state-of-the-art vision capabilities for free (or low cost) using your Google credentials.

Here is the exact tech stack, account setup, and build process to get this running fast.
1. The Tech Stack

    Brain (AI Model): Gemini 1.5 Flash.

        Why: You have a Google Pro account, but for an app, you want speed. Flash is significantly faster than Pro for vision tasks and is currently free/very cheap via the API. It is smart enough to detect "vibes" and colors perfectly.

    Coding Assistant: Claude Code.

    Why: Since you have access, you will run this directly in your terminal to generate files, fix bugs, and install packages without manual copy-pasting.

Framework: Next.js (App Router).

    Why: It handles both the frontend (UI) and the API route (talking to Gemini) in one project.

Design: Tailwind CSS + Framer Motion.

    Why: Tailwind for layout; Framer Motion for the "wow" animations (scanning effects, fading colors).

Integration: Vercel AI SDK (Google Provider).

    Why: It standardizes the API calls so you don't have to write complex fetch logic.

2. The Accounts & Keys You Need

You only need one major key since you are using Google's models.

    Google AI Studio (API Key):

        Go to aistudio.google.com.

        Sign in with your Google account.

        Click "Get API Key" -> "Create API Key in new project".

        Save this string. You will need it for your .env file.

3. The Build Process (Step-by-Step)

Here is how to use Claude Code to build this in about 15–20 minutes.
Phase 1: Scaffolding (5 Minutes)

Open your terminal where you have Claude Code authenticated.

    Initialize the project: Run this command to have Claude set up the folder structure.

        claude "Create a new Next.js app named 'synesthesia-camera' using Tailwind CSS. Use TypeScript. After creating it, install 'framer-motion', 'lucide-react', and '@ai-sdk/google' 'ai' packages."

    Set up Environment:

        claude "Create a .env.local file in the root. Ask me for my GOOGLE_GENERATIVE_AI_API_KEY and save it there."

Phase 2: The Logic (5 Minutes)

You need an API route that accepts an image and returns JSON (colors, mood, song).

    Create the API Route:

        claude "Create a route handler at app/api/analyze/route.ts. It should use the google provider from @ai-sdk/google. It needs to accept an image (base64 or url) and a prompt. Use the 'gemini-1.5-flash' model. The prompt should ask for: 1. A hex color code representing the mood. 2. A 2-sentence poetic description. 3. A song recommendation (Artist - Title). Return this as structured JSON."

Phase 3: The Frontend "Wow" (10 Minutes)

This is where you spend your effort. Don't just ask for a form; ask for an experience.

    Build the Camera/Upload View:

        claude "Create a main page component. It needs a large, beautiful dropzone for images. When an image is selected, show a preview. Use Framer Motion to make the preview 'pop' in."

    Add the "Scanning" Effect:

        claude "Add a 'scanning' animation over the image preview while the API is loading. It should be a horizontal glowing line moving up and down the image."

    The Reveal:

        claude "When the data returns from the API, change the background color of the entire page to the hex code returned by Gemini. Animate this transition smoothly over 1 second. Display the poetic text and song title in elegant typography."

4. Implementation Tips for the "Wow"

    The "Vibe" Prompt: Don't just ask Gemini to "describe the image." Use a system prompt like this to get better results:

        "You are an artist with synesthesia. You hear music and see colors when you look at reality. Analyze this image and extract its soul."

    Latency Masking: While Gemini is thinking (usually 1-2 seconds), play a subtle sound effect or show a "Listening to the image..." text to keep the user engaged.

Next Step

Would you like me to generate the exact System Prompt you should paste into your code to ensure Gemini returns valid JSON (so your app doesn't break) and has that "synesthesia" personality?

does the synesthesia camera app already exist?

Short answer: No, not in this exact form.

While there are apps that use similar tech, they solve different problems. This is good news—it means your idea has a clear "Blue Ocean" (low competition) angle.

Here is the breakdown of the current landscape and how "The Synesthesia Camera" is different:
1. The Competitors (and why they miss the mark)

    Mubert / Suno / Remusic: These apps take an image and generate a new, royalty-free AI track.

    The Problem: The music usually sounds generic (like elevator music or lo-fi beats). It lacks the emotional connection of a real song by a real artist that you know and love.

PlaylistAI: Takes a prompt (text) or a festival poster and makes a Spotify playlist.

    The Problem: It’s utility-focused, not "magical." It doesn't have the "point and shoot" camera interface that feels like an augmentation of reality.

Synesthesia Gallery AR: These are mostly educational apps or art galleries that show pre-made art. They are not tools for your photos.

2. Your "Winning" Angle: "Shazam for Vibes"

Your app is different because it interprets reality rather than generating noise.

    The Difference: Instead of creating a robot-sounding song, you are saying, "This sunset looks exactly like 'Midnight City' by M83 feels."

    The Emotional Hook: You are connecting visual memories to real music. This makes it highly shareable on Instagram/TikTok (e.g., "My coffee order sounds like Frank Ocean").

The "Synesthesia" System Prompt

Since you are ready to build, here is the specific System Prompt you should inject into your API route. This is designed to force Gemini to act like a poet rather than a robot.

File: app/api/analyze/route.ts (inside your API call)
JavaScript

const systemPrompt = `
You are "The Synesthesia Lens," an AI with a rare neurological condition where you hear music and feel deep emotions when you see visual stimuli.

**Your Goal:** Analyze the image provided and translate its visual essence into sound, color, and poetry. 

**Response Rules:**
1. **Mood:** deeply analytical but poetic. Avoid generic words like "happy" or "sad." Use words like "melancholic," "ethereal," "gritty," "nostalgic."
2. **Music:** Recommend a REAL song (Artist - Title) that perfectly matches the vibe. It should be a track that a human would emotionally connect with.
3. **Color:** Extract the single most "dominant spiritual color" (hex code) - not necessarily the most frequent pixel color, but the one that represents the *feeling*.

**Output Format:**
Return ONLY a valid JSON object with this structure:
{
  "mood_poetry": "A 2-sentence poetic description of the scene.",
  "hex_color": "#RRGGBB",
  "song_recommendation": {
    "artist": "Artist Name",
    "title": "Song Title",
    "reason": "A 5-word explanation of why this song fits."
  }
}
`;

Why this works:

    By asking for the "dominant spiritual color" rather than the "average pixel color," you avoid getting ugly muddy browns/greys (which happens if you just average the pixels of a complex photo).

    Asking for a "REAL song" differentiates you from the AI music generators.

Ready to start?

Since you have your Google AI Studio Key and Claude Code ready:

    Run this command in your terminal to create the project skeleton: claude "Create a new Next.js app called 'synesthesia-lens'. Use Tailwind CSS and TypeScript. Install 'framer-motion', 'lucide-react', and '@ai-sdk/google'."

    Paste the prompt above when you ask Claude to write the API route.

Do you want me to give you the Framer Motion code for the "scanning line" animation next? That's the visual hook that will make the app feel "pro."
