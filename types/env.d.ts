declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      EXPO_PUBLIC_TWILIO_ACCOUNT_SID: string;
      EXPO_PUBLIC_TWILIO_AUTH_TOKEN: string;
      EXPO_PUBLIC_TWILIO_PHONE_NUMBER: string;
    }
  }
}

export {};