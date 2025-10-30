// Login screen with demo credentials and form validation - Sept 26, 2025
// Handles authentication and redirects to dashboard on success - Oct 4, 2025
// Form styling and input field designs done with Cursor AI - Sept 27, 2025
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setUsernameError('');
    setPasswordError('');
    
    if (!username.trim()) {
      setUsernameError('Username is required');
      return;
    }
    
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    setLoading(true);
    try {
      // Check for demo credentials
      if (username === 'demo' && password === 'demo') {
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('currentUser', JSON.stringify({ 
          username: 'demo', 
          id: '1',
          firstName: 'Demo',
          lastName: 'User',
          facilityName: 'Sunrise Senior Living - Demo Facility',
          email: 'demo@sunriseseniorliving.com'
        }));
        router.replace('/(tabs)/dashboard');
        return;
      }

      // Check for registered user credentials
      const storedCredentials = await AsyncStorage.getItem('userCredentials');
      if (storedCredentials) {
        const { username: storedUsername, password: storedPassword } = JSON.parse(storedCredentials);
        if (username === storedUsername && password === storedPassword) {
          const userData = await AsyncStorage.getItem('userData');
          await AsyncStorage.setItem('isLoggedIn', 'true');
          await AsyncStorage.setItem('currentUser', userData || '{}');
          router.replace('/(tabs)/dashboard');
          return;
        }
      }

      // Invalid credentials
      setUsernameError('Check your username or password');
      setPasswordError('Check your username or password');
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Error', 'Failed to log in. Please try again.');
    } finally {
      setLoading(true);
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
        <Text style={styles.headerTitle}>Sign In</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue managing medications safely</Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, usernameError ? styles.inputError : null]}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError('');
              }}
              placeholder="Enter your username"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, passwordError ? styles.inputError : null]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                placeholder="Enter your password"
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
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.demoHelper}>
            <Text style={styles.demoText}>Demo credentials: demo / demo</Text>
          </View>

          <View style={styles.signUpPrompt}>
            <Text style={styles.signUpPromptText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signUpLink}>Create Account</Text>
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
  logoSection: {
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 26,
  },
  form: {
    paddingHorizontal: 32,
    gap: 32,
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
  loginButton: {
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
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '600',
  },
  demoHelper: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  demoText: {
    fontSize: 15,
    color: '#0369a1',
  },
  signUpPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  signUpPromptText: {
    fontSize: 17,
    color: '#6b7280',
  },
  signUpLink: {
    fontSize: 17,
    color: '#3b82f6',
    fontWeight: '600',
  },
});