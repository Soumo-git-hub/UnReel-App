# UnReel Intelligence Engine (Backend API)
<div align="center">
<img src="../unreel-web/public/UnReel-Logo.png" alt="UnReel Logo" width="180"/>

<h3>The Advanced Video Intelligence Orchestrator</h3>
<p>Powered by FastAPI, Google Gemini 1.5 Pro, and OpenAI Whisper</p>

[**Live Intelligence API (Production)**](https://huggingface.co/spaces/soumo-lives-in-cloud/UnReel-API)
</div>

---

## 🚀 Overview
The **UnReel API** is a specialized intelligence engine built with **FastAPI**. It orchestrates a complex multi-modal pipeline to ingest, analyze, and interrogate short-form video content (Reels, Shorts, TikToks). By utilizing a **Multi-Lens Intelligence (M.L.I.)** framework, it extracts deep situational, educational, and commercial context, turning raw video into a queryable "Living Document."

## 🛠️ Technical Core
*   **Web Framework**: FastAPI (Asynchronous Python 3.11+)
*   **AI Vision & Reasoning**: Google Gemini 1.5 Pro (Flash/Pro dual-tier)
*   **Audio Intelligence**: OpenAI Whisper (Speech-to-Text), Shazam Core (Audio Fingerprinting)
*   **Data Persistence**: **Supabase PostgreSQL** via SQLAlchemy 2.0
*   **Authentication**: Firebase Admin SDK (ID Token Verification)
*   **Media Processing**: FFmpeg (Atomization) & yt-dlp (Triple-Shield Ingestion)
*   **Search RAG**: Concurrent Google Search API for evidence grounding

## 📂 Project Architecture
```text
unreel-api/
├── app/
│   ├── core/           # Prompt Engineering, App Configuration & Security
│   ├── routers/        # Analysis, Chat, and System Health API Routes
│   ├── services/       # Functional logic: Media, AI, Search, and Translation
│   ├── schemas.py      # Pydantic V2 API Contracts & Types
│   ├── models.py       # SQLAlchemy 2.0 Database Entities
│   ├── database.py     # Session & Engine initialization
│   └── main.py         # Application Entrypoint
├── tests/              # Pytest suite for AI and Media logic
├── alembic/            # Database migrations (Managed by Alembic)
├── Dockerfile          # Production containerization
└── requirements.txt    # Dependency tree
```

## 🗃️ Database Schema (SQLAlchemy 2.0)
The backend uses a robust relational schema optimized for forensic session persistence and JSON enrichment.

### ✨ `Analysis` Model (The Hub)
```python
class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    originalUrl: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="processing")
    
    # Metadata (yt-dlp)
    title: Mapped[Optional[str]] = mapped_column(String)
    uploader: Mapped[Optional[str]] = mapped_column(String)
    caption: Mapped[Optional[str]] = mapped_column(Text)
    
    # Intelligence Lenses (JSON Enrichment)
    locationContext: Mapped[Optional[JSON]] = mapped_column(JSON)
    educationalInsights: Mapped[Optional[JSON]] = mapped_column(JSON)
    shoppingItems: Mapped[Optional[JSON]] = mapped_column(JSON)
    factCheck: Mapped[Optional[JSON]] = mapped_column(JSON)
    enhancedResources: Mapped[Optional[JSON]] = mapped_column(JSON)
    musicContext: Mapped[Optional[JSON]] = mapped_column(JSON)
    
    # Core Analysis
    summary: Mapped[Optional[str]] = mapped_column(Text)
    fullTranscript: Mapped[Optional[str]] = mapped_column(Text)
    detectedLanguage: Mapped[Optional[str]] = mapped_column(String)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=func.now())
```

### 💬 `ChatMessage` Model (Chat Persistence)
```python
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    analysisId: Mapped[str] = mapped_column(String, index=True, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    reply: Mapped[str] = mapped_column(Text, nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=func.now())
```

## 🧬 API v1 Endpoints (Pydantic Contracts)

### 🔍 Analysis
*   `POST /api/v1/analyze`: Launches the Multi-Lens analysis.
    *   **Payload**: `url`, `focusLocation`, `focusShopping`, `focusFactCheck`, etc.
*   `GET /api/v1/analyze`: Returns user history (Last 20 sessions).
*   `GET /api/v1/analyze/{id}`: Full report retrieval.
*   `POST /api/v1/analyze/{id}/translate`: Translate results into 50+ languages.

### 💬 Intelligence Chat
*   `POST /api/v1/chat`: Interactive RAG interrogation.
    *   **Payload**: `analysisId`, `message`, `persona` (Custom personality strings).
*   `GET /api/v1/chat/{analysisId}`: Thread history retrieval.

## ⚙️ Setup & Installation

### 1. Prerequisites
*   **Python 3.11+**
*   **PostgreSQL Database**
*   **FFmpeg** (Crucial for audio extraction & frame analysis)

### 2. Installing FFmpeg (Required)
FFmpeg is the engine behind our frame and audio isolation. Ensure it is in your system PATH.

#### **Windows**
```powershell
# Using Chocolatey
choco install ffmpeg
# Using Winget
winget install FFmpeg
```
#### **macOS**
```bash
brew install ffmpeg
```
#### **Linux (Ubuntu/Debian)**
```bash
sudo apt update && sudo apt install ffmpeg
```

### 3. Local Environment Setup
```bash
# Create Virtual Environment
python -m venv venv
source venv/bin/activate # Windows: .\venv\Scripts\Activate.ps1

# Install Dependencies
pip install -r requirements.txt

# Database Setup (PostgreSQL)
psql -U postgres -c "CREATE DATABASE unreel;"
```

### 4. Configuration (`.env`)
Create a `.env` file in the root directory:
```bash
GEMINI_API_KEY="your_google_ai_key"
SHAZAM_API_KEY="your_api_key"
DATABASE_URL="postgresql://your_user:your_pass@db.supabase.co:5432/postgres"
FIREBASE_ADMIN_SDK_JSON_PATH="./firebase-adminsdk.json"
```

### 5. Running the API
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 🐋 Deployment (Hugging Face / Docker)
This backend is optimized for **Hugging Face Spaces** using the **Docker SDK**.

### **Deploying a Subfolder (Git Subtree)**
Since the API is nested, use the subtree strategy from the **root** folder:
```bash
# 1. Add Remote
git remote add hf https://huggingface.co/spaces/YOUR_USER/YOUR_SPACE
# 2. Deploy Subfolder
git subtree split --prefix unreel-api --branch deploy-hf
git push hf deploy-hf:main --force
```

### **Required Secrets (Configure in HF UI)**
*   `GEMINI_API_KEY`: Google AI Studio Token.
*   `DATABASE_URL`: Managed **Supabase PostgreSQL** Connection String.
*   `FIREBASE_SERVICE_ACCOUNT_JSON`: Paste original JSON content.

## 🛠️ Troubleshooting

### 1. FFmpeg Not Found
**Error**: `ffmpeg not found, skipping audio extraction`
**Solution**: Ensure FFmpeg is installed and added to your System PATH. Restart your terminal after installation.

### 2. Gemini API 403/401
**Error**: `API key not valid` or `Access Forbidden`
**Solution**: Verify your key at [Google AI Studio](https://aistudio.google.com/). Ensure your account has Gemini 1.5 Pro access enabled.

### 3. Port Already in Use
**Error**: `OSError: [Errno 98] Address already in use 8000`
**Solution**: Either kill the process using port 8000 or change the port in `.env` and `uvicorn` command.

### 4. Database Connection Issues
**Error**: `Connection refused` or `database "unreel" does not exist`
**Solution**: Ensure PostgreSQL is running. Run `CREATE DATABASE unreel;` in your PostgreSQL shell.

## 📄 License
Licensed under the **MIT License**.

## 👨‍💻 Author
**Soumyadyuti Dey**
[GitHub](https://github.com/Soumo-git-hub) | [LinkedIn](https://www.linkedin.com/in/soumyadyuti-dey-245sd/)