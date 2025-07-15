import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  Dimensions,
  Platform 
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Shield, ShieldAlert } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = width * 0.8;

interface SafetyButtonProps {
  isActive: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
}

export function SafetyButton({ isActive, onPress, onLongPress, disabled }: SafetyButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    setIsPressed(true);
    scale.value = withSpring(0.95);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (disabled) return;
    
    // Pulse animation
    opacity.value = withSequence(
      withTiming(0.7, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    onPress();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.buttonWrapper, animatedStyle]}>
        <Pressable
          style={[
            styles.button,
            isActive && styles.buttonActive,
            disabled && styles.buttonDisabled,
            isPressed && styles.buttonPressed,
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          onLongPress={onLongPress}
          disabled={disabled}
          accessible={true}
          accessibilityLabel={isActive ? "Deactivate emergency mode" : "Activate emergency mode"}
          accessibilityHint="Double tap to activate emergency protocol"
          accessibilityRole="button"
        >
          <View style={styles.iconContainer}>
            {isActive ? (
              <ShieldAlert 
                size={80} 
                color="#FFFFFF" 
                strokeWidth={2}
              />
            ) : (
              <Shield 
                size={80} 
                color={disabled ? '#666666' : '#FFFFFF'} 
                strokeWidth={2}
              />
            )}
          </View>
          
          <Text style={[
            styles.buttonText,
            isActive && styles.buttonTextActive,
            disabled && styles.buttonTextDisabled,
          ]}>
            {isActive ? 'EMERGENCY ACTIVE' : 'EMERGENCY'}
          </Text>
          
          <Text style={[
            styles.subText,
            isActive && styles.subTextActive,
            disabled && styles.subTextDisabled,
          ]}>
            {isActive ? 'Recording in progress...' : 'Tap to activate emergency'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#250902',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ad2831',
    padding: 20,
  },
  buttonActive: {
    backgroundColor: '#ad2831',
    borderColor: '#FFFFFF',
  },
  buttonDisabled: {
    backgroundColor: '#666666',
    borderColor: '#999999',
  },
  buttonPressed: {
    backgroundColor: '#8b1f26',
  },
  iconContainer: {
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: '#CCCCCC',
  },
  subText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#CCCCCC',
    textAlign: 'center',
  },
  subTextActive: {
    color: '#FFFFFF',
  },
  subTextDisabled: {
    color: '#999999',
  },
});