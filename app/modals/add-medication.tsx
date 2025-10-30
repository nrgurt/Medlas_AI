// Medication entry form with scheduling and dosage options - Oct 9, 2025
// Handles frequency selection and automatic time generation - Oct 16, 2025
// Complex form layout and frequency button styling with Cursor assistance - Oct 10, 2025
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X, ChevronDown } from 'lucide-react-native';
import { storageService } from '@/services/storage';
import { medicationService } from '@/services/medication';

const FREQUENCIES = [
  { label: 'Once daily', value: 1 },
  { label: 'Twice daily', value: 2 },
  { label: 'Three times daily', value: 3 },
  { label: 'Four times daily', value: 4 },
];

const FOOD_OPTIONS = [
  { label: 'With food', value: 'with' },
  { label: 'Without food', value: 'without' },
  { label: 'No restriction', value: 'none' },
];

export default function AddMedicationModal() {
  const { seniorId, medName = '', medStrength = '' } = useLocalSearchParams<{
    seniorId: string;
    medName?: string;
    medStrength?: string;
  }>();
  
  const [name, setName] = useState(medName);
  const [strength, setStrength] = useState(medStrength);
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState<number>(1);
  const [times, setTimes] = useState<string[]>(['09:00']);
  const [food, setFood] = useState<'with' | 'without' | 'none'>('none');
  const [prescriber, setPrescriber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Update default times when frequency changes
    const defaultTimes = medicationService.generateDefaultTimes(frequency);
    setTimes(defaultTimes);
  }, [frequency]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Medication name is required';
    }

    if (!strength.trim()) {
      newErrors.strength = 'Strength is required';
    }

    if (!dose.trim()) {
      newErrors.dose = 'Dose is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !seniorId) {
      return;
    }

    setLoading(true);
    try {
      await storageService.addMedication({
        seniorId,
        name: name.trim(),
        strength: strength.trim(),
        dose: dose.trim(),
        frequency,
        times,
        food,
        prescriber: prescriber.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', 'Medication added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to add medication:', error);
      Alert.alert('Error', 'Failed to save medication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateTime = (index: number, newTime: string) => {
    const updatedTimes = [...times];
    updatedTimes[index] = newTime;
    setTimes(updatedTimes);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Medication</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          {medName && (
            <View style={styles.prefilledNotice}>
              <Text style={styles.prefilledText}>
                Pre-filled from scan simulation
              </Text>
            </View>
          )}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Medication Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) {
                  setErrors({ ...errors, name: '' });
                }
              }}
              placeholder="Enter medication name"
              autoCapitalize="words"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Strength *</Text>
            <TextInput
              style={[styles.input, errors.strength && styles.inputError]}
              value={strength}
              onChangeText={(text) => {
                setStrength(text);
                if (errors.strength) {
                  setErrors({ ...errors, strength: '' });
                }
              }}
              placeholder="e.g., 10mg, 5ml"
            />
            {errors.strength && <Text style={styles.errorText}>{errors.strength}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Dose *</Text>
            <TextInput
              style={[styles.input, errors.dose && styles.inputError]}
              value={dose}
              onChangeText={(text) => {
                setDose(text);
                if (errors.dose) {
                  setErrors({ ...errors, dose: '' });
                }
              }}
              placeholder="e.g., 1 tablet, 2 teaspoons"
            />
            {errors.dose && <Text style={styles.errorText}>{errors.dose}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Frequency *</Text>
            <View style={styles.frequencyButtons}>
              {FREQUENCIES.map((freq) => (
                <TouchableOpacity
                  key={freq.value}
                  style={[
                    styles.frequencyButton,
                    frequency === freq.value && styles.frequencyButtonActive
                  ]}
                  onPress={() => setFrequency(freq.value)}
                >
                  <Text style={[
                    styles.frequencyButtonText,
                    frequency === freq.value && styles.frequencyButtonTextActive
                  ]}>
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Default Times</Text>
            <Text style={styles.fieldDescription}>
              These times are automatically set based on frequency. You can adjust them.
            </Text>
            <View style={styles.timeInputs}>
              {times.map((time, index) => (
                <View key={index} style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Dose {index + 1}:</Text>
                  <TextInput
                    style={styles.timeValue}
                    value={time}
                    onChangeText={(newTime) => updateTime(index, newTime)}
                    placeholder="HH:MM"
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Food Requirement</Text>
            <View style={styles.foodButtons}>
              {FOOD_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.foodButton,
                    food === option.value && styles.foodButtonActive
                  ]}
                  onPress={() => setFood(option.value as 'with' | 'without' | 'none')}
                >
                  <Text style={[
                    styles.foodButtonText,
                    food === option.value && styles.foodButtonTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Prescribing Physician</Text>
            <TextInput
              style={styles.input}
              value={prescriber}
              onChangeText={setPrescriber}
              placeholder="Enter physician name (optional)"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Special Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter any special instructions (optional)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save medication'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  form: {
    gap: 24,
  },
  prefilledNotice: {
    backgroundColor: '#e0f2fe',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0891b2',
  },
  prefilledText: {
    fontSize: 14,
    color: '#0e7490',
    textAlign: 'center',
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  fieldDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  input: {
    height: 48,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  frequencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  frequencyButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  frequencyButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  frequencyButtonTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  timeInputs: {
    gap: 12,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: '#374151',
    minWidth: 60,
  },
  timeValue: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  foodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foodButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  foodButtonActive: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  foodButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  foodButtonTextActive: {
    color: '#10b981',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});