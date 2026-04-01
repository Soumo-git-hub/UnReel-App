# UnReel: Video Intelligence and Analysis Platform
<div align="center">
<img src="unreel-web/public/UnReel-Logo.png" alt="UnReel Logo" width="220"/>



<h3>Watch the intelligence unfold</h3>
<p>Developed by Soumyadyuti Dey</p>

[**Live Frontend Web App**](https://un-reel-app.vercel.app) | [**Backend Intelligence API**](https://huggingface.co/spaces/soumo-lives-in-cloud/UnReel-API)
</div>

---

## 📝 Overview
**UnReel** is a state-of-the-art **Video Intelligence and Analysis tool** designed to transform complex short-form content into actionable insights. By leveraging multi-modal artificial intelligence (Google Gemini 1.5 Pro) and a robust Retrieval-Augmented Generation (RAG) architecture, UnReel decodes the "Invisible Data" within videos—extracting context, verifying claims, and identifying resources that are often missed by traditional players.

## ✨ Key Features

### 🤖 Specialized Intelligence Lenses (M.L.I.)
UnReel uses a specialized orchestrator to run granular analysis through dedicated lens pipelines:
*   **Location Lens**: **Flow**: Gemini analyzes visual frames to determine the `sceneType` (Indoor, Urban, Beach, etc.) and identifies global landmarks with confidence-weighted spatial recognition.
*   **Educational Lens**: **Flow**: Extracts pedagogical value from transcripts and visual overlays; distills tutorials into structured `educationalInsights` (steps, tips, and key takeaways).
*   **Shopping Lens**: **Flow**: Detects products, outfits, and gadgets; generates descriptive metadata and utilizes a **RAG pass** to find real-world purchase links and official search queries.
*   **Fact-Check Lens**: **Flow**: A dual-tier process; identifies 1-3 verifiable claims which are then cross-referenced with live Google Search results for a final, evidence-grounded verdict.
*   **Resource Lens (Link-Detective)**: **Flow**: Identifies "gatekept" resources (e.g., "Link in bio", "Comment for link"); determines resource types (Notion templates, books, apps) and provides direct search queries to bypass DMs.
*   **Music Lens**: **Flow**: Bypasses general AI for a specialized **Shazam Core Scan**; identifies background tracks even in high-noise environments and provides official music credits and streaming links.

*   **Intelligence Dashboards**: Instant visualization of deep video context via a high-density forensic UI.
*   **Conversational RAG Engine**: An interactive "Living Document" interface where users can interrogate video content, transcripts, and visual evidence in real-time.
*   **Professional Reporting**: One-click generation of comprehensive **PDF forensic reports** (jsPDF) for researchers and investigators.
*   **High-Resilience Ingestion**: Instant ingestion support for **Instagram, YouTube, X, LinkedIn**, and **Google Drive**.
*   **Multi-Language Logic**: Real-time translation and dialect detection for global content decoding.
*   **Secure Identity Management**: Enterprise-grade secure authentication via **Firebase Auth** (Google Login & Email/Pass).

#### 🔄 The 8-Step Engineering Pipeline
UnReel orchestrates a sophisticated media and AI pipeline to achieve its high-fidelity output:
1.  **Multi-Shield Ingestion**: Orchestrating `yt-dlp` and social proxies to bypass rate-limits and region-locks.
2.  **Visual & Audio Atomization**: Using **FFmpeg** to extract frames (@0.2 FPS) and isolate high-quality audio streams.
3.  **Neural Transcription**: Pushing isolated audio through **OpenAI Whisper** for high-precision time-coded text.
4.  **Linguistic Identification**: Running `langdetect` to establish the semantic baseline for analysis.
5.  **Multi-Modal AI Orchestration**: Feeding visual frames + transcript + audio into **Gemini 1.5 Pro** for unified reasoning.
6.  **Parallel Lens Execution**: Simultaneous generation of M.L.I. data blocks (Location, Shopping, etc.) based on user toggles.
7.  **Search-Grounded RAG Refinement**: Running concurrent **Google Search API** queries to verify AI-extracted claims and find marketplace links.
8.  **Contextual Synthesis & Persistence**: Committing the final intelligence block to **PostgreSQL** and initializing the chat context.

## 🗃️ Database Architecture (PostgreSQL/SQLAlchemy)
The core infrastructure utilizes a high-density relational schema optimized for deep media persistence and asynchronous JSON enrichment.

### ✨ Primary Schema Entities
*   **`Analysis` Table**: The centralized intelligence hub for every video interrogation.
    *   **Core Logic**: `id` [UUID], `originalUrl` [URL String], `status` [Lifecycle Flag].
    *   **Media Metadata**: `title`, `uploader`, `caption`, `fullTranscript`.
    *   **Multi-Lens Blobs (JSON)**: `locationContext`, `educationalInsights`, `shoppingItems`, `factCheck`, `enhancedResources`, `musicContext`.
    *   **Persistence**: `createdAt`, `updatedAt`, `userId` [Indexed for session retrieval].

*   **`ChatMessage` Table**: Persistent RAG-powered context for the Intelligence Chat.
    *   **Schema**: `id` [UUID], `analysisId` [Foreign Key (Cascade)], `message` [User Question], `reply` [AI Context Response].

## 🛠️ Technical Stack & Libraries
### Frontend (Next.js 16)
*   **Core**: React 19, Next.js 16 (App Router)
*   **Styling**: Vanilla CSS, Tailwind CSS
*   **Interactive Components**: Framer Motion 12+, Lucide React
*   **Identity Management**: Firebase Auth (Google OAuth, Email/Pass)
*   **Intelligence Rendering**: React Markdown, **jspdf** (Automated Report Generation), jspdf-autotable

### Backend (FastAPI & AI Engine)
*   **Framework**: FastAPI 0.104+, Uvicorn 0.24+
*   **AI Orchestration**: Google Generative AI (Gemini 1.5), **LangChain**, OpenAI Whisper
*   **Media Processing**: FFmpeg-python, yt-dlp, Langdetect, Deep-translator
*   **Logic & Service Layer**: Pydantic 2.5 (Settings & Schemas), Requests, Firebase Admin SDK

### Infrastructure & Pipeline
*   **Database**: **Supabase PostgreSQL** (Managed High-Performance Persistence Layer)
*   **ORM**: **SQLAlchemy 2.0** (Structured Data Abstraction)
*   **Deployment**: Vercel (Frontend), Hugging Face Spaces (Backend Docker)

## 🔌 Complete API v1 Reference
The **UnReel API** provides an exhaustive RESTful architecture for deep video interrogation.

### 🔍 Analysis Operations (`/api/v1/analyze`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/analyze` | List analysis history (Last 20 sessions for the current user). |
| `POST` | `/api/v1/analyze` | **Analyze Video**: Creates a report with custom Intelligence Lens encoding. |
| `GET` | `/api/v1/analyze/{id}` | Retrieve comprehensive intelligence report (Summary, M.L.I. Data, Transcript). |
| `POST` | `/api/v1/analyze/{id}/translate` | Translate report/transcript into 50+ supported languages. |

#### **POST /api/v1/analyze Interface**
**Request Body**:
```json
{
  "url": "https://www.youtube.com/shorts/...",
  "focusLocation": true,
  "focusEducational": true,
  "focusShopping": true,
  "focusFactCheck": true,
  "focusResource": true,
  "focusMusic": true
}
```

**Response Schema**:
```json
{
  "analysisId": "550e8400-e29b-41d4-a716-446655440000",
  "originalUrl": "https://www.instagram.com/reel/Cxyz.../",
  "status": "completed",
  "metadata": {
    "title": "Tokyo Night Walk",
    "uploader": "urban_explorer",
    "caption": "Shibuya vibes at midnight. #tokyo #shibuya"
  },
  "content": {
    "summary": "The video showcases a walking tour through Shibuya at night...",
    "translation": "Das Video zeigt einen Rundgang durch Shibuya bei Nacht...",
    "keyTopics": ["Tokyo", "Shibuya", "Nightlife"],
    "mentionedResources": [{"type": "Location", "name": "Shibuya Crossing"}],
    "locationContext": {
      "sceneType": "Urban Street",
      "landmark": "Shibuya Crossing",
      "confidence": 0.98
    },
    "educationalInsights": ["Tip: Visit after 11 PM for fewer crowds"],
    "shoppingItems": [{"name": "Neon Jackets", "potentialUrl": "Shibuya neon fashion"}],
    "factCheck": [{"claim": "Shibuya has the world's busiest crossing", "verdict": "Supported"}],
    "enhancedResources": [{"name": "Tokyo Travel Guide", "urlSuggestion": "Tokyo guide 2026"}],
    "musicContext": {"songName": "Tokyo Drift", "artist": "Teriyaki Boyz"}
  },
  "availableFeatures": {"location": true, "shopping": true, "factCheck": true},
  "fullTranscript": "Hey guys, look at these neon lights in Shibuya...",
  "detectedLanguage": "en",
  "createdAt": "2026-04-01T21:44:00.000Z"
}
```

### 💬 Intelligence Engagement (`/api/v1/chat`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/chat` | **Interactive Chat**: High-fidelity RAG conversation within the video context. |
| `GET` | `/api/v1/chat/{analysisId}` | Retrieve full chat message history for a specific analysis session. |

#### **POST /api/v1/chat Interface**
**Request Body**:
```json
{
  "analysisId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Where in Tokyo was this filmed?",
  "persona": "Professional Forensic Analyst"
}
```

**Response Schema**:
```json
{
  "reply": "Based on the visual evidence and landmark recognition, this was filmed at Shibuya Crossing in Tokyo, Japan. The analysis detected characteristic neon signage and heavy pedestrian flow at timestamp 0:12."
}
```

### ⚙️ System Monitoring
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Real-time system health and service status. |

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.11 or higher)
- **Docker** and **Docker Compose** (For containerized deployment)
- **FFmpeg** (Crucial for frame capture and audio processing)
- **Git** (For version control)

