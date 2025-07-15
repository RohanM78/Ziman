import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';

export interface PermissionStatus {
  location: boolean;
  camera: boolean;
  microphone: boolean;
  notifications: boolean;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    location: false,
    camera: false,
    microphone: false,
    notifications: false,
  });

  const checkPermissions = async () => {
    try {
      const locationStatus = await Location.getForegroundPermissionsAsync();
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      
      let microphoneGranted = true; // Default for web
      if (Platform.OS !== 'web') {
        const audioStatus = await Audio.getPermissionsAsync();
        microphoneGranted = audioStatus.status === 'granted';
      }

      setPermissions({
        location: locationStatus.status === 'granted',
        camera: cameraStatus.status === 'granted',
        microphone: microphoneGranted,
        notifications: true, // Web doesn't require explicit notification permission
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted' && Platform.OS !== 'web') {
        await Location.requestBackgroundPermissionsAsync();
      }
      await checkPermissions();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      await checkPermissions();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      await checkPermissions();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return {
    permissions,
    requestLocationPermission,
    requestCameraPermission,
    requestMicrophonePermission,
    checkPermissions,
  };
}