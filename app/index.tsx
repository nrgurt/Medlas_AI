// Landing page with app intro and authentication options - Sept 25, 2025
// Checks login status and redirects accordingly - Oct 1, 2025
// Hero section and CTA button designs created using Cursor - Sept 26, 2025
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Pill } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (loggedIn === 'true') {
        router.replace('/(tabs)/dashboard');
        return;
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Pill size={32} color="#ffffff" />
            </View>
            <Text style={styles.appName}>Medlas AI</Text>
          </View>
          
          <Text style={styles.description}>
            Professional medication management system for senior care facilities. Streamline medication schedules, track adherence, and ensure safety with AI-powered insights and comprehensive dose monitoring.
          </Text>
        </View>




        {/* CTA Section */}
        <View style={styles.cta}>
          <View style={styles.ctaButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.primaryButtonText}>Login</Text>
              <ArrowRight size={20} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/signup')}
            >
              <Text style={styles.secondaryButtonText}>Sign Up</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 80,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 400,
    paddingHorizontal: 20,
  },
  cta: {
    paddingHorizontal: 32,
    paddingVertical: 40,
    alignItems: 'center',
  },
  ctaButtons: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#475569',
  },
});