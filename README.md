# Vibecam - AI Synesthesia Camera

> Transform what you see into AI-generated emotional analysis with dynamic colors and soundscapes.

## 🎨 What is Vibecam?

Vibecam is an AI-powered web application that analyzes images through the lens of synesthesia - experiencing one sense through another. Point your camera at the world, and the AI interprets what it would *sound* like, generating:

- **Poetic mood descriptions**
- **Emotional color palettes** (background changes dynamically)
- **Sonic atmosphere descriptions**
- **Vibe tags** for the scene

## 🚀 Live Demo

Coming soon - deployment in progress!

## 📁 Project Structure

This is a **monorepo** containing both planning documentation and the application:

```
vibecam/
├── concept.md                          # Original project concept
├── simplified_starter_plan.md          # Step-by-step implementation guide
├── synesthesia_camera_master_plan.md   # Future v1.0 roadmap
├── vibecam_app/
│   └── vibecam-simple/                 # Main application
│       ├── netlify/functions/          # Serverless API functions
│       ├── src/                        # React app source
│       └── netlify.toml                # Deployment config
└── README.md                           # You are here

```

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **AI Vision**: Google Gemini 2.0 Flash
- **Backend**: Netlify Functions (serverless)
- **Deployment**: Netlify
- **Security**: Server-side API key handling + rate limiting

## ✨ Key Features

### Current (v0.5)
- ✅ Image upload with compression
- ✅ AI-powered synesthetic analysis
- ✅ Dynamic background color transitions
- ✅ Poetic mood descriptions
- ✅ Rate limiting (5 requests/hour per IP)
- ✅ Secure API key handling

### Planned (v1.0)
- 🎵 Generative music based on image mood
- 📸 Live camera feed
- 💾 Save and share analyses
- 🎨 Enhanced animations with Framer Motion
- 🔐 User accounts

## 🧪 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Gemini API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/vibecam.git
   cd vibecam
   ```

2. **Install dependencies**
   ```bash
   cd vibecam_app/vibecam-simple
   npm install
   ```

3. **Set up environment variables**

   Create `.env` file:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

4. **Run locally with Netlify Dev**
   ```bash
   npx netlify dev
   ```

5. **Open http://localhost:8888**

## 📖 Documentation

- **[Simplified Starter Plan](./simplified_starter_plan.md)** - Complete implementation guide
- **[Concept Doc](./concept.md)** - Original vision and ideas
- **[Master Plan](./synesthesia_camera_master_plan.md)** - Future features roadmap

## 🔐 Security & Rate Limiting

This portfolio demo implements:
- **Server-side API calls** - API keys never exposed to client
- **Rate limiting** - 5 requests per hour per IP address
- **Budget protection** - Hard caps on API usage
- **CORS security** - Proper headers for production

## 💰 Cost Estimates

With current free tiers:
- **Gemini API**: ~$0.01 per 1000 images (essentially free)
- **Netlify Hosting**: Free tier covers 125k function invocations/month
- **Total**: $0/month for portfolio use

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome! Feel free to open an issue.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## 👨‍💻 Author

**Ariel** - Portfolio project showcasing:
- AI/ML integration (Gemini API)
- Serverless architecture (Netlify Functions)
- Modern React development
- Security best practices
- Full-stack thinking (planning → implementation)

---

**Built with ❤️ using React, Gemini AI, and Netlify**
