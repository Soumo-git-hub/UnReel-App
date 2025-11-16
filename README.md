# UnReel Project

This repository contains the UnReel project, which consists of two main components:
1. **unreel-api** - The backend API built with FastAPI
2. **unreel-mobile** - The mobile application built with React Native (Expo)

## Project Structure

```
unreel/
├── .env.sample          # Sample environment variables file
├── .gitignore           # Git ignore file
├── unreel-api/          # Backend API (FastAPI)
│   ├── app/             # Main application code
│   ├── tests/           # Test files
│   ├── .env             # Environment variables (not committed)
│   ├── requirements.txt # Python dependencies
│   └── ...              # Other backend files
└── unreel-mobile/       # Mobile application (React Native/Expo)
    ├── src/             # Source code
    ├── App.tsx          # Main application component
    ├── package.json     # Node.js dependencies
    └── ...              # Other mobile app files
```

## Setup Instructions

### Environment Variables

1. Copy the `.env.sample` file to `.env` in the root directory:
   ```bash
   cp .env.sample .env
   ```

2. Update the values in `.env` with your actual configuration:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `DATABASE_URL`: Your PostgreSQL database connection string
   - Other variables as needed

### Backend API Setup

Navigate to the `unreel-api` directory for backend setup:
```bash
cd unreel-api
```

Follow the instructions in `unreel-api/README.md` for detailed setup.

### Mobile App Setup

The mobile application is in the `unreel-mobile` directory. Note that this directory is excluded from version control as specified in the `.gitignore` file.

## Git Configuration

The `.gitignore` file is configured to:
- Exclude the entire `unreel-mobile` directory
- Exclude sensitive files like `.env`
- Exclude build artifacts, cache files, and OS-specific files
- Exclude IDE-specific files and temporary files

## Deployment

For deployment instructions, refer to the individual README files in each component directory.