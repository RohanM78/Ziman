import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  Pressable, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { UserPlus, Phone, MessageSquare, CreditCard as Edit3, Trash2, CircleCheck as CheckCircle, Users } from 'lucide-react-native';
import { ContactCard } from '@/components/ContactCard';
import { useAppSettings } from '@/hooks/useAppSettings';
import { EmergencyContact } from '@/types/safety';

export default function ContactsScreen() {
  const { settings, addEmergencyContact, removeEmergencyContact } = useAppSettings();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
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

  const resetForm = () => {
    setNewContact({ name: '', phone: '', relationship: '' });
    setShowAddForm(false);
    setEditingContact(null);
  };

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim() || !newContact.relationship.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields to add an emergency contact.');
      return;
    }

    if (settings.emergencyContacts.length >= 3) {
      Alert.alert('Maximum Contacts', 'You can add up to 3 emergency contacts for optimal emergency response.');
      return;
    }

    try {
      await addEmergencyContact(newContact);
      resetForm();
      Alert.alert('Success', 'Emergency contact added successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to add emergency contact. Please try again.');
    }
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setNewContact({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
    });
    setShowAddForm(true);
  };

  const handleUpdateContact = async () => {
    if (!editingContact) return;

    if (!newContact.name.trim() || !newContact.phone.trim() || !newContact.relationship.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields to update the contact.');
      return;
    }

    try {
      // Remove the old contact and add the updated one
      await removeEmergencyContact(editingContact.id);
      await addEmergencyContact(newContact);
      resetForm();
      Alert.alert('Success', 'Emergency contact updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update emergency contact. Please try again.');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    const contact = settings.emergencyContacts.find(c => c.id === contactId);
    Alert.alert(
      'Remove Emergency Contact',
      `Are you sure you want to remove ${contact?.name} from your emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeEmergencyContact(contactId);
              Alert.alert('Removed', 'Emergency contact removed successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove contact. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleTestContact = (contact: EmergencyContact) => {
    Alert.alert(
      'Test Emergency Contact',
      `Test communication with ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            const phoneUrl = `tel:${contact.phone}`;
            Linking.canOpenURL(phoneUrl).then(supported => {
              if (supported) {
                Linking.openURL(phoneUrl);
              } else {
                Alert.alert('Error', 'Unable to make phone calls on this device.');
              }
            });
          }
        },
        { 
          text: 'SMS', 
          onPress: () => {
            const smsUrl = Platform.OS === 'ios' 
              ? `sms:${contact.phone}&body=This is a test message from Zicom Safety. Please confirm you received this.`
              : `sms:${contact.phone}?body=This is a test message from Zicom Safety. Please confirm you received this.`;
            
            Linking.canOpenURL(smsUrl).then(supported => {
              if (supported) {
                Linking.openURL(smsUrl);
              } else {
                Alert.alert('Error', 'Unable to send SMS on this device.');
              }
            });
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Users size={28} color="#ad2831" strokeWidth={2} />
          <Text style={styles.headerTitle}>Emergency Contacts</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Manage your trusted emergency contacts
        </Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {settings.emergencyContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={64} color="#CCCCCC" strokeWidth={1.5} />
            <Text style={styles.emptyStateTitle}>No Emergency Contacts</Text>
            <Text style={styles.emptyStateDescription}>
              Add trusted contacts who will be notified during emergencies. 
              You can add up to 3 emergency contacts.
            </Text>
          </View>
        ) : (
          <View style={styles.contactsList}>
            <View style={styles.contactsHeader}>
              <Text style={styles.contactsCount}>
                {settings.emergencyContacts.length} of 3 contacts
              </Text>
              <View style={styles.statusIndicator}>
                <CheckCircle size={16} color="#4CAF50" strokeWidth={2} />
                <Text style={styles.statusText}>Ready for emergencies</Text>
              </View>
            </View>

            {settings.emergencyContacts.map((contact, index) => (
              <View key={contact.id} style={styles.contactItemContainer}>
                <View style={styles.contactHeader}>
                  <Text style={styles.contactPriority}>Priority {index + 1}</Text>
                  <View style={styles.contactActions}>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleTestContact(contact)}
                    >
                      <Phone size={18} color="#4CAF50" strokeWidth={2} />
                    </Pressable>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleEditContact(contact)}
                    >
                      <Edit3 size={18} color="#2196F3" strokeWidth={2} />
                    </Pressable>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleRemoveContact(contact.id)}
                    >
                      <Trash2 size={18} color="#F44336" strokeWidth={2} />
                    </Pressable>
                  </View>
                </View>
                <ContactCard
                  contact={contact}
                  showDelete={false}
                />
              </View>
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
                <Text style={styles.addContactText}>
                  {settings.emergencyContacts.length === 0 ? 'Add Your First Contact' : 'Add Another Contact'}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.addContactForm}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>
                    {editingContact ? 'Edit Emergency Contact' : 'New Emergency Contact'}
                  </Text>
                  <Text style={styles.formSubtitle}>
                    {editingContact ? 'Update contact information' : 'Add a trusted person to notify during emergencies'}
                  </Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newContact.name}
                    onChangeText={(text) => setNewContact({ ...newContact, name: text })}
                    placeholder="Enter full name"
                    autoCapitalize="words"
                    maxLength={50}
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
                    maxLength={20}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Relationship *</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.relationshipScroll}
                    contentContainerStyle={styles.relationshipScrollContent}
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
                    onPress={resetForm}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.saveButton}
                    onPress={editingContact ? handleUpdateContact : handleAddContact}
                  >
                    <Text style={styles.saveButtonText}>
                      {editingContact ? 'Update Contact' : 'Add Contact'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Emergency Contact Guidelines</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>Choose contacts who are usually available and nearby</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>Inform your contacts they're listed as emergency contacts</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>Test communication regularly to ensure contact info is current</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>Contacts are notified in priority order during emergencies</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#250902',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#250902',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  contactsList: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactsCount: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#250902',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
    marginLeft: 6,
  },
  contactItemContainer: {
    marginBottom: 16,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactPriority: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ad2831',
  },
  contactActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addContactSection: {
    paddingHorizontal: 24,
    marginTop: 24,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#250902',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
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
  relationshipScrollContent: {
    paddingRight: 24,
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
  infoSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#250902',
    marginBottom: 16,
  },
  infoList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ad2831',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ad2831',
    marginTop: 7,
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    lineHeight: 20,
    flex: 1,
  },
});