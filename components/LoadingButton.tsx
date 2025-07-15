import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

interface LoadingButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  title: string;
  loadingTitle?: string;
  icon?: React.ReactNode;
  style?: any;
  textStyle?: any;
}

export function LoadingButton({
  onPress,
  loading = false,
  disabled = false,
  title,
  loadingTitle,
  icon,
  style,
  textStyle,
}: LoadingButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <Pressable
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          icon
        )}
        <Text style={[styles.text, textStyle]}>
          {loading ? (loadingTitle || title) : title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ad2831',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: '#ad2831',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});