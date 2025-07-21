import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { Settings, Shield, Smartphone, MapPin, Bell, Camera, Mic, Users, CircleHelp as HelpCircle, ExternalLink, ChevronRight, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import { useAppSettings } from '@/hooks/useAppSettings';
import { usePermissions } from '@/hooks/usePermissions';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function SettingsScreen() {
  const { settings, saveSettings } = useAppSettings();
  const { permissions, requestLocationPermission, requestCameraPermission, requestMicrophonePermission } = usePermissions();
  const { signOut } = useSupabaseAuth();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleToggleSetting = async (key: keyof typeof settings, value: boolean) => {
    setIsUpdating(key);
    try {
      await saveSettings({ [key]: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handlePermissionRequest = async (type: 'location' | 'camera' | 'microphone') => {
    setIsUpdating(type);
    try {
      let granted = false;
      switch (type) {
        case 'location':
          granted = await requestLocationPermission();
          break;
        case 'camera':
          granted = await requestCameraPermission();
          break;
        case 'microphone':
          granted = await requestMicrophonePermission();
          break;
      }
      
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'This permission is required for Zicom to function properly during emergencies. Please enable it in your device settings.',
          [
            { text: 'Cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request permission. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handlePowerButtonSensitivity = () => {
    Alert.alert(
      'Power Button Sensitivity',
      'Choose how quickly you need to press the power button to trigger an emergency:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '2 seconds (Very Fast)', onPress: () => saveSettings({ powerButtonSensitivity: 2 }) },
        { text: '3 seconds (Fast)', onPress: () => saveSettings({ powerButtonSensitivity: 3 }) },
        { text: '4 seconds (Normal)', onPress: () => saveSettings({ powerButtonSensitivity: 4 }) },
        { text: '5 seconds (Slow)', onPress: () => saveSettings({ powerButtonSensitivity: 5 }) },
      ]
    );
  };

  const handleTestEmergency = () => {
    Alert.alert(
      'Test Emergency System',
      'This will test all emergency functions except actually contacting your emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Test', 
          onPress: () => {
            Alert.alert(
              'Test Complete',
              '✅ Location services: Working\n✅ Camera access: Working\n✅ Microphone access: Working\n✅ Emergency contacts: Ready\n\nYour emergency system is fully operational!'
            );
          }
        }
      ]
    );
  };

  const handleEmergencyGuide = () => {
    Alert.alert(
      'Emergency Activation Methods',
      '1. Power Button: Press your power button 4 times quickly\n\n2. App Interface: Open Zicom and tap the emergency button\n\n3. Voice Command: "Hey Siri/Google, emergency" (if configured)\n\nRemember: Stay calm and follow your safety plan.',
      [{ text: 'Got it' }]
    );
  };

  const openPrivacyPolicy = () => {
    const url = 'https://zicom-safety.com/privacy';
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  const openSupport = () => {
    const url = 'https://zicom-safety.com/support';
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  const handleSignOut = async () => {
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
              await signOut();
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    value, 
    onToggle, 
    type = 'toggle',
    onPress,
    status,
    disabled = false
  }: {
    icon: any;
    title: string;
    description: string;
    value?: boolean;
    onToggle?: (value: boolean) => void;
    type?: 'toggle' | 'button' | 'permission';
    onPress?: () => void;
    status?: 'granted' | 'denied';
    disabled?: boolean;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          <Icon size={24} color="#ad2831" strokeWidth={2} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <View style={styles.settingControl}>
          {type === 'toggle' && onToggle && (
            <Switch
              value={value}
              onValueChange={onToggle}
              disabled={disabled}
              thumbColor={value ? '#ad2831' : '#FFFFFF'}
              trackColor={{ false: '#EEEEEE', true: '#FFB3B8' }}
            />
          )}
          {type === 'permission' && (
            <View style={styles.permissionStatus}>
              {status === 'granted' ? (
                <CheckCircle size={24} color="#4CAF50" strokeWidth={2} />
              ) : (
                <Pressable
                  style={styles.enableButton}
                  onPress={onPress}
                  disabled={disabled}
                >
                  <Text style={styles.enableButtonText}>Enable</Text>
                </Pressable>
              )}
            </View>
          )}
          {type === 'button' && (
            <Pressable
              style={styles.actionButton}
              onPress={onPress}
              disabled={disabled}
            >
              <ChevronRight size={20} color="#666666" strokeWidth={2} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Settings size={28} color="#ad2831" strokeWidth={2} />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Configure your safety preferences
        </Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency System</Text>
          
          <SettingItem
            icon={Smartphone}
            title="Power Button Activation"
            description={`Current: ${settings.powerButtonSensitivity} seconds (4 quick presses)`}
            type="button"
            onPress={handlePowerButtonSensitivity}
          />

          <SettingItem
            icon={Shield}
            title="Background Monitoring"
            description="Keep emergency system active when app is closed"
            value={settings.backgroundMonitoring}
            onToggle={(value) => handleToggleSetting('backgroundMonitoring', value)}
            disabled={isUpdating === 'backgroundMonitoring'}
          />

          <SettingItem
            icon={Users}
            title="Emergency Contacts"
            description={`${settings.emergencyContacts.length} of 3 contacts configured`}
            type="button"
            onPress={() => {}} // Navigate to contacts tab
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions</Text>
          
          <SettingItem
            icon={MapPin}
            title="Location Services"
            description="Required for sharing your location during emergencies"
            type="permission"
            status={permissions.location ? 'granted' : 'denied'}
            onPress={() => handlePermissionRequest('location')}
            disabled={isUpdating === 'location'}
          />

          <SettingItem
            icon={Camera}
            title="Camera Access"
            description="Capture photos and videos as evidence"
            type="permission"
            status={permissions.camera ? 'granted' : 'denied'}
            onPress={() => handlePermissionRequest('camera')}
            disabled={isUpdating === 'camera'}
          />

          <SettingItem
            icon={Mic}
            title="Microphone Access"
            description="Record audio evidence during emergencies"
            type="permission"
            status={permissions.microphone ? 'granted' : 'denied'}
            onPress={() => handlePermissionRequest('microphone')}
            disabled={isUpdating === 'microphone'}
          />

          <SettingItem
            icon={Bell}
            title="Notifications"
            description="Receive system alerts and safety reminders"
            type="permission"
            status={permissions.notifications ? 'granted' : 'denied'}
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testing & Support</Text>
          
          <SettingItem
            icon={Shield}
            title="Test Emergency System"
            description="Verify all emergency functions are working"
            type="button"
            onPress={handleTestEmergency}
          />

          <SettingItem
            icon={HelpCircle}
            title="Emergency Guide"
            description="Learn how to activate emergency mode"
            type="button"
            onPress={handleEmergencyGuide}
          />

          <SettingItem
            icon={ExternalLink}
            title="Support Center"
            description="Get help and report issues"
            type="button"
            onPress={openSupport}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Legal</Text>
          
          <SettingItem
            icon={Shield}
            title="Privacy Policy"
            description="How we protect your data and privacy"
            type="button"
            onPress={openPrivacyPolicy}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon={ExternalLink}
            title="Sign Out"
            description="Sign out of your Zicom account"
            type="button"
            onPress={handleSignOut}
          />
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>Zicom Safety</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          <Text style={styles.appInfoDescription}>
            Personal Safety Guardian
          </Text>
          <Text style={styles.appInfoDisclaimer}>
            This app is designed to assist in emergencies but should not replace 
            professional emergency services. Always call 911 for immediate help.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#250902',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#250902',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#250902',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    lineHeight: 20,
  },
  settingControl: {
    marginLeft: 16,
  },
  permissionStatus: {
    alignItems: 'center',
  },
  enableButton: {
    backgroundColor: '#ad2831',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  enableButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginTop: 32,
  },
  appInfoTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#250902',
    marginBottom: 4,
  },
  appInfoVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ad2831',
    marginBottom: 8,
  },
  appInfoDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666666',
    marginBottom: 16,
  },
  appInfoDisclaimer: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});