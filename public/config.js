// Configuration file
// Your API credentials (stored in .env for reference)
const CONFIG = {
  supabase: {
    url: "YOUR_SUPABASE_URL",
    anonKey: "YOUR_SUPABASE_ANON_KEY",
  },
  apis: {
    // Optional: Add API keys for SoundCloud/Spotify integration
    soundcloud: {
      clientId: "YOUR_SOUNDCLOUD_CLIENT_ID", // Get from https://soundcloud.com/you/apps
    },
    spotify: {
      clientId: "d61c6757f2034c90a0d06541ca23e668",
      clientSecret: "8d27bf9d70f34bb09486c331db832ed4",
    },
  },
};
