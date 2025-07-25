import { useState, useCallback, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { EmergencyEvent, EmergencyContact } from '@/types/safety';
import { supabaseService } from '@/services/supabaseService';
import { useSupabaseAuth } from './useSupabaseAuth';
import { supabase } from '@/config/supabase';

export function useEmergencySystem() {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [emergencyEvent, setEmergencyEvent] = useState<EmergencyEvent | null>(null);
  const [emergencyProgress, setEmergencyProgress] = useState(0);
  const emergencyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { ensureAuthenticated } = useSupabaseAuth();

  const triggerEmergency = useCallback(async (contacts: EmergencyContact[]) => {
    if (isEmergencyActive) return;

    // Haptic feedback for native platforms
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setIsEmergencyActive(true);
    setEmergencyProgress(10);

   try {
  // Ensure user is authenticated
  await ensureAuthenticated();
} catch (error) {
  console.error('Authentication error:', error);
  Alert.alert('Auth Error', 'Could not verify user authentication.');
  return;
}

      // Fetch user profile information for contact details
// Fetch user profile information for contact details
setEmergencyProgress(15);
let userName: string | undefined;
let userPhone: string | undefined;

try {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, phone_number')
    .single();

  userName = profile?.full_name || undefined;
  userPhone = profile?.phone_number || undefined;
} catch (profileError) {
  console.warn('Failed to fetch user profile:', profileError);

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn('Failed to fetch authenticated user:', userError);
    } else {
      userName =
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Zicom User';

      userPhone =
        user.user_metadata?.phone ||
        null;

      const { error: profileUpsertError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: userName,
          phone_number: userPhone,
        });

      if (profileUpsertError) {
        console.error('Failed to upsert user profile:', profileUpsertError);
      }
    }
  } catch (fallbackError) {
    console.error('Error syncing user metadata to profile:', fallbackError);
  }



      // Get current location
  setEmergencyProgress(25);
      let location;
      try {
        const locationResult = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
        });
        location = {
          latitude: locationResult.coords.latitude,
          longitude: locationResult.coords.longitude,
        };
      } catch (error) {
        console.error('Failed to get location:', error);
      }

      // Create emergency record in Supabase
      setEmergencyProgress(35);
      const recordId = await supabaseService.createEmergencyRecord(
        location, 
        contacts, 
        userName, 
        userPhone
      );

      // Create emergency event
      const event: EmergencyEvent = {
        id: recordId,
        timestamp: new Date(),
        location,
        mediaFiles: [],
        contactsNotified: [],
        status: 'active',
      };

      setEmergencyEvent(event);
      setEmergencyProgress(45);

      // Media capture will be handled by EmergencyRecorder component
      // This allows for real-time progress updates

      // Send SMS alerts to emergency contacts
      setEmergencyProgress(85);
      await notifyEmergencyContacts(contacts, event);

      // Mark event as completed
      setEmergencyProgress(100);
      await supabaseService.updateEmergencyRecord(recordId, {
        status: 'completed',
        emergency_contacts: contacts.map(c => ({
          name: c.name,
          phone: c.phone,
          relationship: c.relationship,
          notified: true,
          notification_time: new Date().toISOString(),
        })),
      });

      setEmergencyEvent(prev => prev ? { ...prev, status: 'completed' } : null);

    } catch (error) {
      console.error('Emergency system error:', error);
      Alert.alert('Emergency Error', 'Failed to complete emergency protocol. Please call emergency services directly.');
      setIsEmergencyActive(false);
      setEmergencyProgress(0);
    } finally {
      // Auto-deactivate after 2 minutes
      emergencyTimeoutRef.current = setTimeout(() => {
        setIsEmergencyActive(false);
        setEmergencyEvent(null);
        setEmergencyProgress(0);
      }, 120000);
    }
  }, [isEmergencyActive, ensureAuthenticated]);

  const cancelEmergency = useCallback(async () => {
    if (emergencyTimeoutRef.current) {
      clearTimeout(emergencyTimeoutRef.current);
    }
    
    if (emergencyEvent?.id) {
      try {
        await supabaseService.updateEmergencyRecord(emergencyEvent.id, {
          status: 'cancelled',
        });
      } catch (error) {
        console.error('Failed to update emergency record:', error);
      }
    }
    
    setIsEmergencyActive(false);
    setEmergencyEvent(prev => prev ? { ...prev, status: 'cancelled' } : null);
    setEmergencyProgress(0);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [emergencyEvent]);

  const notifyEmergencyContacts = async (contacts: EmergencyContact[], event: EmergencyEvent) => {
    // Get user info for emergency message
    let userName = 'A Zicom user';
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'A Zicom user';
    } catch (error) {
      console.warn('Failed to get user name for emergency message:', error);
    }

    for (const contact of contacts) {
      try {
        const locationText = event.location 
          ? `https://maps.google.com/?q=${event.location.latitude},${event.location.longitude}`
          : 'Location unavailable';

        const message = `🚨 EMERGENCY ALERT from Zicom Safety 🚨\n\n${userName} may need immediate assistance.\n\nTime: ${event.timestamp.toLocaleString()}\nLocation: ${locationText}\n\nThis is an automated emergency message. Please check on them immediately or contact emergency services if needed.`;

        if (Platform.OS === 'web') {
          // Web: Use API route for SMS
          await fetch('/api/send-sms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: contact.phone,
              message,
            }),
          });
        } else {
          // Native: Use Expo SMS
          const { SMS } = await import('expo-sms');
          const isAvailable = await SMS.isAvailableAsync();
          
          if (isAvailable) {
            await SMS.sendSMSAsync([contact.phone], message);
          } else {
            console.warn('SMS not available on this device');
          }
        }

      } catch (error) {
        console.error(`Failed to notify ${contact.name}:`, error);
      }
    }
  };

  const handleRecordingComplete = useCallback(async (mediaUrl: string) => {
    if (emergencyEvent?.id) {
      try {
        await supabaseService.updateEmergencyRecord(emergencyEvent.id, {
          file_url: mediaUrl,
        });
        
        setEmergencyEvent(prev => prev ? {
          ...prev,
          mediaFiles: [mediaUrl],
        } : null);
      } catch (error) {
        console.error('Failed to update media files:', error);
      }
    }
  }, [emergencyEvent]);

  return {
    isEmergencyActive,
    emergencyEvent,
    emergencyProgress,
    triggerEmergency,
    cancelEmergency,
    handleRecordingComplete,
  };
}