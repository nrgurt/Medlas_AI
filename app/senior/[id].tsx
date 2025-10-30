// Individual senior profile with tabbed medication management - Oct 3, 2025
// Includes schedule, medications, history, and AI insights tabs - Oct 18, 2025
// Tab bar design and profile header layout created with Cursor - Oct 4, 2025
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar, Pill, Clock, Lightbulb, Volume2, Type, User } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { storageService, Senior } from '@/services/storage';
import { ScheduleTab } from '@/components/ScheduleTab';
import { MedicationsTab } from '@/components/MedicationsTab';
import { DoseHistoryTab } from '@/components/DoseHistoryTab';
import { AIInsightsTab } from '@/components/AIInsightsTab';
import { ttsService } from '@/services/tts';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TabType = 'schedule' | 'medications' | 'history' | 'insights';

export default function SeniorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [senior, setSenior] = useState<Senior | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [largeText, setLargeText] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSenior();
    loadLargeTextSetting();
  }, [id]);

  const loadSenior = async () => {
    if (!id) return;
    
    try {
      const seniors = await storageService.getSeniors();
      const seniorData = seniors.find(s => s.id === id);
      setSenior(seniorData || null);
    } catch (error) {
      console.error('Failed to load senior:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLargeTextSetting = async () => {
    try {
      const setting = await AsyncStorage.getItem('largeText');
      setLargeText(setting === 'true');
    } catch (error) {
      console.error('Failed to load large text setting:', error);
    }
  };

  const toggleLargeText = async () => {
    const newSetting = !largeText;
    setLargeText(newSetting);
    try {
      await AsyncStorage.setItem('largeText', newSetting.toString());
    } catch (error) {
      console.error('Failed to save large text setting:', error);
    }
  };

  const handleTTS = async () => {
    if (!senior) return;
    
    try {
      const medications = await storageService.getMedications(senior.id);
      const scheduleText = await ttsService.generateScheduleText(medications);
      await ttsService.speak(scheduleText);
    } catch (error) {
      console.error('TTS failed:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading senior profile...</Text>
      </View>
    );
  }

  if (!senior) {
    return (
      <View style={styles.errorContainer}>
        <Text>Senior not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const textScale = largeText ? 1.2 : 1;

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backText, { fontSize: 16 * textScale }]}>‹ Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleTTS}>
            <Volume2 size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={toggleLargeText}>
            <Type size={20} color={largeText ? '#3b82f6' : '#374151'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.seniorInfo}>
        <View style={styles.seniorHeader}>
          <View 
            style={styles.profilePicture}
          >
            <User size={32} color="#6b7280" />
          </View>
          <View style={styles.seniorDetails}>
            <Text style={[styles.seniorName, { fontSize: 24 * textScale }]}>
              {senior.firstName} {senior.lastName}
            </Text>
            <Text style={[styles.seniorAge, { fontSize: 16 * textScale }]}>
              Age {senior.age}
            </Text>
            {senior.allergies.length > 0 && (
              <Text style={[styles.seniorAllergies, { fontSize: 14 * textScale }]}>
                Allergies: {senior.allergies.join(', ')}
              </Text>
            )}
          </View>
        </View>
        {senior.conditions.length > 0 && (
          <Text style={[styles.seniorConditions, { fontSize: 14 * textScale }]}>
            Conditions: {senior.conditions.join(', ')}
          </Text>
        )}
      </View>

      <View style={styles.tabBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
          onPress={() => setActiveTab('schedule')}
        >
          <Calendar size={20} color={activeTab === 'schedule' ? '#3b82f6' : '#6b7280'} />
          <Text style={[
            styles.tabText,
            { fontSize: 14 * textScale },
            activeTab === 'schedule' && styles.activeTabText
          ]}>
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'medications' && styles.activeTab]}
          onPress={() => setActiveTab('medications')}
        >
          <Pill size={20} color={activeTab === 'medications' ? '#3b82f6' : '#6b7280'} />
          <Text style={[
            styles.tabText,
            { fontSize: 14 * textScale },
            activeTab === 'medications' && styles.activeTabText
          ]}>
            Medications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Clock size={20} color={activeTab === 'history' ? '#3b82f6' : '#6b7280'} />
          <Text style={[
            styles.tabText,
            { fontSize: 14 * textScale },
            activeTab === 'history' && styles.activeTabText
          ]}>
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => setActiveTab('insights')}
        >
          <Lightbulb size={20} color={activeTab === 'insights' ? '#3b82f6' : '#6b7280'} />
          <Text style={[
            styles.tabText,
            { fontSize: 14 * textScale },
            activeTab === 'insights' && styles.activeTabText
          ]}>
            Insights
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
          onPress={() => setActiveTab('notes')}
        >
          <FileText size={20} color={activeTab === 'notes' ? '#3b82f6' : '#6b7280'} />
          <Text style={[
            styles.tabText,
            { fontSize: 14 * textScale },
            activeTab === 'notes' && styles.activeTabText
          ]}>
            Notes
          </Text>
        </TouchableOpacity>
        </View>
        </ScrollView>
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'schedule' && <ScheduleTab seniorId={senior.id} largeText={largeText} />}
        {activeTab === 'medications' && <MedicationsTab seniorId={senior.id} largeText={largeText} />}
        {activeTab === 'history' && <DoseHistoryTab seniorId={senior.id} largeText={largeText} />}
        {activeTab === 'insights' && <AIInsightsTab seniorId={senior.id} largeText={largeText} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 60,
    backgroundColor: '#ffffff',
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: '#3b82f6',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seniorInfo: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  seniorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  seniorDetails: {
    flex: 1,
    gap: 4,
  },
  seniorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seniorAge: {
    fontSize: 16,
    color: '#64748b',
  },
  seniorAllergies: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  seniorConditions: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  tabBarContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    minWidth: 80,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
});