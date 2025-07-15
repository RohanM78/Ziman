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
    width: 160,
    height: 160,
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
    fontSize: 48,
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
  messageSection: {
    flex: 1,
    justifyContent: 'center',
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
    marginBottom: 32,
  },
  featureList: {
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ad2831',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#250902',
    flex: 1,
  },
  actionSection: {
    marginTop: 32,
  },
  getStartedButton: {
    backgroundColor: '#ad2831',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#ad2831',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginRight: 12,
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});