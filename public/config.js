// Configuration file
// API credentials loaded from server environment variables
let CONFIG = {
  apis: {
    soundcloud: {
      clientId: "YOUR_SOUNDCLOUD_CLIENT_ID"
    },
    spotify: {
      clientId: "",
      clientSecret: ""
    }
  }
};

// Promise that resolves when config is loaded
const configReady = (async () => {
  try {
    const response = await fetch('/api/config');
    const serverConfig = await response.json();
    CONFIG = serverConfig;
    console.log('✅ Configuration loaded from environment');
    return CONFIG;
  } catch (error) {
    console.error('❌ Failed to load config:', error);
    return CONFIG;
  }
})();
