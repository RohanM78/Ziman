import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Shield, UserPlus, LogIn } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

export default function AuthLandingScreen() {
  const pulseScale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in animation
    opacity.value = withTiming(1, { duration: 1000 });
    
    // Pulsing shield animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
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

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Your Safety Network</Text>
          <Text style={styles.welcomeDescription}>
            Join thousands of users who trust Zicom to keep them safe during emergencies.
            Get started in seconds.
          </Text>
        </View>

        <View style={styles.authOptions}>
          <Pressable
            style={styles.signUpButton}
            onPress={() => router.push('/auth/signup')}
            accessible={true}
            accessibilityLabel="Create new account"
            accessibilityRole="button"
          >
            <UserPlus size={24} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.signUpButtonText}>Create Account</Text>
            <Text style={styles.signUpButtonSubtext}>New to Zicom? Get started</Text>
          </Pressable>

          <Pressable
            style={styles.signInButton}
            onPress={() => router.push('/auth/login')}
            accessible={true}
            accessibilityLabel="Sign in to existing account"
            accessibilityRole="button"
          >
            <LogIn size={24} color="#ad2831" strokeWidth={2} />
            <Text style={styles.signInButtonText}>Sign In</Text>
            <Text style={styles.signInButtonSubtext}>Already have an account?</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
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
    flexGrow: 1,
    minHeight: '100%',
    paddingBottom: 120,
    paddingTop: 64,
    paddingHorizontal: 32,
    justifyContent: 'flex-start',
    alignItems: 'center',
    rowGap: 40,
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

