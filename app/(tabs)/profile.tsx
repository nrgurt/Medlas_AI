// User profile screen with account info and logout functionality - Oct 1, 2025
// Handles user data display and account management actions - Oct 15, 2025
// Frontend styling and card layouts designed with Cursor assistance - Oct 2, 2025
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User, LogOut, Building, Mail, Settings } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  username: string;
  id: string;
  firstName: string;
  lastName: string;
  facilityName: string;
  email?: string;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await AsyncStorage.getItem('currentUser');
      if (currentUser) {
        setUserData(JSON.parse(currentUser));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('isLoggedIn');
              await AsyncStorage.removeItem('currentUser');
              // Clear all app data on logout
              await AsyncStorage.removeItem('seniors');
              await AsyncStorage.removeItem('medications');
              await AsyncStorage.removeItem('doseEvents');
              await AsyncStorage.removeItem('insights');
              await AsyncStorage.removeItem('userCredentials');
              await AsyncStorage.removeItem('largeText');
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Failed to logout:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSwitchAccount = () => {
    Alert.alert(
      'Switch Account',
      'Sign out and switch to a different account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch Account',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('isLoggedIn');
              await AsyncStorage.removeItem('currentUser');
              // Keep app data when switching accounts
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Failed to switch account:', error);
              Alert.alert('Error', 'Failed to switch account. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={32} color="#3b82f6" />
            </View>
          </View>
          
          <Text style={styles.userName}>
            {userData.firstName} {userData.lastName}
          </Text>
          
          <Text style={styles.userRole}>Caretaker</Text>
        </View>

        {/* User Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <User size={20} color="#6b7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{userData.username}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Building size={20} color="#6b7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Facility</Text>
              <Text style={styles.infoValue}>{userData.facilityName}</Text>
            </View>
          </View>

          {userData.email && (
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Mail size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userData.email}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleSwitchAccount}>
            <View style={styles.actionIcon}>
              <Settings size={20} color="#6b7280" />
            </View>
            <Text style={styles.actionText}>Switch Account</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={styles.actionIcon}>
              <LogOut size={20} color="#dc2626" />
            </View>
            <Text style={[styles.actionText, styles.logoutText]}>Sign Out</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Medlas AI</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Professional medication management for senior care facilities
          </Text>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  userRole: {
    fontSize: 17,
    color: '#64748b',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 16,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 17,
    color: '#1e293b',
    fontWeight: '500',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 16,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: 17,
    color: '#1e293b',
    fontWeight: '500',
  },
  actionChevron: {
    fontSize: 24,
    color: '#9ca3af',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#dc2626',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  appVersion: {
    fontSize: 15,
    color: '#6b7280',
  },
  appDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});