# UnReel Mobile App

This is the mobile frontend for the UnReel application, built with React Native and Expo.

## Project Structure

```
unreel-mobile/
├── components/                 # React components
│   ├── HomeScreen.js           # Main home screen with video input
│   ├── SettingsScreen.js       # Settings screen
│   ├── HistoryScreen.js        # Analysis history screen
│   ├── AnalysisResultScreen.js # Video analysis results
│   └── ChatScreen.js           # Chat interface for video Q&A
├── services/                   # API service layer
│   └── api.js                  # Functions to communicate with backend
├── scripts/                    # Utility scripts
│   ├── test-connectivity.js    # Test backend connectivity
│   ├── test-api.js             # Test API endpoints
│   └── verify-setup.js         # Verify development setup
├── __tests__/                  # Test files
│   ├── App.test.js             # Main app component tests
│   ├── HomeScreen.test.js      # Home screen component tests
│   └── api.test.js             # API service tests
├── App.js                      # Main app component with navigation
├── app.json                    # Expo configuration
├── package.json                # Project dependencies
└── ...                         # Other mobile app files
```

## Features

1. **Video Analysis**: Paste a video URL to analyze its content
2. **AI Chat**: Chat with an AI about analyzed videos
3. **History**: View previously analyzed videos
4. **Settings**: Configure app preferences
5. **Translation**: Translate video transcripts to multiple languages

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on the `.env.example` file (if available) or use the default configuration:
   ```bash
   # API Configuration
   API_BASE_URL=http://localhost:3000/api/v1
   ```

3. For Android emulator, update the `.env` file to use the correct IP:
   ```bash
   # API Configuration for Android Emulator
   API_BASE_URL=http://10.0.2.2:3000/api/v1
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Run on Android:
   ```bash
   npx expo run:android  
   ```

6. Run on iOS:
   ```bash
   npx expo run:ios
   ```

7. Run on Web:
   ```bash
   npx expo run:web
   ```

## Backend Connection

The mobile app connects to the UnReel backend API running on `http://localhost:3000`. Make sure the backend is running before using the mobile app.

## Components

### HomeScreen
The main screen where users can:
- Paste video URLs for analysis
- Use quick suggestion buttons
- Access history and settings

### AnalysisResultScreen
Displays the results of video analysis including:
- Video title and metadata
- Content summary
- Key topics
- Mentioned resources
- Full transcript
- Translation capabilities

### ChatScreen
Interface for chatting with the AI about analyzed videos:
- Real-time messaging
- Context-aware responses
- Message history

### HistoryScreen
View and manage previously analyzed videos:
- List of past analyses
- Quick access to results
- History management

### SettingsScreen
Configure app preferences and settings.

## API Service

The `api.js` file contains functions to communicate with the backend:
- `analyzeVideo(videoUrl)`: Submit a video for analysis
- `chatAboutVideo(analysisId, message)`: Chat about a specific analysis
- `getAnalysisHistory()`: Retrieve analysis history
- `getAnalysisById(analysisId)`: Get a specific analysis by ID
- `translateTranscript(analysisId, targetLanguage)`: Translate a video transcript

## Dependencies

- React Native
- Expo
- React Navigation
- @expo/vector-icons
- @react-native-picker/picker

## Development

To modify the app:
1. Edit components in the `components/` directory
2. Update API calls in `services/api.js`
3. Modify navigation in `App.js`

## Troubleshooting

If you encounter issues:
1. Make sure all dependencies are installed: `npm install`
2. Ensure the backend server is running on port 3000
3. Check that your device/emulator can access `http://localhost:3000`
4. Restart the Metro bundler if needed: `npm start --reset-cache`