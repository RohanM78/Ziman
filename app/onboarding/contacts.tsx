import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  Pressable, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  Alert 
} from 'react-native';
import { router } from 'expo-router';
import { 
  UserPlus, 
  ArrowLeft, 
  ArrowRight 
} from 'lucide-react-native';
import { ContactCard } from '@/components/ContactCard';
import { useAppSettings } from '@/hooks/useAppSettings';

export default function OnboardingContacts() {
  const { settings, addEmergencyContact, removeEmergencyContact } = useAppSettings();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  const relationships = [
    'Spouse/Partner',
    'Parent',
    'Child',
    'Sibling',
    'Friend',
    'Colleague',
    'Other Family',
    'Emergency Contact',
  ];

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim() || !newContact.relationship.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields to add an emergency contact.');
      return;
    }

    if (settings.emergencyContacts.length >= 3) {
      Alert.alert('Maximum Contacts', 'You can add up to 3 emergency contacts.');
      return;
    }

    try {
      await addEmergencyContact(newContact);
      setNewContact({ name: '', phone: '', relationship: '' });
      setShowAddForm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add emergency contact. Please try again.');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeEmergencyContact(contactId)
        },
      ]
    );
  };

  const handleContinue = () => {
    if (settings.emergencyContacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'We recommend adding at least one emergency contact for your safety. Are you sure you want to continue?',
        [
          { text: 'Add Contact', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => router.push('/onboarding/tutorial')
          },
        ]
      );
      return;
    }
    router.push('/onboarding/tutorial');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#250902" strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Add Emergency Contacts</Text>
        <Text style={styles.description}>
          These contacts will be automatically notified during emergencies. 
          You can add up to 3 contacts.
        </Text>

        {settings.emergencyContacts.length > 0 && (
          <View style={styles.contactsList}>
            <Text style={styles.sectionTitle}>Your Emergency Contacts ({settings.emergencyContacts.length}/3)</Text>
            {settings.emergencyContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onDelete={handleRemoveContact}
                showDelete={true}
              />
            ))}
          </View>
        )}

        {settings.emergencyContacts.length < 3 && (
          <View style={styles.addContactSection}>
            {!showAddForm ? (
              <Pressable
                style={styles.addContactButton}
                onPress={() => setShowAddForm(true)}
              >
                <UserPlus size={24} color="#ad2831" strokeWidth={2} />
                <Text style={styles.addContactText}>Add Emergency Contact</Text>
              </Pressable>
            ) : (
              <View style={styles.addContactForm}>
                <Text style={styles.formTitle}>New Emergency Contact</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newContact.name}
                    onChangeText={(text) => setNewContact({ ...newContact, name: text })}
                    placeholder="Enter full name"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newContact.phone}
                    onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Relationship *</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.relationshipScroll}
                  >
                    {relationships.map((relationship) => (
                      <Pressable
                        key={relationship}
                        style={[
                          styles.relationshipChip,
                          newContact.relationship === relationship && styles.relationshipChipSelected
                        ]}
                        onPress={() => setNewContact({ ...newContact, relationship })}
                      >
                        <Text style={[
                          styles.relationshipChipText,
                          newContact.relationship === relationship && styles.relationshipChipTextSelected
                        ]}>
                          {relationship}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.formActions}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowAddForm(false);
                      setNewContact({ name: '', phone: '', relationship: '' });
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.saveButton}
                    onPress={handleAddContact}
                  >
                    <Text style={styles.saveButtonText}>Add Contact</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <ArrowRight size={24} color="#FFFFFF" strokeWidth={2} />
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#250902',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    lineHeight: 24,
    marginBottom: 32,
  },
  contactsList: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#250902',
    marginBottom: 16,
  },
  addContactSection: {
    marginBottom: 32,
  },
  addContactButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ad2831',
    borderStyle: 'dashed',
  },
  addContactText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ad2831',
    marginLeft: 12,
  },
  addContactForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#250902',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#250902',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#250902',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  relationshipScroll: {
    marginTop: 8,
  },
  relationshipChip: {
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  relationshipChipSelected: {
    backgroundColor: '#ad2831',
    borderColor: '#ad2831',
  },
  relationshipChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  relationshipChipTextSelected: {
    color: '#FFFFFF',
  },
  formActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#ad2831',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  continueButton: {
    backgroundColor: '#ad2831',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginRight: 12,
  },
});