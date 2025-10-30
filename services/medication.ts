// Medication management logic with conflict detection - Oct 2, 2025
// Calculates adherence rates and generates safety insights - Oct 19, 2025
import { Medication, DoseEvent, storageService } from './storage';
import * as Network from 'expo-network';
import { generateGeminiInsight, initGemini } from './gemini';

interface InteractionRule {
  drug1: string;
  drug2: string;
  severity: 'critical' | 'warning';
  message: string;
}

interface ConflictInfo {
  type: 'food' | 'interaction';
  severity: 'warning' | 'critical';
  message: string;
  medications: string[];
}

class MedicationService {
  private interactionRules: InteractionRule[] = [
    {
      drug1: 'aspirin',
      drug2: 'warfarin',
      severity: 'critical',
      message: 'Aspirin and Warfarin taken together increase bleeding risk. Proceed only if instructed by a clinician.',
    },
    {
      drug1: 'lisinopril',
      drug2: 'potassium',
      severity: 'critical',
      message: 'Lisinopril and Potassium taken together may cause dangerous potassium levels.',
    },
  ];

  generateDefaultTimes(frequency: number): string[] {
    switch (frequency) {
      case 1:
        return ['09:00'];
      case 2:
        return ['09:00', '21:00'];
      case 3:
        return ['09:00', '15:00', '21:00'];
      case 4:
        return ['09:00', '13:00', '17:00', '21:00'];
      default:
        return ['09:00'];
    }
  }

  checkTimeSlotConflicts(medications: Medication[], timeSlot: string): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];
    const medsAtTime = medications.filter(med => 
      med.times.some(time => this.isTimeInSlot(time, timeSlot))
    );

    // Check food rule conflicts
    const withFood = medsAtTime.filter(med => med.food === 'with');
    const withoutFood = medsAtTime.filter(med => med.food === 'without');
    
    if (withFood.length > 0 && withoutFood.length > 0) {
      conflicts.push({
        type: 'food',
        severity: 'warning',
        message: 'Different food rules at the same time. Separate these medications by 30 minutes.',
        medications: [...withFood.map(m => m.name), ...withoutFood.map(m => m.name)],
      });
    }

    // Check drug interactions
    for (let i = 0; i < medsAtTime.length; i++) {
      for (let j = i + 1; j < medsAtTime.length; j++) {
        const interaction = this.findInteraction(medsAtTime[i].name, medsAtTime[j].name);
        if (interaction) {
          conflicts.push({
            type: 'interaction',
            severity: interaction.severity,
            message: interaction.message,
            medications: [medsAtTime[i].name, medsAtTime[j].name],
          });
        }
      }
    }

    return conflicts;
  }

  private isTimeInSlot(time: string, slot: string): boolean {
    const [timeHours, timeMinutes] = time.split(':').map(Number);
    const [slotHours, slotMinutes] = slot.split(':').map(Number);
    
    const timeInMinutes = timeHours * 60 + timeMinutes;
    const slotInMinutes = slotHours * 60 + slotMinutes;
    
    // Consider within 30 minutes as the same slot
    return Math.abs(timeInMinutes - slotInMinutes) <= 30;
  }

  private findInteraction(drug1: string, drug2: string): InteractionRule | null {
    return this.interactionRules.find(rule => 
      (rule.drug1.toLowerCase() === drug1.toLowerCase() && rule.drug2.toLowerCase() === drug2.toLowerCase()) ||
      (rule.drug2.toLowerCase() === drug1.toLowerCase() && rule.drug1.toLowerCase() === drug2.toLowerCase())
    ) || null;
  }

  async calculateAdherence(seniorId: string, days: number = 7): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const medications = await storageService.getMedications(seniorId);
    const doseEvents = await storageService.getDoseEvents(seniorId);
    
    let totalExpectedDoses = 0;
    let takenDoses = 0;

    for (const med of medications) {
      // Calculate expected doses for the period
      const dailyDoses = med.times.length;
      totalExpectedDoses += dailyDoses * days;
      
      // Count taken doses
      const medDoseEvents = doseEvents.filter(event => 
        event.medicationId === med.id &&
        event.status === 'taken' &&
        new Date(event.recordedTimeISO) >= startDate
      );
      
      takenDoses += medDoseEvents.length;
    }

    return totalExpectedDoses > 0 ? (takenDoses / totalExpectedDoses) * 100 : 100;
  }

  async generateInsights(seniorId: string): Promise<void> {
    const medications = await storageService.getMedications(seniorId);
    const insights: any[] = [];

    // Polypharmacy check
    if (medications.length > 5) {
      insights.push({
        seniorId,
        severity: 'info' as const,
        message: 'Polypharmacy: more than 5 active medications',
        suggestedAction: 'Review with physician for possible medication reduction',
      });
    }

    // Adherence check
    const adherence = await this.calculateAdherence(seniorId, 7);
    if (adherence < 80) {
      insights.push({
        seniorId,
        severity: 'warning' as const,
        message: 'Adherence below 80% in the last 7 days',
        suggestedAction: 'Review medication schedule and barriers to adherence',
      });
    }

    // Check for repeated misses at same time
    const doseEvents = await storageService.getDoseEvents(seniorId);
    const missedEvents = doseEvents.filter(event => 
      event.status === 'skipped' || 
      (event.status === 'delayed')
    );

    // Group by time to find patterns
    const missPatterns: { [key: string]: number } = {};
    missedEvents.forEach(event => {
      const time = new Date(event.scheduledTimeISO).getHours();
      missPatterns[time] = (missPatterns[time] || 0) + 1;
    });

    for (const [hour, count] of Object.entries(missPatterns)) {
      if (count >= 3) {
        insights.push({
          seniorId,
          severity: 'info' as const,
          message: `Multiple missed doses at ${hour}:00`,
          suggestedAction: `Consider adjusting medication time from ${hour}:00 to better fit routine`,
        });
      }
    }

    // Generate Gemini insights if online
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected && networkState.isInternetReachable) {
        console.log('Generating Gemini insights...');
        const seniorData = (await storageService.getSeniors()).find(s => s.id === seniorId);
        if (seniorData) {
          const geminiInsights = await generateGeminiInsight(seniorData, medications, doseEvents);
        }
      } else {
        console.log('Device is offline, skipping Gemini insights.');
      }
    } catch (error) {
    }

    // Clear old insights and add new ones
    await storageService.clearInsights(seniorId);
    for (const insight of insights) {
      await storageService.addInsight(insight);
    }
  }

  offsetMedicationTime(time: string, offsetMinutes: number): string {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + offsetMinutes;
    
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }
}

export const medicationService = new MedicationService();