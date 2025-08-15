import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.timetracker.app',
  appName: 'Time Tracker',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#10b981',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#10b981'
    }
  },
  android: {
    allowMixedContent: true
  },
  ios: {
    scheme: 'Time Tracker'
  }
};

export default config;