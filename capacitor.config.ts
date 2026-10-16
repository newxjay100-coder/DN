import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dongnae.app",
  appName: "동내 (DONGNAE)",
  webDir: "out",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#FFFFFF",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#FFFFFF",
    },
  },
};

export default config;