### Quick Start
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Soumo-git-hub/UnReel-App.git
   cd UnReel-App
   ```
2. **Configure Environment Variables** (See [Environment Variables](#environment-variables) section below)

### Backend Setup (FastAPI)
1. **Navigate to the backend directory**:
   ```bash
   cd unreel-api
   ```
2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Initialize Database & Start**:
   ```bash
   python run.py
   ```

### Frontend Setup (Next.js 16)
1. **Navigate to the web dashboard**:
   ```bash
   cd unreel-web
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🔐 Environment Variables

Create a `.env` file in the `unreel-api` directory and a `.env.local` in the `unreel-web` directory.

### Backend (`unreel-api/.env`)
```env
# Intelligence Core
GEMINI_API_KEY=your_google_ai_studio_key
DATABASE_URL=postgresql://your_user:your_pass@db.supabase.co:5432/postgres
SHAZAM_API_KEY=your_shazam_key

# Security & Firebase
FIREBASE_SERVICE_ACCOUNT_JSON=./firebase-adminsdk.json

# Media Paths (Optional if in System PATH)
FFMPEG_PATH=/usr/bin/ffmpeg
YT_DLP_PATH=/usr/local/bin/yt-dlp
```

### Frontend (`unreel-web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=unreel.firebaseapp.com
```

## 🛠️ Development & Testing

### Workflow
1. **Backend Documentation**: Access full interactive Swagger UI at `http://localhost:8000/docs`
2. **Frontend Interactivity**: Use `npm run dev` to access the Dashboard with Hot Reloading.
3. **Forensic Logs**: Follow real-time ingestion logs in the backend terminal to monitor the 8-step pipeline.

