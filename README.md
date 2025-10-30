# Medlas AI

A professional medication management system for senior care facilities, built with React Native and Expo. Streamline medication schedules, track adherence, and ensure safety with AI-powered insights.

## Features

### 📋 Medication Management
- Add and manage medications with detailed scheduling
- Automatic time slot generation based on frequency
- Food requirement tracking (with/without food)
- Prescriber and special instruction notes

### 🕐 Smart Scheduling
- Daily medication schedules with time-based organization
- Conflict detection for drug interactions and food requirements
- Automatic offset suggestions for scheduling conflicts
- Visual status indicators for dose completion

### 📊 Adherence Tracking
- Real-time dose recording (taken/skipped/delayed)
- 7-day adherence rate calculations
- Historical dose tracking with filtering
- Pattern recognition for missed doses

### 🤖 AI-Powered Insights
- Gemini AI integration for medication analysis
- Polypharmacy detection and warnings
- Personalized adherence recommendations
- Safety alerts and suggested actions

### 👥 Senior Management
- Individual resident profiles with health information
- Allergy and condition tracking
- Multiple view modes (month/week/day calendar)
- Text-to-speech for medication schedules

### 📱 Modern Interface
- Clean, accessible design optimized for caregivers
- Large text mode for better readability
- Intuitive navigation with tab-based layout
- Real-time updates and notifications

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Storage**: AsyncStorage for local data persistence
- **AI**: Google Gemini API for intelligent insights
- **Icons**: Lucide React Native
- **Camera**: Expo Camera for medication scanning
- **Audio**: Text-to-speech for accessibility

## Getting Started

### Prerequisites
- Node.js 18+ 
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/medlas-ai.git
cd medlas-ai
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Add your Gemini API key to config.ts
export const GEMINI_API_KEY = 'your-api-key-here';
```

4. Start the development server
```bash
npm run dev
```

## Usage

### Demo Credentials
- Username: `demo`
- Password: `demo`

### Adding Residents
1. Navigate to the dashboard
2. Tap the "+" button to add a new senior
3. Fill in personal information, allergies, and conditions

### Managing Medications
1. Select a resident from the dashboard
2. Go to the "Medications" tab
3. Add medications with dosage, frequency, and timing
4. The system will automatically generate schedules

### Recording Doses
1. Use the "Schedule" tab to view daily medications
2. Tap "Record" next to each medication
3. Select taken/skipped/delayed status
4. View adherence patterns in the "Insights" tab

### AI Assistant
1. Navigate to the "AI Agent" tab
2. Ask questions about medications or schedules
3. Get personalized recommendations and insights
4. Execute suggested actions directly from chat

## Project Structure

```
├── app/                    # Main application screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── modals/            # Modal screens
│   └── senior/            # Individual senior profiles
├── components/            # Reusable UI components
├── services/              # Business logic and API services
│   ├── storage.ts         # Data persistence layer
│   ├── medication.ts      # Medication management logic
│   ├── gemini.ts          # AI integration
│   └── tts.ts             # Text-to-speech service
└── hooks/                 # Custom React hooks
```

## Development Timeline

- **September 25, 2025**: Initial project setup and authentication
- **September 30, 2025**: Senior management and medication forms
- **October 5, 2025**: AI integration and scheduling logic
- **October 12, 2025**: Calendar views and dose tracking
- **October 20, 2025**: Final polish and accessibility features

## API Integration

### Gemini AI
The application integrates with Google's Gemini AI for:
- Medication interaction analysis
- Adherence pattern recognition
- Personalized care recommendations
- Natural language medication queries

### Configuration
```typescript
// config.ts
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- UI design assistance provided by Cursor AI
- Icons by Lucide
- Built with Expo and React Native
- Powered by Google Gemini AI
- README generated using ChatGPT

## Support

For support and questions, please open an issue on GitHub or contact the development team.

---

**Medlas AI** - Making medication management safer and more efficient for senior care facilities.
**Note**: This is the final uploaded version, cloned from a different private repository.