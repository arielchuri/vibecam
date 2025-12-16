# Vibecam Repository Structure

```
.
├── .claude/                              # Claude AI configuration (custom prompts, hooks)
└── vibecam_app/                          # Application container directory
    └── vibecam-simple/                   # Main React application
        ├── .netlify/                     # Local Netlify development cache (gitignored)
        │   ├── blobs-serve/              # Local blob storage simulation
        │   ├── functions-internal/       # Internal function runtime files
        │   ├── functions-serve/          # Served functions for local dev
        │   │   └── analyzeImage/         # Deployed analyzeImage function
        │   └── v1/                       # Netlify CLI version 1 cache
        ├── netlify/                      # Netlify serverless functions (deployed)
        │   └── functions/                # Source code for Netlify Functions
        ├── public/                       # Static assets served at root
        └── src/                          # React application source code
            ├── assets/                   # Images, icons, static files
            └── utils/                    # Utility functions and helpers

# Repository Root Files & Directories

.
├── concept.md                            # Original project vision and concept document
├── netlify.toml                          # Netlify deployment configuration (build settings, redirects)
├── quick_start_guide.md                  # Quick reference for getting started
├── README.md                             # Main repository documentation (portfolio overview)
├── repo_structure.md                     # This file - repository structure guide
├── simplified_starter_plan.md            # Step-by-step implementation guide (main tutorial)
├── synesthesia_camera_master_plan.md     # Future v1.0 roadmap with TypeScript/Next.js
├── synesthesia_systemprompt.md           # AI system prompt instructions for Gemini
└── vibecam_app/                          # Application container
    └── vibecam-simple/                   # Main Vite + React application
        ├── deno.lock                     # Deno package lock (for Netlify Edge Functions)
        ├── eslint.config.js              # ESLint linting configuration
        ├── index.html                    # HTML entry point for Vite
        ├── netlify/                      # Netlify Functions source code
        │   └── functions/
        │       └── analyzeImage.js       # Serverless function: AI image analysis with rate limiting
        ├── package-lock.json             # NPM dependency lock file
        ├── package.json                  # NPM dependencies and scripts
        ├── postcss.config.js             # PostCSS configuration (for Tailwind)
        ├── public/                       # Static public assets
        │   └── vite.svg                  # Vite logo
        ├── README.md                     # App-specific README (if different from root)
        ├── src/                          # React source code
        │   ├── App.jsx                   # Main React component (UI and logic)
        │   ├── assets/                   # React-imported assets
        │   │   └── react.svg             # React logo
        │   ├── index.css                 # Global CSS with Tailwind directives
        │   ├── main.jsx                  # React entry point (renders App)
        │   └── utils/                    # Utility functions
        │       ├── analyzeImage.js       # Client-side: calls Netlify Function
        │       └── compressImage.js      # Image compression before upload
        ├── tailwind.config.js            # Tailwind CSS configuration
        └── vite.config.js                # Vite bundler configuration

# Key File Purposes

## Root Documentation
- **concept.md**: Original brainstorming and project vision
- **simplified_starter_plan.md**: Complete tutorial (follow this to build)
- **synesthesia_camera_master_plan.md**: Future features roadmap
- **README.md**: Portfolio-ready overview for GitHub visitors

## Configuration Files
- **netlify.toml**: Tells Netlify how to build and deploy (base path, functions)
- **package.json**: Lists dependencies (React, Vite, Tailwind, Netlify CLI)
- **vite.config.js**: Configures Vite bundler for React
- **tailwind.config.js**: Tailwind CSS settings (content paths, theme)
- **postcss.config.js**: Enables Tailwind CSS processing

## Application Code
- **src/App.jsx**: Main UI - handles image upload, displays results
- **src/main.jsx**: Bootstraps React app, renders App component
- **src/utils/analyzeImage.js**: Sends images to Netlify Function
- **src/utils/compressImage.js**: Compresses images before analysis
- **netlify/functions/analyzeImage.js**: Serverless function with:
  - Google Gemini API integration
  - Rate limiting (5 requests/hour per IP)
  - Error handling and retries

## Deployment
- **netlify.toml**: Monorepo config pointing to `vibecam_app/vibecam-simple`
- **.netlify/**: Local development cache (not in git)
- **Environment variables**: `GOOGLE_API_KEY` stored in Netlify dashboard
```

## Monorepo Benefits

This structure keeps:
- **Planning docs at root** (shows thought process to recruiters)
- **Application isolated** in subdirectory (clean separation)
- **Everything in one repo** (easier to maintain, deploy, share)
