// Daily medication schedule with dose recording functionality - Oct 4, 2025
// Shows time slots, conflicts, and allows marking doses as taken/skipped - Oct 11, 2025
// Time slot cards and conflict banner styling designed with Cursor AI - Oct 5, 2025
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Clock, Utensils, TriangleAlert as AlertTriangle, ChevronDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { storageService, Medication } from '@/services/storage';
import { medicationService } from '@/services/medication';

interface ScheduleTabProps {
  seniorId: string;
  largeText: boolean;
}

interface TimeSlot {
  time: string;
  medications: Medication[];
  conflicts: any[];
}

interface DoseActionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: 'taken' | 'skipped' | 'delayed') => void;
  medicationName: string;
}

function DoseActionModal({ visible, onClose, onSelect, medicationName }: DoseActionModalProps) {
  const actions = [
    { label: 'Taken', value: 'taken' as const, color: '#10b981' },
    { label: 'Skipped', value: 'skipped' as const, color: '#6b7280' },
    { label: 'Delayed', value: 'delayed' as const, color: '#f59e0b' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Record dose for {medicationName}</Text>
          
          <View style={styles.actionOptions}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.value}
                style={[styles.actionOption, { borderLeftColor: action.color }]}
                onPress={() => {
                  onSelect(action.value);
                  onClose();
                }}
              >
                <View style={[styles.actionDot, { backgroundColor: action.color }]} />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export function ScheduleTab({ seniorId, largeText }: ScheduleTabProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedication, setSelectedMedication] = useState<{ medication: Medication; time: string } | null>(null);

  const textScale = largeText ? 1.2 : 1;

  useEffect(() => {
    loadSchedule();
  }, [seniorId]);

  const loadSchedule = async () => {
    try {
      const medications = await storageService.getMedications(seniorId);
      
      // Group medications by time slots
      const timeMap: { [key: string]: Medication[] } = {};
      
      medications.forEach(med => {
        med.times.forEach(time => {
          if (!timeMap[time]) {
            timeMap[time] = [];
          }
          timeMap[time].push(med);
        });
      });

      // Create time slots with conflicts
      const slots: TimeSlot[] = Object.entries(timeMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([time, meds]) => ({
          time,
          medications: meds,
          conflicts: medicationService.checkTimeSlotConflicts(meds, time),
        }));

      setTimeSlots(slots);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoseAction = async (medication: Medication, action: 'taken' | 'skipped' | 'delayed', time: string) => {
    try {
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Check for critical interactions if action is 'taken'
      if (action === 'taken') {
        const slot = timeSlots.find(s => s.time === time);
        const criticalConflict = slot?.conflicts.find(c => c.severity === 'critical');
        
        if (criticalConflict) {
          Alert.alert(
            'Critical Interaction Warning',
            criticalConflict.message,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Override & Record',
                style: 'destructive',
                onPress: () => recordDose(medication, action, scheduledTime, now),
              },
            ]
          );
          return;
        }
      }

      await recordDose(medication, action, scheduledTime, now);
    } catch (error) {
      console.error('Failed to record dose:', error);
      Alert.alert('Error', 'Failed to record dose. Please try again.');
    }
  };

  const recordDose = async (medication: Medication, action: 'taken' | 'skipped' | 'delayed', scheduledTime: Date, recordedTime: Date) => {
    await storageService.addDoseEvent({
      seniorId,
      medicationId: medication.id,
      scheduledTimeISO: scheduledTime.toISOString(),
      recordedTimeISO: recordedTime.toISOString(),
      status: action,
    });

    // Refresh schedule and generate insights
    await loadSchedule();
    await medicationService.generateInsights(seniorId);
    
    Alert.alert('Success', `Dose recorded as ${action}.`);
  };

  const handleAutoOffset = async (conflict: any, timeSlot: string) => {
    try {
      // Find the second medication and offset it by 30 minutes
      const medications = conflict.medications;
      const allMeds = await storageService.getMedications(seniorId);
      const medToOffset = allMeds.find(m => m.name === medications[1]);
      
      if (medToOffset) {
        const newTime = medicationService.offsetMedicationTime(timeSlot, 30);
        const updatedTimes = medToOffset.times.map(t => 
          t === timeSlot ? newTime : t
        );
        
        await storageService.updateMedication(medToOffset.id, { times: updatedTimes });
        await loadSchedule();
        
        Alert.alert('Success', `${medToOffset.name} moved to ${newTime} to avoid conflict.`);
      }
    } catch (error) {
      console.error('Failed to offset medication:', error);
      Alert.alert('Error', 'Failed to resolve conflict. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { fontSize: 16 * textScale }]}>Loading schedule...</Text>
      </View>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Clock size={48} color="#9ca3af" />
        <Text style={[styles.emptyTitle, { fontSize: 18 * textScale }]}>No medications scheduled</Text>
        <Text style={[styles.emptyDescription, { fontSize: 16 * textScale }]}>
          Add medications to build the schedule.
        </Text>
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={() => router.push(`/modals/add-medication?seniorId=${seniorId}`)}
        >
          <Text style={[styles.emptyButtonText, { fontSize: 16 * textScale }]}>Add Medication</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.dateHeader, { fontSize: 18 * textScale }]}>
          Today - {new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </Text>

        {timeSlots.map((slot) => (
          <View key={slot.time} style={styles.timeSlotContainer}>
            {/* Conflict Banners */}
            {slot.conflicts.map((conflict, index) => (
              <View 
                key={index}
                style={[
                  styles.conflictBanner,
                  conflict.severity === 'critical' ? styles.criticalBanner : styles.warningBanner
                ]}
              >
                <AlertTriangle 
                  size={16} 
                  color={conflict.severity === 'critical' ? '#dc2626' : '#d97706'} 
                />
                <Text style={[
                  styles.conflictText,
                  { fontSize: 14 * textScale },
                  conflict.severity === 'critical' ? styles.criticalText : styles.warningText
                ]}>
                  {conflict.message}
                </Text>
                {conflict.type === 'food' && (
                  <TouchableOpacity
                    style={styles.autoOffsetButton}
                    onPress={() => handleAutoOffset(conflict, slot.time)}
                  >
                    <Text style={[styles.autoOffsetText, { fontSize: 12 * textScale }]}>
                      Auto offset
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={styles.timeSlot}>
              <View style={styles.timeHeader}>
                <Text style={[styles.timeText, { fontSize: 20 * textScale }]}>{slot.time}</Text>
              </View>

              <View style={styles.medicationsList}>
                {slot.medications.map((med) => (
                  <View key={med.id} style={styles.medicationRow}>
                    <View style={styles.medicationInfo}>
                      <Text style={[styles.medicationName, { fontSize: 16 * textScale }]}>
                        {med.name}
                      </Text>
                      <View style={styles.medicationDetails}>
                        <Text style={[styles.medicationDose, { fontSize: 14 * textScale }]}>
                          {med.dose}
                        </Text>
                        {med.food !== 'none' && (
                          <View style={styles.foodRequirement}>
                            <Utensils size={12} color="#6b7280" />
                            <Text style={[styles.foodText, { fontSize: 12 * textScale }]}>
                              {med.food === 'with' ? 'with food' : 'without food'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.recordButton}
                        onPress={() => setSelectedMedication({ medication: med, time: slot.time })}
                      >
                        <Text style={[styles.recordButtonText, { fontSize: 14 * textScale }]}>
                          Record
                        </Text>
                        <ChevronDown size={16} color="#3b82f6" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>
      
      <DoseActionModal
        visible={!!selectedMedication}
        onClose={() => setSelectedMedication(null)}
        onSelect={(action) => {
          if (selectedMedication) {
            handleDoseAction(selectedMedication.medication, action, selectedMedication.time);
          }
        }}
        medicationName={selectedMedication?.medication.name || ''}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  timeSlotContainer: {
    gap: 8,
  },
  conflictBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningBanner: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
  },
  criticalBanner: {
    backgroundColor: '#fecaca',
    borderColor: '#dc2626',
    borderWidth: 1,
  },
  conflictText: {
    flex: 1,
    fontSize: 14,
  },
  warningText: {
    color: '#92400e',
  },
  criticalText: {
    color: '#991b1b',
  },
  autoOffsetButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  autoOffsetText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeSlot: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  medicationsList: {
    gap: 12,
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  medicationInfo: {
    flex: 1,
    gap: 4,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  medicationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medicationDose: {
    fontSize: 14,
    color: '#64748b',
  },
  foodRequirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  foodText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtons: {
    alignItems: 'flex-end',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    gap: 4,
  },
  recordButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
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
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 24,
  },
  actionOptions: {
    gap: 12,
    marginBottom: 24,
  },
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderLeftWidth: 4,
    gap: 12,
  },
  actionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
});