# UnReel Web App

This is the high-performance web frontend for the UnReel application, built with Next.js 15/16 and optimized for production using Partial Prerendering (PPR) and GPU acceleration.

## Project Structure

```
unreel-web/
├── app/                        # Next.js App Router
│   ├── analysis/               # Dynamic analysis routes
│   │   └── [id]/               # Analysis page with ChatPanel
│   ├── layout.tsx              # Root layout with Auth & Framer Motion
│   └── page.tsx                # Landing page with Hero
├── components/                 # React components
│   ├── Auth/                   # Authentication modals
│   ├── AuroraBackground.tsx    # Hardware-accelerated background
│   ├── Hero.tsx                # Main input & search components
│   ├── HistoryPanel.tsx        # User analysis history sidebar
│   ├── ProcessScreen.tsx       # AI processing animations
│   └── SettingsPanel.tsx       # User configuration panel
├── lib/                        # Core utilities & state
│   ├── api.ts                  # API service layer (Hugging Face)
│   ├── AuthContext.tsx         # Firebase Auth Provider
│   └── firebase.ts             # Firebase SDK initialization
├── public/                     # Static assets & SEO
│   └── robots.txt              # Standard crawler instructions
├── next.config.ts              # Build & experiment configurations
└── vercel.json                 # Deployment & security headers
```

## Features

1. **Video Analysis**: Paste a video URL to perform deep AI analysis of content.
2. **AI Chat Interface**: Real-time context-aware chat about analyzed videos.
3. **Aurora Design**: Premium UI with hardware-accelerated fluid animations.
4. **Analysis History**: Cloud-synced history for authenticated users.
5. **Multi-Language Support**: Instant translation of transcripts using AI.
6. **Mobile Responsive**: Fully optimized BENTO-grid layout for all screen sizes.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file for environment configurations:
   ```bash
   # API & Backend
   NEXT_PUBLIC_API_URL=https://soumo-huggs-un-reel.hf.space/api/v1
   
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   # ... add other firebase bits ...
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. **Production Check (Lighthouse 90+ Score)**:
   To test the fully optimized production speed, run:
   ```bash
   npm run build
   npm start
   ```

## Backend Connection

The web app connects to the UnReel backend API hosted on **Hugging Face Spaces**. Ensure the backend is awake and the `NEXT_PUBLIC_API_URL` is points to the correct Space URL.

## Components

### AuroraBackground
A high-performance shader-like background that uses raw CSS radial gradients and `translate3d` to avoid main-thread lag.

### Hero
The primary entry point where users can:
- Paste video URLs
- Initiate AI Analysis
- Toggle History and Settings panels
- Experience dynamic layout transitions

### AnalysisPage (Server/Client Hybrid)
A split architecture that ensures fast initial loading:
- **Server Wrapper**: Handles `force-dynamic` rendering and SEO.
- **Client Client**: Handles real-time interactivity, translation toggles, and chat.

### ChatPanel
An intelligent side-panel allowing users to:
- Deep-dive into video details.
- Ask questions about specific timestamps.
- Export chat logs as Markdown.

## API Service

The `lib/api.ts` file contains the logic for communicating with the AI backend:
- `analyzeVideo(url)`: Triggers core video intelligence processes.
- `listHistory()`: Fetches user-specific analysis logs.
- `chatAboutVideo(id, msg)`: Managed conversation states for the AI.
- `translateTranscript(id, lang)`: Performs on-the-fly language synthesis.

## Dependencies

- **Next.js 15/16**: Framework & Routing.
- **Framer Motion**: State-driven animations (using LazyMotion for weight reduction).
- **Lucide React**: Icon system (optimized via package tree-shaking).
- **Firebase SDK**: Authentication and user state.
- **React Markdown**: Rendering AI-generated structured responses.

## Development

To modify the web experience:
1. Update global styles and animation keyframes in `app/globals.css`.
2. Add new analysis features to the BENTO grid in `app/analysis/[id]/page.tsx`.
3. Optimize API interactions within `lib/api.ts`.

## Troubleshooting

1. **Low Lighthouse Score?** Ensure you are running `npm start` (production mode) and NOT `npm run dev`.
2. **Build Error on Analysis Page?** Ensure the `page.tsx` is a Server Component wrapping the `AnalysisClient` as per current Next.js 15/16 standards.
3. **CORS Errors?** Verify that the Vercel domain is whitelisted in the Hugging Face Space FastAPI settings.
4. **HMR Errors?** Reload the browser; this is a known development-only bug in Turbopack when syncing CSS modules.
