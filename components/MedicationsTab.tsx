// Medication list management with add/remove capabilities - Oct 6, 2025
// Displays medication details and provides quick access to editing - Oct 13, 2025
// Medication card layout and empty state design with Cursor help - Oct 7, 2025
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Plus, Pill, Utensils, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import { router } from 'expo-router';
import { storageService, Medication } from '@/services/storage';

interface MedicationsTabProps {
  seniorId: string;
  largeText: boolean;
}

export function MedicationsTab({ seniorId, largeText }: MedicationsTabProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  const textScale = largeText ? 1.2 : 1;

  useEffect(() => {
    loadMedications();
  }, [seniorId]);

  const loadMedications = async () => {
    try {
      const meds = await storageService.getMedications(seniorId);
      setMedications(meds);
    } catch (error) {
      console.error('Failed to load medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedication = (medication: Medication) => {
    Alert.alert(
      'Remove Medication',
      `Are you sure you want to remove ${medication.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteMedication(medication.id);
              await loadMedications();
              Alert.alert('Success', 'Medication removed successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove medication.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { fontSize: 16 * textScale }]}>Loading medications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push(`/modals/add-medication?seniorId=${seniorId}`)}
        >
          <Plus size={20} color="#ffffff" />
          <Text style={[styles.addButtonText, { fontSize: 16 * textScale }]}>Add Medication</Text>
        </TouchableOpacity>
      </View>

      {medications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Pill size={48} color="#9ca3af" />
          <Text style={[styles.emptyTitle, { fontSize: 18 * textScale }]}>No medications added</Text>
          <Text style={[styles.emptyDescription, { fontSize: 16 * textScale }]}>
            Add one to build the schedule.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push(`/modals/add-medication?seniorId=${seniorId}`)}
          >
            <Text style={[styles.emptyButtonText, { fontSize: 16 * textScale }]}>Add Medication</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.medicationsList}>
          {medications.map((medication) => (
            <TouchableOpacity
              key={medication.id}
              style={styles.medicationCard}
              onPress={() => {
                // Show medication details
                Alert.alert(
                  medication.name,
                  `Strength: ${medication.strength}\nDose: ${medication.dose}\nFrequency: ${medication.frequency}x daily\nTimes: ${medication.times.join(', ')}\nFood: ${medication.food}\n${medication.prescriber ? `Prescriber: ${medication.prescriber}` : ''}\n${medication.notes ? `Notes: ${medication.notes}` : ''}`,
                  [
                    { text: 'Close', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => handleDeleteMedication(medication) },
                  ]
                );
              }}
            >
              <View style={styles.medicationInfo}>
                <Text style={[styles.medicationName, { fontSize: 16 * textScale }]}>
                  {medication.name}
                </Text>
                <Text style={[styles.medicationStrength, { fontSize: 14 * textScale }]}>
                  {medication.strength} • {medication.dose}
                </Text>
                <View style={styles.medicationDetails}>
                  <Text style={[styles.medicationFrequency, { fontSize: 12 * textScale }]}>
                    {medication.frequency}x daily at {medication.times.join(', ')}
                  </Text>
                  {medication.food !== 'none' && (
                    <View style={styles.foodRequirement}>
                      <Utensils size={12} color="#6b7280" />
                      <Text style={[styles.foodText, { fontSize: 12 * textScale }]}>
                        {medication.food === 'with' ? 'with food' : 'without food'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => handleDeleteMedication(medication)}
              >
                <MoreHorizontal size={20} color="#6b7280" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  medicationsList: {
    flex: 1,
    padding: 16,
  },
  medicationCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  medicationStrength: {
    fontSize: 14,
    color: '#64748b',
  },
  medicationDetails: {
    gap: 4,
  },
  medicationFrequency: {
    fontSize: 12,
    color: '#6b7280',
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
  moreButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
});