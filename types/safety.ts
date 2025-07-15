export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface EmergencyEvent {
  id: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  mediaFiles: string[];
  contactsNotified: string[];
  status: 'active' | 'completed' | 'cancelled';
}

export interface AppSettings {
  emergencyContacts: EmergencyContact[];
  powerButtonSensitivity: number; // 2-5 seconds
  backgroundMonitoring: boolean;
  locationServices: boolean;
  isFirstLaunch: boolean;
}

export interface SystemStatus {
  location: boolean;
  camera: boolean;
  microphone: boolean;
  contacts: boolean;
  backgroundApp: boolean;
}