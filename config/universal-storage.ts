import { Platform } from 'react-native';

let universalStorage: any;

// Check if we're in a browser environment (web platform with window object)
if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
  // Web: Use localStorage
  universalStorage = {
    getItem: async (key: string) => window.localStorage.getItem(key),
    setItem: async (key: string, value: string) => window.localStorage.setItem(key, value),
    removeItem: async (key: string) => window.localStorage.removeItem(key),
  };
} else if (Platform.OS !== 'web') {
  // Native (iOS/Android): Use AsyncStorage
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    universalStorage = AsyncStorage;
  } catch (e) {
    // Fallback if AsyncStorage is not available
    universalStorage = {
      getItem: async (_key: string) => null,
      setItem: async (_key: string, _value: string) => {},
      removeItem: async (_key: string) => {},
    };
  }
} else {
  // Node.js/SSR environment (web platform without window): Use no-op storage
  universalStorage = {
    getItem: async (_key: string) => null,
    setItem: async (_key: string, _value: string) => {},
    removeItem: async (_key: string) => {},
  };
}

export default universalStorage;