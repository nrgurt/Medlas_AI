// Gemini AI integration for intelligent medication assistance - Oct 5, 2025
// Processes natural language commands and generates insights - Oct 20, 2025
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config';
import { Senior, Medication, DoseEvent, Insight } from './storage';

let geminiModel: GenerativeModel | null = null;

export function initGemini() {
  if (!GEMINI_API_KEY) {
    return;
  }
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  } catch (error) {
    console.error('Failed to initialize Gemini models:', error);
    geminiModel = null;
  }
}

export async function processAICommand(
  command: string,
  seniors: Senior[]
): Promise<{ response: string; actions?: any[] }> {
  if (!geminiModel) {
    return {
      response: 'AI assistant is currently unavailable. I can still help you with basic medication management tasks.',
    };
  }

  const prompt = `
    You are an AI assistant for a medication management app called Medlas AI. You help caregivers in senior care facilities manage medications safely and effectively.

    Available seniors: ${seniors.map(s => `${s.firstName} ${s.lastName} (ID: ${s.id})`).join(', ')}

    User command: "${command}"

    You can respond in two ways:
    1. For general questions, medication advice, or information requests: Provide a helpful, conversational response about medication management, scheduling, or senior care.
    
    2. For specific action requests (like "add medication X for senior Y"): Respond with JSON in this format:
    {
      "response": "Your confirmation message",
      "action": {
        "type": "add_medication" | "schedule_reminder",
        "data": {
          // For add_medication: seniorId, name, strength, dose, frequency, times, food
          // For schedule_reminder: seniorId, title, time, date
        }
      }
    }

    If you detect an action request, always include the action object. Otherwise, provide a natural conversational response about medication management.

    Be helpful, professional, and focus on medication safety and adherence.
  `;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          response: parsed.response,
          actions: parsed.action && parsed.action.type !== 'none' ? [parsed.action] : undefined,
        };
      }
    } catch (parseError) {
    }

    return { response: text };
  } catch (error) {
    console.error('Error processing AI command:', error);
    return {
      response: 'I\'m having trouble with my AI capabilities right now. You can still add medications manually using the "Add Medication" button or ask me simple questions about medication management.',
    };
  }
}

export async function generateGeminiInsight(
  senior: Senior,
  medications: Medication[],
  doseEvents: DoseEvent[]
): Promise<Insight[]> {
  if (!geminiModel) {
    return [];
  }

  const prompt = `
    You are an AI assistant for a caretaker in a senior care facility. Your goal is to provide helpful insights and suggestions regarding a senior's medication management.
    Analyze the provided senior and medication data and identify any potential issues, risks, or areas for improvement.
    Focus on medication adherence, potential side effects (based on general knowledge, not a medical diagnosis), and overall well-being related to medication.
    Provide insights in a structured JSON array format, where each object has 'severity' (critical, warning, info), 'message', and 'suggestedAction'.
    If no specific insights are found, return an empty array.

    Senior Information:
    ID: ${senior.id}
    Name: ${senior.firstName} ${senior.lastName}
    Age: ${senior.age}
    Allergies: ${senior.allergies.join(', ') || 'None'}
    Conditions: ${senior.conditions.join(', ') || 'None'}
    Primary Physician: ${senior.physician || 'N/A'}

    Medications:
    ${medications.map(med => `
      - Name: ${med.name}
        Strength: ${med.strength}
        Dose: ${med.dose}
        Frequency: ${med.frequency} times daily
        Scheduled Times: ${med.times.join(', ')}
        Food Requirement: ${med.food}
        Notes: ${med.notes || 'None'}
    `).join('\n')}

    Recent Dose Events (last 7 days):
    ${doseEvents.filter(event => new Date(event.recordedTimeISO) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .map(event => `
        - Medication ID: ${event.medicationId}
          Scheduled: ${new Date(event.scheduledTimeISO).toLocaleString()}
          Recorded: ${new Date(event.recordedTimeISO).toLocaleString()}
          Status: ${event.status}
          Note: ${event.note || 'None'}
      `).join('\n') || 'No recent dose events.'}

    Based on this data, generate a JSON array of insights. Example format:
    [
      {
        "severity": "warning",
        "message": "Consider reviewing medication schedule for better adherence.",
        "suggestedAction": "Discuss with senior or family about preferred medication times."
      },
      {
        "severity": "info",
        "message": "Senior is taking multiple medications for chronic conditions.",
        "suggestedAction": "Ensure regular physician reviews for polypharmacy management."
      }
    ]
  `;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]) as Insight[];
      const now = new Date().toISOString();
      return insights.map(insight => ({
        ...insight,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        seniorId: senior.id,
        createdAtISO: now,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error generating Gemini insights:', error);
    return [];
  }
}