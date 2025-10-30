// Text-to-speech service for medication schedule announcements - Sept 29, 2025
// Converts medication schedules to spoken audio for accessibility - Oct 8, 2025
import { Medication } from './storage';

class TTSService {
  async speak(text: string): Promise<void> {
    // For web, we can use the Speech Synthesis API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback for mobile - in a real app you'd use expo-speech
      console.log('TTS:', text);
    }
  }

  async generateScheduleText(medications: Medication[]): Promise<string> {
    if (medications.length === 0) {
      return 'No medications scheduled for today.';
    }

    // Group medications by time
    const timeGroups: { [key: string]: Medication[] } = {};
    
    medications.forEach(med => {
      med.times.forEach(time => {
        if (!timeGroups[time]) {
          timeGroups[time] = [];
        }
        timeGroups[time].push(med);
      });
    });

    // Sort times
    const sortedTimes = Object.keys(timeGroups).sort();
    
    let scheduleText = "Today's medication schedule: ";
    
    sortedTimes.forEach((time, index) => {
      const [hours, minutes] = time.split(':');
      const timeStr = `${hours}:${minutes}`;
      const meds = timeGroups[time];
      
      if (index > 0) scheduleText += '. ';
      
      scheduleText += `At ${timeStr}: `;
      
      meds.forEach((med, medIndex) => {
        if (medIndex > 0) scheduleText += ', ';
        
        scheduleText += `${med.dose} of ${med.name}`;
        
        if (med.food === 'with') {
          scheduleText += ' with food';
        } else if (med.food === 'without') {
          scheduleText += ' without food';
        }
      });
    });

    return scheduleText + '.';
  }
}

export const ttsService = new TTSService();