// useCameraPermission.js - Custom Hook for Camera Permissions
// Handles requesting and checking camera permissions

import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { Alert, Platform } from 'react-native';

export const useCameraPermission = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      setIsLoading(true);
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to capture skin lesion images for diagnosis.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openAppSettings() },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      // iOS - Link to settings not directly available
      Alert.alert('Please enable camera access in Settings app');
    } else {
      // Android - Can open app settings
      // Linking.openSettings(); // Uncomment when Linking is imported
      Alert.alert('Please enable camera access in app settings');
    }
  };

  const checkPermission = async () => {
    const { status } = await Camera.getCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  };

  return {
    hasPermission,
    isLoading,
    requestPermission,
    checkPermission,
  };
};
