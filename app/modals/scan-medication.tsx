// Camera interface for medication label scanning simulation - Oct 11, 2025
// Captures images and simulates medication detection for demo - Oct 17, 2025
// Camera overlay and capture button design created with Cursor - Oct 12, 2025
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { X, Camera, FlashlightOff as FlashOff, Zap as FlashOn } from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

export default function ScanMedicationModal() {
  const [showCamera, setShowCamera] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleCameraPress = async () => {
    if (!permission) {
      return;
    }

    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to scan medications.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setShowCamera(true);
  };

  const handleCapture = () => {
    setShowCamera(false);
    Alert.alert(
      'Medication Scanned',
      'Metformin 500mg detected. Add to schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            router.replace({
              pathname: '/modals/add-medication',
              params: {
                medName: 'Metformin',
                medStrength: '500mg',
              }
            });
          }
        },
      ]
    );
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        <View style={styles.cameraHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowCamera(false)}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>Scan Medication</Text>
          <TouchableOpacity 
            style={styles.flashButton} 
            onPress={() => setFlashOn(!flashOn)}
          >
            {flashOn ? (
              <FlashOn size={24} color="#ffffff" />
            ) : (
              <FlashOff size={24} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>

        <CameraView 
          style={styles.camera}
          facing="back"
          flash={flashOn ? 'on' : 'off'}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanInstructions}>
              Position medication label within the frame
            </Text>
          </View>
        </CameraView>

        <View style={styles.cameraFooter}>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Medication</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
          <Camera size={24} color="#ffffff" />
          <Text style={styles.cameraButtonText}>Use Camera to Scan</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Scan Medication Labels</Text>
          <Text style={styles.instructionsDescription}>
            Point your camera at the medication label to automatically detect and add medications to your schedule.
          </Text>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  cameraButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  instructionsDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanInstructions: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
  },
});