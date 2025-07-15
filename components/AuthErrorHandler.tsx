import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleAlert as AlertCircle } from 'lucide-react-native';

interface AuthErrorHandlerProps {
  error: string | null;
  style?: any;
}

export function AuthErrorHandler({ error, style }: AuthErrorHandlerProps) {
  if (!error) return null;

  return (
    <View style={[styles.container, style]}>
      <AlertCircle size={16} color="#F44336" strokeWidth={2} />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F44336',
    marginLeft: 8,
    flex: 1,
  },
});