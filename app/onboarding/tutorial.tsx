import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  SafeAreaView,
  Dimensions 
} from 'react-native';
import { router } from 'expo-router';
import { 
  Smartphone, 
  Shield, 
  MapPin, 
  ArrowLeft, 
  Check 
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';

const { width } = Dimensions.get('window');

const tutorialSteps = [
  {
    id: 1,
    icon: Smartphone,
    title: 'Power Button Activation',
    description: 'Press your power button 4 times quickly to trigger an emergency alert. This works even when your phone is locked.',
    animation: 'pulse',
  },
  {
    id: 2,
    icon: Shield,
    title: 'App Activation',
    description: 'Open Zicom and tap the large emergency button to manually activate the safety protocol.',
    animation: 'bounce',
  },
  {
    id: 3,
    icon: MapPin,
    title: 'Automatic Response',
    description: 'When activated, Zicom will capture evidence, get your location, and alert your emergency contacts automatically.',
    animation: 'slide',
  },
];

export default function OnboardingTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useAppSettings();
  
  const animationValue = useSharedValue(1);

  useEffect(() => {
    const step = tutorialSteps[currentStep];
    
    if (step.animation === 'pulse') {
      animationValue.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
    } else if (step.animation === 'bounce') {
      animationValue.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 300 }),
          withTiming(1.1, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1,
        false
      );
    } else {
      animationValue.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    }
  }, [currentStep]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animationValue.value }],
  }));

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : router.back()}
        >
          <ArrowLeft size={24} color="#250902" strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Tutorial</Text>
        <Pressable
          style={styles.skipButton}
          onPress={handleComplete}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {tutorialSteps.length}
          </Text>
        </View>

        <View style={styles.tutorialSection}>
          <Animated.View style={[styles.iconContainer, animatedStyle]}>
            <currentTutorial.icon size={80} color="#ad2831" strokeWidth={2} />
          </Animated.View>
          
          <Text style={styles.tutorialTitle}>{currentTutorial.title}</Text>
          <Text style={styles.tutorialDescription}>{currentTutorial.description}</Text>
          
          {currentStep === 0 && (
            <View style={styles.demonstrationContainer}>
              <Text style={styles.demonstrationTitle}>Try it now:</Text>
              <View style={styles.powerButtonDemo}>
                <Text style={styles.demoText}>Press your power button 4 times quickly</Text>
                <View style={styles.buttonSequence}>
                  {[1, 2, 3, 4].map((num) => (
                    <View key={num} style={styles.demoButton}>
                      <Text style={styles.demoButtonText}>{num}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.stepIndicators}>
          {tutorialSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepIndicator,
                index === currentStep && styles.stepIndicatorActive,
                index < currentStep && styles.stepIndicatorCompleted,
              ]}
            >
              {index < currentStep && (
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Get Started'}
          </Text>
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
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ad2831',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  progressContainer: {
    marginBottom: 48,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#EEEEEE',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ad2831',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
    textAlign: 'center',
  },
  tutorialSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    backgroundColor: '#FFEAEA',
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#ad2831',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  tutorialTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#250902',
    textAlign: 'center',
    marginBottom: 16,
  },
  tutorialDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  demonstrationContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  demonstrationTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#250902',
    marginBottom: 16,
  },
  powerButtonDemo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  demoText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonSequence: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ad2831',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  demoButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  stepIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicatorActive: {
    backgroundColor: '#ad2831',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  stepIndicatorCompleted: {
    backgroundColor: '#4CAF50',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  nextButton: {
    backgroundColor: '#ad2831',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});