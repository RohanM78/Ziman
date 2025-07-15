import { useState, useEffect } from 'react';
import universalStorage from '@/config/universal-storage';
import { AppSettings, EmergencyContact } from '@/types/safety';

const DEFAULT_SETTINGS: AppSettings = {
  emergencyContacts: [],
  powerButtonSensitivity: 3,
  backgroundMonitoring: true,
  locationServices: true,
  isFirstLaunch: true,
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await universalStorage.getItem('zicom_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await universalStorage.setItem('zicom_settings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const addEmergencyContact = async (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: Date.now().toString(),
    };

    const updatedContacts = [...settings.emergencyContacts, newContact];
    await saveSettings({ emergencyContacts: updatedContacts });
  };

  const removeEmergencyContact = async (contactId: string) => {
    const updatedContacts = settings.emergencyContacts.filter(
      (c) => c.id !== contactId
    );
    await saveSettings({ emergencyContacts: updatedContacts });
  };

  const completeOnboarding = async () => {
    await saveSettings({ isFirstLaunch: false });
  };

  return {
    settings,
    isLoading,
    saveSettings,
    addEmergencyContact,
    removeEmergencyContact,
    completeOnboarding,
  };
}
