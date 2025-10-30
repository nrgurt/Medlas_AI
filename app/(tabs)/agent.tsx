// AI chatbot interface using Gemini for medication assistance - Oct 5, 2025
// Processes user commands and executes medication-related actions - Oct 8, 2025
// Cursor helped design the chat bubble styling and modal layouts - Oct 6, 2025
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Bot, Send, Calendar, Pill, User, Lightbulb, Clock, Plus, CircleCheck as CheckCircle, TrendingUp, TriangleAlert as AlertTriangle, Info, Camera, X, FlashlightOff as FlashOff, Zap as FlashOn } from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { storageService, Senior } from '@/services/storage';
import { processAICommand } from '@/services/gemini';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function AgentScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const seniorsData = await storageService.getSeniors();
      setSeniors(seniorsData);
      
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'agent',
        content: `Hello! I'm your AI medication assistant. I can help you with:\n\n• Medication scheduling and reminders\n• Drug interaction warnings\n• Adherence insights and recommendations\n• Calendar management\n• Senior care optimization\n\nHow can I assist you today?`,
        timestamp: new Date(),
        suggestions: [
          'Show me today\'s medication schedule',
          'Check for drug interactions',
          'Analyze adherence patterns',
          'Optimize medication timing',
        ],
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputText(prompt);
    handleSendMessage(prompt);
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputText.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await processAICommand(text, seniors);
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: response.response,
        timestamp: new Date(),
        suggestions: [
          'Add another medication',
          'Show today\'s schedule',
          'Check interactions',
          'Schedule medication review',
        ],
      };

      setMessages(prev => [...prev, agentMessage]);

      if (response.actions && response.actions.length > 0) {
        setPendingAction(response.actions[0]);
        setShowActionModal(true);
      }
    } catch (error) {
      console.error('Failed to process message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: 'I apologize, but I encountered an error processing your request. Please try again or check your internet connection.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action: any) => {
    try {
      if (action.type === 'add_medication') {
        const { seniorId, name, strength, dose, frequency, times, food } = action.data;
        
        await storageService.addMedication({
          seniorId,
          name,
          strength,
          dose,
          frequency: parseInt(frequency) || 1,
          times: times || ['09:00'],
          food: food || 'none',
        });

        Alert.alert('Success', `Added ${name} to the medication schedule!`);
        
        const confirmMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'agent',
          content: `✅ Successfully added ${name} ${strength} to the schedule!`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, confirmMessage]);
        
      } else if (action.type === 'schedule_reminder') {
        Alert.alert('Reminder Scheduled', `Reminder "${action.data.title}" has been scheduled.`);
        
        const confirmMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'agent',
          content: `✅ Scheduled reminder: ${action.data.title}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, confirmMessage]);
      }
    } catch (error) {
      console.error('Failed to execute action:', error);
      Alert.alert('Error', 'Failed to execute the requested action.');
    }
    
    setShowActionModal(false);
    setPendingAction(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((message) => (
          <View key={message.id} style={[
            styles.messageWrapper,
            message.type === 'user' ? styles.userMessageWrapper : styles.agentMessageWrapper
          ]}>
            <View style={[
              styles.message,
              message.type === 'user' ? styles.userMessage : styles.agentMessage
            ]}>
              <Text style={[
                styles.messageText,
                message.type === 'user' ? styles.userMessageText : styles.agentMessageText
              ]}>
                {message.content}
              </Text>
              
              {message.suggestions && (
                <View style={styles.suggestions}>
                  {message.suggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionButton}
                      onPress={() => handleQuickAction(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            <Text style={styles.messageTime}>
              {message.timestamp.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        ))}
        
        {loading && (
          <View style={styles.loadingMessage}>
            <Bot size={20} color="#3b82f6" />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about medications, schedules, or get insights..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || loading}
        >
          <Send size={20} color={(!inputText.trim() || loading) ? '#9ca3af' : '#ffffff'} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CheckCircle size={24} color="#10b981" />
              <Text style={styles.modalTitle}>Confirm Action</Text>
            </View>
            
            {pendingAction && (
              <View style={styles.modalBody}>
                <Text style={styles.modalDescription}>
                  {pendingAction.type === 'add_medication' 
                    ? `Add ${pendingAction.data.name} ${pendingAction.data.strength} to the schedule?`
                    : `Schedule reminder: ${pendingAction.data.title}?`
                  }
                </Text>
                
                {pendingAction.type === 'add_medication' && (
                  <View style={styles.medicationDetails}>
                    <Text style={styles.detailText}>Dose: {pendingAction.data.dose}</Text>
                    <Text style={styles.detailText}>Frequency: {pendingAction.data.frequency}x daily</Text>
                    <Text style={styles.detailText}>Times: {pendingAction.data.times?.join(', ') || '09:00'}</Text>
                  </View>
                )}
              </View>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowActionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => executeAction(pendingAction)}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  messageWrapper: {
    marginBottom: 20,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  agentMessageWrapper: {
    alignItems: 'flex-start',
  },
  message: {
    maxWidth: '85%',
    padding: 20,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 6,
  },
  agentMessage: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderBottomLeftRadius: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  messageText: {
    fontSize: 17,
    lineHeight: 24,
  },
  userMessageText: {
    color: '#ffffff',
  },
  agentMessageText: {
    color: '#1e293b',
  },
  suggestions: {
    marginTop: 16,
    gap: 12,
  },
  suggestionButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    fontSize: 15,
    color: '#374151',
  },
  messageTime: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 6,
  },
  loadingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 15,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 17,
    maxHeight: 120,
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 420,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalBody: {
    marginBottom: 32,
  },
  modalDescription: {
    fontSize: 17,
    color: '#374151',
    marginBottom: 20,
    lineHeight: 24,
  },
  medicationDetails: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    gap: 6,
  },
  detailText: {
    fontSize: 15,
    color: '#6b7280',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
});