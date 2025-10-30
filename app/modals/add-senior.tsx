// Modal for adding new senior residents with health info - Oct 7, 2025
// Form validation and storage of allergies, conditions, physician data - Oct 14, 2025
// Modal design and chip-based input styling done with Cursor AI - Oct 8, 2025
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { X, Plus } from 'lucide-react-native';
import { storageService } from '@/services/storage';

export default function AddSeniorModal() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [physician, setPhysician] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await storageService.addSenior({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: Number(age),
        allergies,
        conditions,
        physician: physician.trim() || undefined,
      });

      router.back();
    } catch (error) {
      console.error('Failed to add senior:', error);
      Alert.alert('Error', 'Failed to save senior. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

  const addCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const removeCondition = (condition: string) => {
    setConditions(conditions.filter(c => c !== condition));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Senior</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstName) {
                  setErrors({ ...errors, firstName: '' });
                }
              }}
              placeholder="Enter first name"
              autoCapitalize="words"
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (errors.lastName) {
                  setErrors({ ...errors, lastName: '' });
                }
              }}
              placeholder="Enter last name"
              autoCapitalize="words"
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              value={age}
              onChangeText={(text) => {
                setAge(text);
                if (errors.age) {
                  setErrors({ ...errors, age: '' });
                }
              }}
              placeholder="Enter age"
              keyboardType="numeric"
              maxLength={3}
            />
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Allergies</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={newAllergy}
                onChangeText={setNewAllergy}
                placeholder="Add allergy"
                onSubmitEditing={addAllergy}
              />
              <TouchableOpacity style={styles.addButton} onPress={addAllergy}>
                <Plus size={16} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            <View style={styles.chipContainer}>
              {allergies.map((allergy) => (
                <TouchableOpacity
                  key={allergy}
                  style={styles.chip}
                  onPress={() => removeAllergy(allergy)}
                >
                  <Text style={styles.chipText}>{allergy}</Text>
                  <X size={14} color="#6b7280" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Conditions</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={newCondition}
                onChangeText={setNewCondition}
                placeholder="Add condition"
                onSubmitEditing={addCondition}
              />
              <TouchableOpacity style={styles.addButton} onPress={addCondition}>
                <Plus size={16} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            <View style={styles.chipContainer}>
              {conditions.map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={styles.chip}
                  onPress={() => removeCondition(condition)}
                >
                  <Text style={styles.chipText}>{condition}</Text>
                  <X size={14} color="#6b7280" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Primary Physician</Text>
            <TextInput
              style={styles.input}
              value={physician}
              onChangeText={setPhysician}
              placeholder="Enter physician name (optional)"
              autoCapitalize="words"
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
            {loading ? 'Saving...' : 'Save senior'}
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
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
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
  inputError: {
    borderColor: '#ef4444',
  },
  inputFlex: {
    flex: 1,
  },
  inputWithButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    color: '#3730a3',
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