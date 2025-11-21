import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length) {
  console.warn(
    `Firebase configuration is missing the following keys: ${missingKeys.join(', ')}. ` +
      'Ensure they are defined in your .env file.'
  );
}

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

declare global {
  // eslint-disable-next-line no-var
  var __firebaseAuth: Auth | undefined;
}

if (!globalThis.__firebaseAuth) {
  const authInstance =
    Platform.OS === 'web'
      ? getAuth(app)
      : initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });

  globalThis.__firebaseAuth = authInstance;
}

const auth: Auth = globalThis.__firebaseAuth;

export { app, auth };
