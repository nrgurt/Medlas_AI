// AsyncStorage wrapper for local data persistence - Sept 26, 2025
// Manages seniors, medications, dose events, and insights data - Oct 13, 2025
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Senior {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  allergies: string[];
  conditions: string[];
  physician?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  seniorId: string;
  name: string;
  strength: string;
  dose: string;
  frequency: number;
  times: string[];
  food: 'with' | 'without' | 'none';
  prescriber?: string;
  notes?: string;
  createdAt: string;
}

export interface DoseEvent {
  id: string;
  seniorId: string;
  medicationId: string;
  scheduledTimeISO: string;
  recordedTimeISO: string;
  status: 'taken' | 'skipped' | 'delayed';
  note?: string;
}

export interface Insight {
  id: string;
  seniorId: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  evidenceIds?: string[];
  suggestedAction?: string;
  createdAtISO: string;
}

class StorageService {
  private async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return defaultValue;
    }
  }

  private async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
      throw new Error(`Could not save ${key}. Try again.`);
    }
  }

  // Seniors
  async getSeniors(): Promise<Senior[]> {
  }

  async addSenior(senior: Omit<Senior, 'id' | 'createdAt'>): Promise<Senior> {
    const seniors = await this.getSeniors();
    const newSenior: Senior = {
      ...senior,
      id: `senior_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    seniors.push(newSenior);
    await this.setItem('seniors', seniors);
    console.log('Added senior:', newSenior.firstName, newSenior.lastName);
    return newSenior;

  async updateSenior(id: string, updates: Partial<Senior>): Promise<void> {
    const seniors = await this.getSeniors();
    const index = seniors.findIndex(s => s.id === id);
    if (index !== -1) {
      seniors[index] = { ...seniors[index], ...updates };
      await this.setItem('seniors', seniors);
    }
  }

  async deleteSenior(id: string): Promise<void> {
    const seniors = await this.getSeniors();
    const filtered = seniors.filter(s => s.id !== id);
    await this.setItem('seniors', filtered);
    
    // Clean up related data
    const medications = await this.getMedications(id);
      await this.deleteMedication(med.id);
    }
  }

  // Medications
  async getMedications(seniorId?: string): Promise<Medication[]> {
    return seniorId ? medications.filter(m => m.seniorId === seniorId) : medications;
  }

  async addMedication(medication: Omit<Medication, 'id' | 'createdAt'>): Promise<Medication> {
    const medications = await this.getMedications();
    const newMedication: Medication = {
      ...medication,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    medications.push(newMedication);
    await this.setItem('medications', medications);
    return newMedication;
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<void> {
    const medications = await this.getMedications();
    const index = medications.findIndex(m => m.id === id);
    if (index !== -1) {
      medications[index] = { ...medications[index], ...updates };
      await this.setItem('medications', medications);
    }
  }

  async deleteMedication(id: string): Promise<void> {
    const medications = await this.getMedications();
    const filtered = medications.filter(m => m.id !== id);
    await this.setItem('medications', filtered);
    
    // Clean up dose events
    const doseEvents = await this.getDoseEvents();
    await this.setItem('doseEvents', filteredEvents);
  }

  // Dose Events
  async getDoseEvents(seniorId?: string): Promise<DoseEvent[]> {
    return seniorId ? events.filter(e => e.seniorId === seniorId) : events;
  }

  async addDoseEvent(event: Omit<DoseEvent, 'id'>): Promise<DoseEvent> {
    const events = await this.getDoseEvents();
    const newEvent: DoseEvent = {
      ...event,
      id: Date.now().toString(),
    };
    events.push(newEvent);
    await this.setItem('doseEvents', events);
    return newEvent;
  }

  // Insights
  async getInsights(seniorId?: string): Promise<Insight[]> {
    return seniorId ? insights.filter(i => i.seniorId === seniorId) : insights;
  }

  async addInsight(insight: Omit<Insight, 'id' | 'createdAtISO'>): Promise<Insight> {
    const insights = await this.getInsights();
    const newInsight: Insight = {
      ...insight,
      id: Date.now().toString(),
      createdAtISO: new Date().toISOString(),
    };
    insights.push(newInsight);
    await this.setItem('insights', insights);
    return newInsight;
  }

  async clearInsights(seniorId: string): Promise<void> {
    const insights = await this.getInsights();
    const filtered = insights.filter(i => i.seniorId !== seniorId);
    await this.setItem('insights', filtered);
  }

  // Doctor Notes
}

export const storageService = new StorageService();