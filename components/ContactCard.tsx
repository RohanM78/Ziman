import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { User, Phone, Trash2 } from 'lucide-react-native';
import { EmergencyContact } from '@/types/safety';

interface ContactCardProps {
  contact: EmergencyContact;
  onDelete?: (contactId: string) => void;
  showDelete?: boolean;
}

export function ContactCard({ contact, onDelete, showDelete = false }: ContactCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <User size={24} color="#ad2831" strokeWidth={2} />
      </View>
      
      <View style={styles.contactInfo}>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.relationship}>{contact.relationship}</Text>
        <View style={styles.phoneContainer}>
          <Phone size={16} color="#666666" strokeWidth={2} />
          <Text style={styles.phone}>{contact.phone}</Text>
        </View>
      </View>
      
      {showDelete && onDelete && (
        <Pressable
          style={styles.deleteButton}
          onPress={() => onDelete(contact.id)}
          accessible={true}
          accessibilityLabel={`Delete contact ${contact.name}`}
          accessibilityRole="button"
        >
          <Trash2 size={20} color="#F44336" strokeWidth={2} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#250902',
    marginBottom: 4,
  },
  relationship: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ad2831',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 6,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});