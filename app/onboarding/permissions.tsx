import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  SafeAreaView,
  Alert 
} from 'react-native';
import { router } from 'expo-router';
import { 
  MapPin, 
  Camera, 
  Mic, 
  Bell, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  ArrowRight 
} from 'lucide-react-native';
import { usePermissions } from '@/hooks/usePermissions';

export default function OnboardingPermissions() {
  const { permissions, requestLocationPermission, requestCameraPermission, requestMicrophonePermission } = usePermissions();
  const [requestingPermission, setRequestingPermission] = useState<string | null>(null);

  const permissionItems = [
    {
      id: 'location',
      icon: MapPin,
      title: 'Location Services',
      description: 'Required to share your precise location during emergencies',
      granted: permissions.location,
      request: requestLocationPermission,
      critical: true,
    },
    {
      id: 'camera',
      icon: Camera,
      title: 'Camera Access',
      description: 'Captures photos and videos as evidence during emergencies',
      granted: permissions.camera,
      request: requestCameraPermission,
      critical: true,
    },
    {
      id: 'microphone',
      icon: Mic,
      title: 'Microphone Access',
      description: 'Records audio evidence during emergency situations',
      granted: permissions.microphone,
      request: requestMicrophonePermission,
      critical: true,
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      description: 'Receive important safety alerts and system status updates',
      granted: permissions.notifications,
      request: async () => true,
      critical: false,
    },
  ];

  const handlePermissionRequest = async (item: typeof permissionItems[0]) => {
    setRequestingPermission(item.id);
    try {
      const granted = await item.request();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          `${item.title} is required for Zicom to function properly during emergencies. Please enable it in your device settings.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error(`Error requesting ${item.title}:`, error);
    } finally {
      setRequestingPermission(null);
    }
  };

  const allCriticalPermissionsGranted = permissionItems
    .filter(item => item.critical)
    .every(item => item.granted);

  const handleContinue = () => {
    if (!allCriticalPermissionsGranted) {
      Alert.alert(
        'Missing Permissions',
        'All critical permissions are required for Zicom to function properly during emergencies.',
        [{ text: 'OK' }]
      );
      return;
    }
    router.push('/onboarding/contacts');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#250902" strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Permissions</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enable Essential Permissions</Text>
        <Text style={styles.description}>
          These permissions are required for Zicom to protect you effectively during emergencies.
        </Text>

        <View style={styles.permissionsList}>
          {permissionItems.map((item) => (
            <View key={item.id} style={styles.permissionItem}>
              <View style={styles.permissionHeader}>
                <View style={styles.permissionIcon}>
                  <item.icon 
                    size={24} 
                    color={item.granted ? '#4CAF50' : '#ad2831'} 
                    strokeWidth={2} 
                  />
                </View>
                <View style={styles.permissionInfo}>
                  <View style={styles.permissionTitleRow}>
                    <Text style={styles.permissionTitle}>{item.title}</Text>
                    {item.critical && (
                      <View style={styles.requiredBadge}>
                        <Text style={styles.requiredText}>Required</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.permissionDescription}>{item.description}</Text>
                </View>
                <View style={styles.permissionStatus}>
                  {item.granted ? (
                    <CheckCircle size={24} color="#4CAF50" strokeWidth={2} />
                  ) : (
                    <XCircle size={24} color="#F44336" strokeWidth={2} />
                  )}
                </View>
              </View>
              
              {!item.granted && (
                <Pressable
                  style={[
                    styles.enableButton,
                    requestingPermission === item.id && styles.enableButtonLoading
                  ]}
                  onPress={() => handlePermissionRequest(item)}
                  disabled={requestingPermission === item.id}
                >
                  <Text style={styles.enableButtonText}>
                    {requestingPermission === item.id ? 'Requesting...' : 'Enable'}
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.continueButton,
            !allCriticalPermissionsGranted && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!allCriticalPermissionsGranted}
        >
          <Text style={[
            styles.continueButtonText,
            !allCriticalPermissionsGranted && styles.continueButtonTextDisabled
          ]}>
            Continue
          </Text>
          <ArrowRight 
            size={24} 
            color={allCriticalPermissionsGranted ? "#FFFFFF" : "#CCCCCC"} 
            strokeWidth={2} 
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#250902',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#250902',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionsList: {
    flex: 1,
  },
  permissionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  permissionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#250902',
    marginRight: 8,
  },
  requiredBadge: {
    backgroundColor: '#ad2831',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  requiredText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  permissionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    lineHeight: 20,
  },
  permissionStatus: {
    marginLeft: 12,
  },
  enableButton: {
    backgroundColor: '#ad2831',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  enableButtonLoading: {
    backgroundColor: '#CCCCCC',
  },
  enableButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  continueButton: {
    backgroundColor: '#ad2831',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginRight: 12,
  },
  continueButtonTextDisabled: {
    color: '#999999',
  },
});