import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';

interface StatusIndicatorProps {
  label: string;
  status: 'active' | 'inactive' | 'warning';
  description?: string;
}

export function StatusIndicator({ label, status, description }: StatusIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <CheckCircle size={24} color="#4CAF50" strokeWidth={2} />;
      case 'warning':
        return <AlertCircle size={24} color="#FF9800" strokeWidth={2} />;
      case 'inactive':
      default:
        return <XCircle size={24} color="#F44336" strokeWidth={2} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'inactive':
      default:
        return '#F44336';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {getStatusIcon()}
        <Text style={styles.label}>{label}</Text>
      </View>
      {description && (
        <Text style={[styles.description, { color: getStatusColor() }]}>
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ad2831',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#250902',
    marginLeft: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 36,
  },
});