import { supabase } from '@/config/supabase';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface EmergencyRecord {
  id?: string;
  user_id: string;
  user_name?: string;
  user_phone?: string;
  timestamp: string;
  file_url: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  device_info: {
    platform: string;
    user_agent?: string;
    app_version: string;
  };
  emergency_contacts: Array<{
    name: string;
    phone: string;
    relationship: string;
    notified: boolean;
    notification_time?: string;
  }>;
  status: 'active' | 'completed' | 'cancelled';
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class SupabaseService {
  // Authentication Methods
  async signUp(email: string, password: string, fullName: string, phoneNumber: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) throw error;
    
    // Create user profile with name and phone number
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            full_name: fullName,
            phone_number: phoneNumber,
          });
        
        if (profileError) {
          console.error('Failed to create user profile:', profileError);
        }
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }
    
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  // Emergency Recording Methods
  async createEmergencyRecord(
    location?: { latitude: number; longitude: number },
    emergencyContacts: Array<{ name: string; phone: string; relationship: string }> = [],
    userName?: string,
    userPhone?: string
  ): Promise<string> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const emergencyData: Omit<EmergencyRecord, 'id'> = {
        user_id: user.id,
        user_name: userName || null,
        user_phone: userPhone || null,
        timestamp: new Date().toISOString(),
        file_url: '', // Will be updated after file upload
        location,
        device_info: {
          platform: Platform.OS,
          user_agent: Platform.OS === 'web' ? navigator.userAgent : undefined,
          app_version: '1.0.0',
        },
        emergency_contacts: emergencyContacts.map(contact => ({
          ...contact,
          notified: false,
        })),
        status: 'active',
      };

      const { data, error } = await supabase
        .from('recordings')
        .insert(emergencyData)
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to create emergency record:', error);
      throw error;
    }
  }

  async updateEmergencyRecord(recordId: string, updates: Partial<EmergencyRecord>): Promise<void> {
    try {
      const { error } = await supabase
        .from('recordings')
        .update(updates)
        .eq('id', recordId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update emergency record:', error);
      throw error;
    }
  }

  // Media Upload Methods
 // Media Upload Methods
async uploadRecording(
  recordId: string,
  fileUri: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  try {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}.mp4`;

    let fileData: any;

    if (Platform.OS === 'web') {
      // Web: Convert blob URL to ArrayBuffer
      const response = await fetch(fileUri);
      fileData = await response.arrayBuffer();
    } else {
      // React Native: Read file and convert to Uint8Array
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Convert base64 to binary Uint8Array for upload
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileData = bytes;
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('recordings')
      .upload(fileName, fileData, {
        contentType: 'video/mp4',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('recordings')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Update emergency record with file URL
    await this.updateEmergencyRecord(recordId, {
      file_url: publicUrl,
    });

    return publicUrl;
  } catch (error) {
    console.error('Failed to upload recording:', error);
    throw error;
  }
}


  // Query Methods
  async getUserEmergencyRecords(userId: string): Promise<EmergencyRecord[]> {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch emergency records:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToEmergencyRecords(userId: string, callback: (records: EmergencyRecord[]) => void) {
    return supabase
      .channel('emergency_records')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recordings',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refetch records when changes occur
          this.getUserEmergencyRecords(userId).then(callback);
        }
      )
      .subscribe();
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;