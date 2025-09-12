# YouTube Transcript App

A React Native mobile application built with Expo that extracts transcripts from YouTube videos and provides AI-powered analysis including summarization, keyword extraction, and suggested actions.

## Features

- **Transcript Extraction**: Automatically fetch transcripts from any YouTube video by providing its URL
- **AI-Powered Analysis**: Generate comprehensive summaries using advanced AI algorithms
- **Smart Keyword Detection**: Extract key topics and themes from video content
- **Actionable Insights**: Get suggested next steps based on video content
- **Cross-Platform**: Runs on iOS, Android, and Web
- **Error Handling**: Robust error handling for invalid URLs and API failures
- **Loading States**: Smooth user experience with loading indicators
- **Copy-Friendly**: Transcript text is selectable for easy copying

## Technologies Used

- **React Native** - Cross-platform mobile development framework
- **Expo** - React Native platform for rapid development and deployment
- **TypeScript** - Type-safe JavaScript development
- **Axios** - Promise-based HTTP client for API requests
- **React Hooks** - Modern React state management

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **Expo CLI** - Install globally with `npm install -g @expo/cli`
- **Expo Go** app on your mobile device (for testing)

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd YouTubeTranscriptApp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

## Usage

1. **Launch the app** using Expo Go on your device or in a web browser
2. **Enter a YouTube URL** in the input field (e.g., `https://www.youtube.com/watch?v=VIDEO_ID`)
3. **Tap "Get Transcript & Summary"** to process the video
4. **View the results**:
   - Video transcript
   - AI-generated summary
   - Extracted keywords
   - Suggested actions

## API Integration

The app integrates with two main APIs:

- **Transcript Service**: `https://yt.alanbouo.com/transcript`
  - Extracts transcript content from YouTube videos
- **Analysis Service**: `https://yt-summary.alanbouo.com/`
  - Performs AI analysis (summarization, keyword extraction, action suggestions)

## Available Scripts

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator/device
npm run android

# Run in web browser
npm run web
```

## Development

### Project Structure

```
/Users/boubou/albou/2025/YouTubeTranscriptApp/
├── App.tsx                 # Main application component
├── app.json                # Expo configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── expo/
│   └── AppEntry.js         # Expo entry point
├── assets/                 # Static assets (currently empty)
└── components/             # Reusable components (currently empty)
```

### Key Components

- **App Component**: Main container with state management and API calls
- **Transcript Processing**: Handles URL validation and video ID extraction
- **Results Display**: Organized sections for transcript, summary, keywords, and actions

### Error Handling

The app includes comprehensive error handling for:
- Invalid YouTube URLs
- Network/API failures
- Missing or incomplete responses
- User input validation

## Building for Production

1. **Configure the app** in `app.json` (update icons, splash screens, app names)

2. **Build for platforms**:
   ```bash
   # Build for Android APK
   expo build:android

   # Build for iOS .ipa
   expo build:ios
   ```

3. **Publish** using Expo Application Services:
   ```bash
   expo publish
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Privacy & Security

This app:
- Does not collect user data
- Processes video content through external APIs
- All data transmission is encrypted
- No persistent data storage

## License

This project is proprietary software. All rights reserved.

## Contact

For questions or support, please open an issue in the repository.

---

**App Preview:**
- Clean, intuitive interface
- Scrollable content layout
- Real-time loading indicators
- Detailed error messages
- Selectable transcript text for copying

The app provides a seamless experience for transforming YouTube videos into actionable knowledge through automated transcription and intelligent analysis.
