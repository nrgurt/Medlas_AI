// User registration form with facility information - Sept 27, 2025
// Creates new accounts and automatically logs users in - Oct 6, 2025
// Multi-step form layout and validation styling with Cursor help - Sept 28, 2025
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!facilityName.trim()) {
      newErrors.facilityName = 'Facility name is required';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simulate account creation
      const userData = {
        id: Date.now().toString(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        facilityName: facilityName.trim(),
        username: username.trim(),
        createdAt: new Date().toISOString(),
      };

      // Store user data
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userCredentials', JSON.stringify({
        username: username.trim(),
        password: password, // In a real app, this would be hashed
      }));
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));

      // Navigate directly to dashboard after successful signup
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('Failed to create account:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.subtitle}>
            Join thousands of caregivers providing safer medication management
          </Text>

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
              placeholder="Enter your first name"
              autoCapitalize="words"
              autoCorrect={false}
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
              placeholder="Enter your last name"
              autoCapitalize="words"
              autoCorrect={false}
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
              }}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Facility Name *</Text>
            <TextInput
              style={[styles.input, errors.facilityName && styles.inputError]}
              value={facilityName}
              onChangeText={(text) => {
                setFacilityName(text);
                if (errors.facilityName) {
                  setErrors({ ...errors, facilityName: '' });
                }
              }}
              placeholder="Enter your facility name"
              autoCapitalize="words"
              autoCorrect={false}
            />
            {errors.facilityName && <Text style={styles.errorText}>{errors.facilityName}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) {
                  setErrors({ ...errors, username: '' });
                }
              }}
              placeholder="Choose a username"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.password && styles.inputError]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors({ ...errors, password: '' });
                  }
                }}
                placeholder="Create a password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6b7280" />
                ) : (
                  <Eye size={20} color="#6b7280" />
                )}
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: '' });
                  }
                }}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#6b7280" />
                ) : (
                  <Eye size={20} color="#6b7280" />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 70,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 32,
    gap: 32,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 16,
  },
  fieldContainer: {
    gap: 12,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    height: 52,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 17,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 52,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingRight: 56,
    fontSize: 17,
    backgroundColor: '#ffffff',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#ef4444',
  },
  signUpButton: {
    backgroundColor: '#3b82f6',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '600',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginPromptText: {
    fontSize: 17,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 17,
    color: '#3b82f6',
    fontWeight: '600',
  },
});