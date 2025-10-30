// Dashboard overview with senior stats and quick actions - Sept 28, 2025
// Handles medication due counts and senior list display - Oct 2, 2025
// Used Cursor AI for the stats cards layout and empty state design - Sept 30, 2025
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Plus, ScanLine as Scan, Users, Clock, TriangleAlert as AlertTriangle, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { storageService, Senior } from '@/services/storage';
import { medicationService } from '@/services/medication';

interface DashboardStats {
  dueNow: number;
  dueNext: number;
  missed: number;
}

export default function DashboardScreen() {
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ dueNow: 0, dueNext: 0, missed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const seniorsData = await storageService.getSeniors();
      setSeniors(seniorsData);
      
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      let dueNow = 0;
      let dueNext = 0;
      let missed = 0;
      
      for (const senior of seniorsData) {
        const medications = await storageService.getMedications(senior.id);
        const doseEvents = await storageService.getDoseEvents(senior.id);
        
        for (const med of medications) {
          for (const time of med.times) {
            const [hours, minutes] = time.split(':').map(Number);
            const scheduleTime = new Date();
            scheduleTime.setHours(hours, minutes, 0, 0);
            
            const hasBeenTaken = doseEvents.some(event => 
              event.medicationId === med.id && 
              new Date(event.scheduledTimeISO).toDateString() === scheduleTime.toDateString() &&
              event.status === 'taken'
            );
            
            if (!hasBeenTaken) {
              if (scheduleTime <= now) {
                if (scheduleTime >= yesterday) {
                  missed++;
                } else {
                  dueNow++;
                }
              } else if (scheduleTime <= twoHoursLater) {
                dueNext++;
              }
            }
          }
        }
      }
      
      setStats({ dueNow, dueNext, missed });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    
    const unsubscribe = router.addListener?.('focus', () => {
      loadDashboard();
    });
    
    return unsubscribe;
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const getSeniorStatus = async (senior: Senior) => {
    const medications = await storageService.getMedications(senior.id);
    if (medications.length > 5) {
      return { type: 'warning', text: 'Polypharmacy' };
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your seniors</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/modals/scan-medication')}>
            <Scan size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/modals/add-senior')}>
            <Plus size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardDue]}>
            <Clock size={20} color="#ef4444" />
            <Text style={styles.statNumber}>{stats.dueNow}</Text>
            <Text style={styles.statLabel}>Due now</Text>
          </View>
          
          <View style={[styles.statCard, styles.statCardNext]}>
            <Clock size={20} color="#f59e0b" />
            <Text style={styles.statNumber}>{stats.dueNext}</Text>
            <Text style={styles.statLabel}>Due next</Text>
          </View>
          
          <View style={[styles.statCard, styles.statCardMissed]}>
            <AlertTriangle size={20} color="#6b7280" />
            <Text style={styles.statNumber}>{stats.missed}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        {seniors.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No residents yet</Text>
            <Text style={styles.emptyStateDescription}>Add your first resident to get started with the demo.</Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={() => router.push('/modals/add-senior')}>
              <Text style={styles.emptyStateButtonText}>Add Resident</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.seniorsList}>
            {seniors.map((senior) => (
              <TouchableOpacity
                key={senior.id}
                style={styles.seniorCard}
                onPress={() => router.push(`/senior/${senior.id}`)}
              >
                <View style={styles.seniorInfo}>
                 <View style={styles.profilePicture}>
                   <User size={24} color="#6b7280" />
                 </View>
                 <View style={styles.seniorDetails}>
                   <Text style={styles.seniorName}>{senior.firstName} {senior.lastName}</Text>
                   <Text style={styles.seniorAge}>Age {senior.age}</Text>
                   {senior.allergies.length > 0 && (
                     <Text style={styles.seniorAllergies}>Allergies: {senior.allergies.join(', ')}</Text>
                   )}
                 </View>
                </View>
                <View style={styles.seniorActions}>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardDue: {
    borderColor: '#fecaca',
  },
  statCardNext: {
    borderColor: '#fed7aa',
  },
  statCardMissed: {
    borderColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  emptyStateDescription: {
    fontSize: 17,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  seniorsList: {
    gap: 16,
  },
  seniorCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  seniorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  seniorAge: {
    fontSize: 15,
    color: '#64748b',
  },
  seniorAllergies: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
  },
  seniorActions: {
    marginLeft: 20,
  },
  chevron: {
    fontSize: 24,
    color: '#9ca3af',
  },
});