### Testing Suite
```bash
# Navigate to backend
cd unreel-api

# Run full AI & Media test suite
python -m pytest tests/

# Run individual pipeline tests
python tests/test_full_analysis.py
```

## 🔍 Troubleshooting
1. **FFmpeg Not Found**: Ensure FFmpeg is installed and added to your System PATH. On Windows, restart your terminal after installation.
2. **Gemini 403 Forbidden**: Verify your Google AI Studio API key and usage limits.
3. **Database Connection**: Ensure the PostgreSQL service is running and the `DATABASE_URL` is correct.
4. **CORS Errors**: Ensure the `BACKEND_CORS_ORIGINS` in your environment includes the URL of your frontend dashboard.

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📁 Project Structure
```text
UnReel-App/
├── unreel-web/          # Next.js 16/React 19 Dashboard
├── unreel-api/          # FastAPI Intelligence Engine
└── Content/
    ├── Documentation/   # Presentations & Architecture
    ├── Video/           # Demo Overviews
    └── images/          # Screenshots & Analysis Views
```

## 🎥 Video Intelligence Presentation
[**Demo Video: Watch the intelligence unfold**](Content/Video/Demo%20Video%20-%20UnReel%20-%20Video%20Inteligence%20and%20Analysis%20Platform.mp4)

