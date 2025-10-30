# Deployment Guide for Medlas AI

## Prerequisites

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **Expo CLI** - Install globally: `npm install -g @expo/cli`
3. **Google Gemini API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd medlas-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Gemini API key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Building for Production

### Web Build
```bash
npm run build:web
```

### Mobile Build (requires Expo account)
```bash
# iOS
expo build:ios

# Android
expo build:android
```

## Deployment Options

### 1. Netlify (Web)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build:web`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### 2. Vercel (Web)
1. Connect your GitHub repository to Vercel
2. Framework preset: Other
3. Build command: `npm run build:web`
4. Output directory: `dist`
5. Add environment variables in Vercel dashboard

### 3. Expo Application Services (Mobile)
1. Create Expo account at [expo.dev](https://expo.dev)
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`
4. Configure: `eas build:configure`
5. Build: `eas build --platform all`

## Environment Variables

Required environment variables:
- `EXPO_PUBLIC_GEMINI_API_KEY` - Your Google Gemini API key

## Demo Credentials

For testing purposes, the app includes demo credentials:
- Username: `demo`
- Password: `demo`

## Features Included

- ✅ Senior resident management
- ✅ Medication scheduling and tracking
- ✅ AI-powered insights with Gemini
- ✅ Dose recording and adherence tracking
- ✅ Calendar views (month/week/day)
- ✅ Text-to-speech for schedules
- ✅ Camera simulation for medication scanning
- ✅ Offline functionality with local storage
- ✅ Responsive design for all screen sizes

## Support

For issues or questions, please create an issue in the repository or contact the development team.