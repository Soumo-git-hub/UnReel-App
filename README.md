# UnReel

**AI-Powered Video Content Analysis Platform**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Copyright © 2025 Soumyadyuti Dey** - This project is intended for educational and demonstration purposes only. Please respect copyright laws and platform terms of service when using this application. **Commercial use is strictly prohibited** without explicit written authorization.
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/downloads/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-43853D.svg?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.72+-20232A.svg?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev/)

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technical Stack](#technical-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

UnReel is a sophisticated AI-powered platform designed to analyze video content from various sources including YouTube, Instagram, TikTok, and more. The platform extracts key insights, generates comprehensive summaries, identifies key topics, and provides multilingual translation capabilities.

> **Commercial Use Prohibited**: This application is for educational and demonstration purposes only. Any commercial use is strictly prohibited without explicit written authorization from the copyright holder.

## Screenshots

<div align="center">

### Home Page
<img src="images/Home Page.jpeg" alt="Home Page" width="250" style="display: inline-block; margin: 10px;"/>

*Main interface for entering video URLs and initiating analysis*

### Analysis Page
<img src="images/Analysis Page.jpeg" alt="Analysis Page" width="250" style="display: inline-block; margin: 10px;"/>

*Detailed analysis results including summary, key topics, and resources*

### Chat Page
<img src="images/Chat Page.jpeg" alt="Chat Page" width="250" style="display: inline-block; margin: 10px;"/>

*Interactive chat interface for asking questions about the analyzed video*

</div>

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        UnReel Platform                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React Native/Expo)      Backend (FastAPI)            │
│  ┌─────────────────────────┐       ┌─────────────────────────┐  │
│  │ Mobile Application      │       │ API Services            │  │
│  │ • Video URL Input       │       │ • Analysis Service      │  │
│  │ • Results Display       │       │ • Media Processing      │  │
│  │ • Chat Interface        │       │ • AI Service            │  │
│  │ • Settings              │       │ • Translation Service   │  │
│  └─────────────────────────┘       └─────────────────────────┘  │
│                              │                                  │
│  ┌─────────────────────────┐       ┌─────────────────────────┐  │
│  │ Third-party APIs        │       │ External Services       │  │
│  │ • YouTube API           │       │ • Google Gemini AI      │  │
│  │ • Instagram API         │       │ • PostgreSQL DB         │  │
│  │ • TikTok API            │       │ • Adminer (Admin UI)    │  │
│  └─────────────────────────┘       └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Stack

### Backend

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - High-performance web framework with automatic API documentation
- **Language**: Python 3.10+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **AI/ML**: Google Gemini AI for content analysis
- **Media Processing**: yt-dlp for video extraction, FFmpeg for audio processing
- **API Documentation**: Automatic OpenAPI/Swagger documentation
- **Authentication**: JWT-based authentication
- **Environment**: Docker & Docker Compose for containerization

### Frontend

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **State Management**: React Context API
- **UI Components**: Native components with custom styling
- **Navigation**: React Navigation
- **HTTP Client**: Axios for API communication
- **Platform Support**: Android and iOS

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL with Adminer for database management
- **API Gateway**: Built-in FastAPI routing
- **Caching**: In-memory caching for performance
- **Monitoring**: Structured logging and error handling

## Features

### Core Features

| Feature | Description |
|--------|-------------|
| **Multi-Platform Video Analysis** | Supports YouTube, Instagram, TikTok, and other video platforms |
| **AI-Powered Content Analysis** | Comprehensive video analysis using Google Gemini |
| **Multilingual Support** | Automatic language detection and translation |
| **Real-time Chat Interface** | Interactive Q&A with analyzed video content |
| **Video Analysis** | Frame capture and visual content analysis from video |
| **Audio Analysis** | Audio extraction and speech-to-text transcription |
| **Media Processing** | Audio extraction, frame capture, and metadata extraction |
| **Comprehensive Summaries** | Detailed video summaries in English |
| **Key Topic Identification** | Automatic identification of key topics |
| **Resource Extraction** | Detection of mentioned products, locations, and resources |

### Technical Features

| Feature | Description |
|--------|-------------|
| **RESTful API** | Clean, documented REST API with automatic validation |
| **Type Safety** | Strict typing throughout the codebase |
| **Error Handling** | Comprehensive error handling with fallback mechanisms |
| **Asynchronous Processing** | Non-blocking operations for better performance |
| **Scalable Architecture** | Modular design for easy scaling |
| **Comprehensive Testing** | Unit tests, integration tests, and end-to-end tests |
| **Docker Support** | Containerized deployment for consistency |

## Project Structure

```
unreel/
├── unreel-api/                 # Backend API service
│   ├── app/
│   │   ├── core/              # Core configurations
│   │   ├── routers/           # API route definitions
│   │   ├── services/          # Business logic services
│   │   │   ├── ai_service.py  # AI analysis service
│   │   │   ├── media_service.py # Media processing service
│   │   │   ├── analysis_service.py # Analysis orchestration
│   │   │   ├── translation_service.py # Translation service
│   │   │   └── speech_service.py # Speech processing service
│   │   ├── database.py        # Database configuration
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   └── main.py            # Application entry point
│   ├── tests/                 # Backend test suite
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Backend Docker configuration
│   ├── docker-compose.yml     # Docker orchestration
│   ├── run.py                 # Application runner
│   └── README.md              # Backend documentation
├── unreel-mobile/              # Mobile application
│   ├── components/            # React Native components
│   │   ├── HomeScreen.js      # Main input screen
│   │   ├── AnalysisResultScreen.js # Results display
│   │   ├── ChatScreen.js      # Interactive chat
│   │   ├── HistoryScreen.js   # Analysis history
│   │   └── SettingsScreen.js  # App settings
│   ├── services/              # API service layer
│   │   └── api.js             # API client
│   ├── App.js                 # Main application component
│   ├── app.json               # Expo configuration
│   ├── package.json           # Node.js dependencies
│   └── README.md              # Mobile documentation
├── .env.sample               # Sample environment variables
├── .gitignore                # Git ignore configuration
└── README.md                 # Project documentation
```

## Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **Docker** and **Docker Compose** (optional, for containerized deployment)
- **FFmpeg** (for media processing)
- **Git** (for version control)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd UnReel
   ```

2. **Setup environment variables**:
   ```bash
   # Copy the sample environment file
   cp .env.sample .env
   ```

3. **Configure environment variables** (see [Environment Variables](#environment-variables) section)

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd unreel-api
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv unreel-env
   source unreel-env/bin/activate  # On Windows: unreel-env\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the backend service**:
   ```bash
   python run.py
   ```

### Frontend Setup

1. **Navigate to the mobile directory**:
   ```bash
   cd unreel-mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # Or if using yarn
   yarn install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

### Docker Setup (Alternative)

1. **Navigate to the backend directory**:
   ```bash
   cd unreel-api
   ```

2. **Start all services with Docker**:
   ```bash
   docker-compose up --build
   ```

## API Endpoints

### Analysis Service

- `POST /api/v1/analyze/` - Analyze a video URL
- `GET /api/v1/analyze/{analysis_id}` - Get analysis results
- `POST /api/v1/chat/` - Chat with the AI about a video

### Response Format

```json
{
  "analysisId": "string",
  "originalUrl": "string",
  "status": "string",
  "metadata": {
    "title": "string",
    "uploader": "string",
    "caption": "string"
  },
  "content": {
    "summary": "string",
    "translation": "string",
    "keyTopics": ["string"],
    "mentionedResources": [
      {
        "type": "string",
        "name": "string"
      }
    ]
  },
  "fullTranscript": "string",
  "detectedLanguage": "string",
  "supportedLanguages": {
    "language_code": "Language Name"
  },
  "createdAt": "timestamp"
}
```

## Environment Variables

Create a `.env` file in the `unreel-api` directory with the following variables:

```env
# API Configuration
GEMINI_API_KEY=your_google_gemini_api_key
DATABASE_URL=postgresql://username:password@localhost:5432/unreel

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=3000
SERVER_NAME=UnReel API
SERVER_LOG_LEVEL=info

# Database Configuration
DB_ECHO=false
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=30

# AI Service Configuration
GEMINI_MODEL=gemini-flash-latest

# Media Processing
FFMPEG_PATH=/usr/bin/ffmpeg
YT_DLP_PATH=/usr/local/bin/yt-dlp

# CORS Configuration
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:19006

# Security
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Development Workflow

### Backend Development

1. **Run the development server**:
   ```bash
   python run.py
   ```

2. **Access API documentation** at `http://localhost:3000/docs`

3. **Run tests**:
   ```bash
   python -m pytest
   ```

### Frontend Development

1. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

2. **Use Expo Go app to scan QR code** or run on emulator

3. **For Android emulator**, the API endpoint is configured to `http://10.0.2.2:3000`

### Testing

#### Backend Tests

Run the complete test suite:

```bash
# Navigate to backend directory
cd unreel-api

# Run all tests
python tests/run_all_tests.py

# Or run individual test files
python tests/test_full_analysis.py
python tests/test_api.py
python tests/test_media_service.py
```

#### Test Coverage

- **API Tests**: End-to-end API functionality
- **Service Tests**: Individual service functionality
- **Integration Tests**: Full analysis workflow
- **Unit Tests**: Individual function testing

## Deployment

### Production Deployment

1. **Build Docker images**:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Start production services**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment-Specific Deployments

- **Development**: Use `docker-compose.dev.yml`
- **Staging**: Use `docker-compose.staging.yml`
- **Production**: Use `docker-compose.prod.yml`

## Troubleshooting

### Common Issues

1. **FFmpeg Not Found**:
   - Ensure FFmpeg is installed and in your system PATH
   - On Windows, restart your terminal after installing FFmpeg

2. **Database Connection Issues**:
   - Verify PostgreSQL is running
   - Check database credentials in `.env` file

3. **API Key Issues**:
   - Ensure GEMINI_API_KEY is correctly set
   - Verify API key has proper permissions

4. **Mobile App Connection Issues**:
   - For Android emulator: Use `http://10.0.2.2:3000`
   - For physical devices: Use your machine's IP address

### API Documentation

Access comprehensive API documentation at `http://localhost:3000/docs` when the backend is running.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Important Legal Considerations

> **Disclaimer**: This application is intended for educational and demonstration purposes only. Users must comply with all applicable copyright laws, platform terms of service, and fair use principles when using this software.
> 
> **YouTube, Instagram, TikTok, and other platform content** used with this application remains the property of their respective owners. This tool does not grant any rights to the video content itself.
> 
> **Commercial Use**: Any commercial use of this software or the content processed by it requires explicit permission from content owners and may require additional licensing.
> 
> **Respect Platform APIs**: Users are responsible for complying with rate limits and terms of service of all third-party APIs used by this application (YouTube, Instagram, etc.).