## 📸 Technical Deep Dive & System UI

### Full System Architecture
<div align="center">
  <img src="Content/Documentation/Architecture%20Of%20UnReel.png" alt="System Architecture" width="800"/>
  <br><b>The High-Performance Analysis Pipeline</b>
</div>

### Platform Interface & Intelligence Modules
<div align="center">
  <img src="Content/images/UnReel-HomePage.png" alt="Platform Home" width="800"/>
  <br><b>UnReel Platform - Global Interface</b><br><br>

  <img src="Content/images/Analysis-Summary-Resource-Context-Location.png" alt="Forensic Summary" width="800"/>
  <br><b>Multi-Modal Intelligence Summary</b><br><br>

  <img src="Content/images/Analysis-Education-Shoping-FactCheck.png" alt="Forensic Detailed" width="800"/>
  <br><b>Intelligence Modules: Shopping, Fact-Check & Education</b><br><br>

  <img src="Content/images/Analysis-Translation.png" alt="Forensic Translation" width="800"/>
  <br><b>Multi-Language Translation Intelligence</b><br><br>

  <img src="Content/images/Chat-with-my-reel-interface.png" alt="Intelligence Chat" width="400"/>
  <br><b>RAG-powered Interactive Chat Engine</b><br><br>

  <img src="Content/images/Chat-Personality-Settings.png" alt="Chat Personalization" width="400"/>
  <br><b>Custom Intelligence Personas & Real-time Reasoning</b><br><br>

  <img src="Content/images/Analysis-History.png" alt="Session History" width="400"/>
  <br><b>Intelligent History & Analysis Persistence</b><br><br>

  <img src="Content/images/Analysis-PDF-Report.png" alt="PDF Report" width="800"/>
  <br><b>Automated Video Intelligence Report Generation (PDF)</b><br><br>

  <img src="Content/images/Authentication.png" alt="Secure Auth" width="800"/>
  <br><b>Secure Authentication Interface (Firebase Verified)</b>
</div>

## 📄 PPT Presentation & Ecosystem Logic
The core platform vision, strategic analysis strategy, and technical logic are discussed in detail within our **PPT Documentation**:

*   [**View Full PPT Documentation: UnReel Intelligence Platform**](Content/Documentation/UnReel%20-%20Video%20Intelligence%20and%20Analysis%20Platform%20-%20Documentation.pdf)
*   [**View Full PPT Architecture & Logic**](Content/Documentation/UnReel_%20Video%20Intelligence%20and%20Analysis%20Platform.pdf)

## 📄 License
Licensed under the **MIT License**.

### ⚖️ Important Legal & Disclaimer
> **Disclaimer**: This application is intended for educational and demonstration purposes only. Users must comply with all applicable copyright laws, platform terms of service, and fair use principles when using this software.
> 
> **Commercial Use**: Any commercial use of this software or the content processed by it is strictly prohibited without explicit written authorization from the copyright holder.
> 
> **Platform Usage**: YouTube, Instagram, TikTok, and other platform content analyzed by this application remains the property of the respective owners. This tool does not provide any rights to the video content itself.

## 👨‍💻 Author
**Soumyadyuti Dey**
[GitHub](https://github.com/Soumo-git-hub) | [LinkedIn](https://www.linkedin.com/in/soumyadyuti-dey-245sd/)