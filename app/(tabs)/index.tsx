import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { SafetyButton } from '@/components/SafetyButton';
import { StatusIndicator } from '@/components/StatusIndicator';
import { EmergencyRecorder } from '@/components/EmergencyRecorder';
import { useAppSettings } from '@/hooks/useAppSettings';
import { usePermissions } from '@/hooks/usePermissions';
import { useEmergencySystem } from '@/hooks/useEmergencySystem';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function HomeScreen() {
  const { settings, isLoading } = useAppSettings();
  const { permissions } = usePermissions();
  const { 
    isEmergencyActive, 
    emergencyEvent,
    emergencyProgress,
    triggerEmergency, 
    cancelEmergency,
    handleRecordingComplete 
  } = useEmergencySystem();
  const { isAuthenticated, ensureAuthenticated } = useSupabaseAuth();
  const [cancelTimer, setCancelTimer] = useState<number | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);

  // Redirect to onboarding if first launch
  useEffect(() => {
    if (!isLoading && settings.isFirstLaunch) {
      router.replace('/onboarding');
    }
  }, [isLoading, settings.isFirstLaunch]);

  // Show recorder when emergency is active
  useEffect(() => {
    if (isEmergencyActive && emergencyEvent) {
      setShowRecorder(true);
    } else {
      setShowRecorder(false);
    }
  }, [isEmergencyActive, emergencyEvent]);

  const handleEmergencyActivation = () => {
    if (isEmergencyActive) {
      // Cancel emergency
      cancelEmergency();
      if (cancelTimer) {
        clearTimeout(cancelTimer);
        setCancelTimer(null);
      }
      return;
    }

    // Immediate activation for emergency recording
    activateEmergency();
  };

  const activateEmergency = async () => {
    if (settings.emergencyContacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'Please add emergency contacts before activating the safety protocol.',
        [
          { text: 'OK' },
          {
            text: 'Add Contacts',
            onPress: () => router.push('/(tabs)/contacts'),
          },
        ]
      );
      return;
    }

    // Ensure Supabase authentication before triggering emergency
    try {
      await ensureAuthenticated();
      await triggerEmergency(settings.emergencyContacts);
    } catch (error) {
      console.error('Failed to activate emergency:', error);
      Alert.alert(
        'Emergency Activation Failed',
        'Failed to activate emergency protocol. Please try again or call emergency services directly.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRecordingError = (error: string) => {
    Alert.alert('Recording Error', error);
  };

  const getSystemStatus = () => {
    return {
      location: permissions.location,
      camera: permissions.camera,
      microphone: permissions.microphone,
      contacts: settings.emergencyContacts.length > 0,
      backgroundApp: Platform.OS !== 'web',
      firebase: isAuthenticated,
    };
  };

  const systemStatus = getSystemStatus();
  const criticalIssues = Object.values(systemStatus).filter(
    (status) => !status
  ).length;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Zicom...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.appTitle}>Zicom</Text>
          <Text style={styles.subtitle}>Personal Safety Guardian</Text>
          {criticalIssues > 0 && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                {criticalIssues} system issue{criticalIssues > 1 ? 's' : ''}{' '}
                detected
              </Text>
            </View>
          )}
        </View>

        <View style={styles.emergencySection}>
          <SafetyButton
            isActive={isEmergencyActive}
            onPress={handleEmergencyActivation}
            disabled={criticalIssues > 2 || !isAuthenticated}
          />

          {isEmergencyActive && (
            <View style={styles.activeAlert}>
              <Text style={styles.activeAlertText}>
                🚨 EMERGENCY PROTOCOL ACTIVE
              </Text>
              <Text style={styles.activeAlertSubtext}>
                Recording evidence and notifying contacts...
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${emergencyProgress}%` }]} 
                  />
                </View>
                <Text style={styles.progressText}>{emergencyProgress}%</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>System Status</Text>

          <StatusIndicator
            label="Supabase Connection"
            status={systemStatus.firebase ? 'active' : 'inactive'}
            description={
              systemStatus.firebase
                ? 'Cloud storage ready'
                : 'Connecting to cloud services...'
            }
          />

          <StatusIndicator
            label="Location Services"
            status={systemStatus.location ? 'active' : 'inactive'}
            description={
              systemStatus.location
                ? 'GPS location tracking enabled'
                : 'Location access required'
            }
          />

          <StatusIndicator
            label="Camera Access"
            status={systemStatus.camera ? 'active' : 'inactive'}
            description={
              systemStatus.camera
                ? 'Photo/video capture ready'
                : 'Camera permission needed'
            }
          />

          <StatusIndicator
            label="Microphone Access"
            status={systemStatus.microphone ? 'active' : 'inactive'}
            description={
              systemStatus.microphone
                ? 'Audio recording ready'
                : 'Microphone permission needed'
            }
          />

          <StatusIndicator
            label="Emergency Contacts"
            status={systemStatus.contacts ? 'active' : 'warning'}
            description={
              systemStatus.contacts
                ? `${settings.emergencyContacts.length} contact${
                    settings.emergencyContacts.length > 1 ? 's' : ''
                  } configured`
                : 'Add emergency contacts'
            }
          />

          <StatusIndicator
            label="Background Monitoring"
            status={systemStatus.backgroundApp ? 'active' : 'warning'}
            description={
              systemStatus.backgroundApp
                ? 'App can run in background'
                : 'Limited background support on web'
            }
          />
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.quickActionsText}>
            Remember: Press your power button 4 times quickly to activate
            emergency mode without opening the app.
          </Text>
        </View>
      </ScrollView>

      {/* Emergency Recording Modal */}
      <Modal
        visible={showRecorder}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {emergencyEvent && (
          <EmergencyRecorder
            recordId={emergencyEvent.id}
            onRecordingComplete={handleRecordingComplete}
            onError={handleRecordingError}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
    paddingTop: 48,
    paddingHorizontal: 28,
    justifyContent: 'flex-start',
    alignItems: 'center',
    rowGap: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#250902',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: 'Inter-Medium',
    color: '#ad2831',
    marginBottom: 10,
  },
  warningBanner: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emergencySection: {
    alignItems: 'center',
    marginBottom: 48,
    rowGap: 20,
  },
  activeAlert: {
    backgroundColor: '#ad2831',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  activeAlertText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  activeAlertSubtext: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 18,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  statusSection: {
    paddingVertical: 36,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#250902',
    marginBottom: 16,
  },
  quickActionsSection: {
    width: '100%',
    marginBottom: 60,
  },
  quickActionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    lineHeight: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ad2831',
  },
});
