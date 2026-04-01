# UnReel Intelligence Interface (Frontend Web)
<div align="center">
<img src="./public/UnReel-Logo.png" alt="UnReel Logo" width="220"/>

<h3>The Cinematic Gateway to "Invisible Data"</h3>
<p>Developed with Next.js 16, React 19, and Framer Motion 12</p>

[**Live Dashboard (Production)**](https://un-reel-app.vercel.app)
</div>

---

## 📝 Overview
The **UnReel Forensic Interface** is a state-of-the-art web application designed for high-density video interrogation. It transforms the raw outputs of the UnReel Intelligence Engine into a cinematic, interactive "Living Document." Built on **Next.js 16's App Router** and **React 19**, the platform utilizes a **Kinetic UI** philosophy—where every data point is interactive, every insight is grounded in evidence (RAG), and every session is persistable.

## 🛠️ Technical Stack & Design Tokens
*   **Framework**: Next.js 16.2 (App Router Core)
*   **Engine**: React 19 (Server & Client Components)
*   **Kinetic UI Engine**: **Framer Motion 12.3** (Physics-based grid transitions)
*   **Identity Layer**: Firebase Auth 12.11 (Google OAuth & Secure Email)
*   **Forensic Icons**: Lucide React 1.6
*   **Aesthetics**: Glassmorphism, Aurora Gradients, and Custom CSS Modules
*   **Reporting**: **jsPDF 4.2** (Automated Report Generation)

## 📂 Project Topology & Logic
```text
unreel-web/
├── app/
│   ├── (auth)/          # Secured Identity Routes (Login/Signup)
│   ├── analysis/[id]/   # The "Forensic Dashboard": High-density data grid
│   │   ├── page.tsx     # Route Entry (Server-side hydration)
│   │   ├── Client.tsx   # Intelligence Orchestrator (Data Mapping & UI Logic)
│   │   └── ChatPanel.tsx # RAG Interrogation Interface
│   ├── layout.tsx       # Secure Context & Global Nav
│   └── page.tsx         # Ingestion Terminal (Home)
├── components/          # High-Performance UI Modules
│   ├── AuroraBackground # Kinetic motion canvas
│   ├── ProcessScreen    # Pipeline visualization (8-Step status)
│   ├── HistoryPanel     # Session persistence & Recovery
│   └── Shared/          # Glassmorphism Primitives
├── lib/                 # Service & Logic Layer
│   ├── AuthContext.tsx  # Firebase ID Token management
│   ├── api.ts           # Axios client with Auth Interceptors
│   └── utils/           # Report Export & Language Mappers
```

## 🗺️ Application Routing Table
Every route within the **UnReel Interface** is secured with specialized Auth guards and data hydration logic.

| Route | Logic & Description | Access Layer |
| :--- | :--- | :--- |
| `/` | **Ingestion Terminal**: Centralized hub for URL input and M.L.I. lens selection. | Public/Private |
| `/analysis/[id]` | **Forensic Dashboard**: Key-session interrogation view with persistent RAG Chat. | Private (Verified ID) |
| `/auth/login` | **Secure Entry**: Firebase OAuth and Email identity verification. | Public |
| `/auth/signup` | **Secure Enrollment**: New user registration and data siloing. | Public |

## 🧬 Client-Side API Connectors (`lib/api.ts`)
The interface interfaces with the **Intelligence API** using a secure **Axios Interceptor** that injects a Firebase ID Token into every forensic request.

| Endpoint | Method | Frontend Functionality |
| :--- | :--- | :--- |
| `/api/v1/analyze` | `POST` | Launches the Multi-Lens Intelligence (M.L.I.) analysis pipeline. |
| `/api/v1/analyze` | `GET` | Hydrates the **History Panel** with the last 20 user sessions. |
| `/api/v1/analyze/{id}` | `GET` | Retrieves granular forensic reports (Summary, M.L.I. Data, Transcripts). |
| `/api/v1/analyze/{id}/translate` | `POST` | Triggers the **Multi-Language Logic** to translate transcripts in real-time. |
| `/api/v1/chat` | `POST` | Communicates with the **RAG Engine** for context-aware video questioning. |

---

## ✨ Core Intelligence Modules

### 1. The Multi-Lens Intelligence (M.L.I.) Grid
The interface dynamically morphs based on the **Intelligence Lenses** successfully extracted by the backend.
*   **Spatial Analysis**: Renders landmark data and `sceneType` with confidence scores.
*   **Commercial Logic**: Maps detected products to official purchase links using a RAG-grounded shopping module.
*   **Fact-Check Verdicts**: Displays "Supported" or "Contradicted" claims with live evidence citations.
*   **Pedagogical Insights**: Structured step-by-step tutorial extraction for educational content.

### 2. Conversational RAG Engine
The `ChatPanel` is a persistent sidebar that allows users to "Talk to the Video."
*   **Grounding Logic**: Every prompt is injected with the video's transcript, summary, and M.L.I. context before reaching the AI.
*   **Persona Toggles**: Users can switch between "Professional Forensic Analyst," "Concise Investigator," or "Detailed Researcher" styles.

### 3. Automated Forensic Exports (`jsPDF`)
A custom-built reporting engine that generates high-fidelity **PDF Intelligence Reports**.
*   **Logic**: Iterates through the analysis object to build structured cards (Executive Summary, M.L.I. Context, Products, etc.).
*   **Unicode Support**: Handles Hindi and other scripts by rendering them as high-density canvas snapshots to bypass standard PDF font limitations.

## 🧬 Frontend-Backend Data Contract
The interface consumes a structured `AnalysisResponse` and uses a **Hybrid Component Mapping** strategy to ensure compatibility with various AI model variations.

```typescript
// Sample Data Mapping in AnalysisClient.tsx
const result = {
  summary: data.content?.summary || "No summary available.",
  location: data.content?.locationContext,
  shopping: data.content?.shoppingItems,
  factCheck: data.content?.factCheck,
  features: data.availableFeatures // Toggles Visibility
};
```

## ⚙️ Setup & Forensic Configuration

### 1. Environment Requirements
Create a `.env.local` containing your **Firebase Project** and **API Production** details:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="unreel.firebaseapp.com"
NEXT_PUBLIC_API_URL="https://unreel-api.huggingface.co"
```

### 2. Development Workflow
```bash
# Install Modules
npm install

# Start Performance-Optimized Dashboard
npm run dev
```

### 3. Build & Optimization
```bash
# Production Build with Webpack & Next.js optimization
npm run build
```

## 🐋 Deployment (Vercel)
The UnReel Interface is optimized for **Vercel** with full **Next.js 16** feature support.
*   **Static Rendering**: Initial metadata hydration.
*   **Client Interactivity**: Framer Motion & Firebase persistence.
*   **Automatic Cache Invalidation**: Real-time history updates.

## 👨‍💻 Developed By
**Soumyadyuti Dey**
[GitHub](https://github.com/Soumo-git-hub) | [Portfolio](https://soumya.cloud)
