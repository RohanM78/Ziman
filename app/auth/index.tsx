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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: height * 0.06,
  },
  logoContainer: {
    width: 140,
    height: 140,
    backgroundColor: '#FFEAEA',
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#ad2831',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 38,
    fontFamily: 'Inter-Bold',
    color: '#250902',
    marginBottom: 8,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ad2831',
    textAlign: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: height * 0.08,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#250902',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  welcomeDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  authOptions: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  signUpButton: {
    backgroundColor: '#ad2831',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#ad2831',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signUpButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  signUpButtonSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  signInButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ad2831',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ad2831',
    marginTop: 8,
  },
  signInButtonSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
  },
});