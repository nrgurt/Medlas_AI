// Root layout with navigation setup and demo data initialization - Sept 25, 2025
// Preloads sample seniors and medications for demo purposes - Oct 10, 2025
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { router } from 'expo-router';
import { storageService } from '@/services/storage';
import { initGemini } from '@/services/gemini';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useFrameworkReady();

  useEffect(() => {
    initializeApp();
  }, []);
  

  const initializeApp = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      
      if (!hasLaunched) {
        await preloadDemoData();
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        initGemini();
      }
      
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loggedIn === 'true');
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsReady(true);
    }
  };

  const preloadDemoData = async () => {
    try {
      initGemini();
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('currentUser', JSON.stringify({ 
        username: 'demo', 
        id: '1',
        firstName: 'Demo',
        lastName: 'User',
        facilityName: 'Sunrise Senior Living - Demo Facility',
        email: 'demo@sunriseseniorliving.com'
      }));
      
      await AsyncStorage.removeItem('seniors');
      await AsyncStorage.removeItem('medications');
      await AsyncStorage.removeItem('doseEvents');
      await AsyncStorage.removeItem('insights');
      await AsyncStorage.removeItem('doctorNotes');
      const margaret = await storageService.addSenior({
        firstName: 'Margaret',
        lastName: 'Johnson',
        age: 78,
        allergies: ['Penicillin'],
        conditions: ['Diabetes', 'Hypertension'],
        physician: 'Dr. Sarah Wilson'
      });
      
      const robert = await storageService.addSenior({
        firstName: 'Robert',
        lastName: 'Chen',
        age: 82,
        allergies: ['Sulfa drugs'],
        conditions: ['Heart Disease', 'Arthritis'],
        physician: 'Dr. Michael Rodriguez'
      });
      
      const dorothy = await storageService.addSenior({
        firstName: 'Dorothy',
        lastName: 'Williams',
        age: 75,
        allergies: [],
        conditions: ['Osteoporosis', 'High Cholesterol'],
        physician: 'Dr. Sarah Wilson'
      });
      
      const frank = await storageService.addSenior({
        firstName: 'Frank',
        lastName: 'Thompson',
        age: 79,
        allergies: ['Aspirin', 'Iodine'],
        conditions: ['COPD', 'Diabetes'],
        physician: 'Dr. Jennifer Lee'
      });
      
      await storageService.addMedication({
        seniorId: margaret.id,
        name: 'Metformin',
        strength: '500mg',
        dose: '1 tablet',
        frequency: 2,
        times: ['09:00', '21:00'],
        food: 'with',
        prescriber: 'Dr. Sarah Wilson',
        notes: 'Take with meals to reduce stomach upset'
      });
      
      await storageService.addMedication({
        seniorId: margaret.id,
        name: 'Lisinopril',
        strength: '10mg',
        dose: '1 tablet',
        frequency: 1,
        times: ['09:00'],
        food: 'none',
        prescriber: 'Dr. Sarah Wilson'
      });
      
      await storageService.addMedication({
        seniorId: robert.id,
        name: 'Atorvastatin',
        strength: '20mg',
        dose: '1 tablet',
        frequency: 1,
        times: ['21:00'],
        food: 'none',
        prescriber: 'Dr. Michael Rodriguez'
      });
      
      await storageService.addMedication({
        seniorId: robert.id,
        name: 'Carvedilol',
        strength: '6.25mg',
        dose: '1 tablet',
        frequency: 2,
        times: ['09:00', '21:00'],
        food: 'with',
        prescriber: 'Dr. Michael Rodriguez'
      });
      
      await storageService.addMedication({
        seniorId: dorothy.id,
        name: 'Alendronate',
        strength: '70mg',
        dose: '1 tablet',
        frequency: 1,
        times: ['07:00'],
        food: 'without',
        prescriber: 'Dr. Sarah Wilson',
        notes: 'Take on empty stomach, wait 30 minutes before eating'
      });
      
      await storageService.addMedication({
        seniorId: dorothy.id,
        name: 'Simvastatin',
        strength: '40mg',
        dose: '1 tablet',
        frequency: 1,
        times: ['21:00'],
        food: 'none',
        prescriber: 'Dr. Sarah Wilson'
      });
      
      await storageService.addMedication({
        seniorId: frank.id,
        name: 'Albuterol',
        strength: '90mcg',
        dose: '2 puffs',
        frequency: 4,
        times: ['07:00', '13:00', '19:00', '23:00'],
        food: 'none',
        prescriber: 'Dr. Jennifer Lee',
        notes: 'Use spacer device'
      });
      
      await storageService.addMedication({
        seniorId: frank.id,
        name: 'Glipizide',
        strength: '5mg',
        dose: '1 tablet',
        frequency: 2,
        times: ['08:00', '20:00'],
        food: 'with',
        prescriber: 'Dr. Jennifer Lee'
      });
      
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Failed to preload demo data:', error);
    }
  };
  useEffect(() => {
    if (isReady) {
      if (isLoggedIn) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/');
      }
    }
  }, [isReady, isLoggedIn]);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="senior/[id]" />
        <Stack.Screen name="modals/add-senior" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/add-medication" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/scan-medication" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}