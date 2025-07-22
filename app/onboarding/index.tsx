import React from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  SafeAreaView,
  Dimensions 
} from 'react-native';
import { router } from 'expo-router';
import { Shield, ArrowRight } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

export default function OnboardingWelcome() {
  const pulseScale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in animation
    opacity.value = withTiming(1, { duration: 1000 });
    
    // Pulsing shield animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedShieldStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, animatedContainerStyle]}>
        <View style={styles.logoSection}>
          <Animated.View style={[styles.logoContainer, animatedShieldStyle]}>
            <Shield size={120} color="#ad2831" strokeWidth={2} />
          </Animated.View>
          <Text style={styles.appName}>Zicom</Text>
          <Text style={styles.tagline}>Personal Safety Guardian</Text>
        </View>

        <View style={styles.messageSection}>
          <Text style={styles.welcomeTitle}>Welcome to Your Safety Network</Text>
          <Text style={styles.welcomeDescription}>
            Zicom is designed to keep you safe during emergencies. With instant alerts, 
            location sharing, and evidence capture, help is always within reach.
          </Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>Instant emergency activation</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>Automatic location sharing</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>Evidence capture and storage</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>Multiple emergency contacts</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionSection}>
          <Pressable
            style={styles.getStartedButton}
            onPress={() => router.push('/onboarding/permissions')}
            accessible={true}
            accessibilityLabel="Get started with Zicom setup"
            accessibilityRole="button"
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <ArrowRight size={24} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
          
          <Text style={styles.disclaimer}>
            This app is designed to assist in emergencies but should not replace 
            professional emergency services. Always call 911 for immediate help.
          </Text>
        </View>
      </Animated.View>
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
    minHeight: '150%', // extend content beyond screen height
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 200,
    backgroundColor: '#FAFAFA',
    justifyContent: 'flex-start',
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
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
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
  },
  activeAlert: {
    backgroundColor: '#ad2831',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    alignItems: 'center',
    marginTop: 20,
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
    paddingTop: 32,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#250902',
    marginBottom: 16,
  },
  quickActionsSection: {
    marginBottom: 32,
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
  getStartedSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  getStartedText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 40,
    alignItems: 'center',
    rowGap: 16,
  },
  footerSection: {
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
  },
});
