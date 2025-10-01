// API Service for fetching artist data from SoundCloud and Spotify

const APIService = {
  // Search SoundCloud for artists
  async searchSoundCloud(query) {
    const clientId = CONFIG.apis.soundcloud.clientId;

    if (!clientId || clientId === "YOUR_SOUNDCLOUD_CLIENT_ID") {
      console.warn("SoundCloud API not configured");
      return [];
    }

    try {
      const response = await fetch(
        `https://api.soundcloud.com/users?q=${encodeURIComponent(
          query
        )}&client_id=${clientId}`
      );

      if (!response.ok) throw new Error("SoundCloud API error");

      const data = await response.json();
      return data.map((user) => ({
        source: "soundcloud",
        id: user.id,
        name: user.username,
        image:
          user.avatar_url?.replace("-large", "-t500x500") || user.avatar_url,
        bio: user.description || "",
        url: user.permalink_url,
        followers: user.followers_count,
      }));
    } catch (error) {
      console.error("SoundCloud search error:", error);
      return [];
    }
  },

  // Search Spotify for artists
  async searchSpotify(query) {
    const clientId = CONFIG.apis.spotify.clientId;
    const clientSecret = CONFIG.apis.spotify.clientSecret;

    if (!clientId || clientId === "YOUR_SPOTIFY_CLIENT_ID") {
      console.warn("Spotify API not configured");
      return [];
    }

    try {
      // Get access token
      const tokenResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
          },
          body: "grant_type=client_credentials",
        }
      );

      const { access_token } = await tokenResponse.json();

      // Search for artists
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=artist&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const data = await searchResponse.json();

      return data.artists.items.map((artist) => ({
        source: "spotify",
        id: artist.id,
        name: artist.name,
        image: artist.images[0]?.url || "",
        bio: `${artist.genres.join(", ")}`,
        url: artist.external_urls.spotify,
        followers: artist.followers.total,
        genres: artist.genres,
      }));
    } catch (error) {
      console.error("Spotify search error:", error);
      return [];
    }
  },

  // Combined search across platforms
  async searchArtists(query) {
    if (!query || query.trim().length < 2) return [];

    const [soundcloudResults, spotifyResults] = await Promise.all([
      this.searchSoundCloud(query),
      this.searchSpotify(query),
    ]);

    // Combine and sort by followers
    const combined = [...soundcloudResults, ...spotifyResults];
    return combined.sort((a, b) => (b.followers || 0) - (a.followers || 0));
  },

  // Load Vegas 2025 DJs from JSON file
  async loadVegasDJs() {
    try {
      const response = await fetch("/data/vegas-djs-2025.json");
      if (!response.ok) {
        console.warn("Could not load Vegas DJs, using fallback");
        return this.getSampleDJs();
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error loading Vegas DJs:", error);
      return this.getSampleDJs();
    }
  },

  // Get sample/demo DJs (fallback)
  getSampleDJs() {
    return [
      {
        id: "demo-1",
        name: "Demo DJ 1",
        bio: "Sample DJ for demonstration",
        image: "https://via.placeholder.com/300/667/fff?text=DJ+1",
        soundcloud_url: "",
        spotify_url: "",
        apple_music_url: "",
        tier: null,
        criteria: { flow: 0, vibes: 0, visuals: 0, guests: 0 },
        notes: "",
        photos: [],
        videos: [],
      },
      {
        id: "demo-2",
        name: "Demo DJ 2",
        bio: "Sample DJ for demonstration",
        image: "https://via.placeholder.com/300/764/fff?text=DJ+2",
        soundcloud_url: "",
        spotify_url: "",
        apple_music_url: "",
        tier: null,
        criteria: { flow: 0, vibes: 0, visuals: 0, guests: 0 },
        notes: "",
        photos: [],
        videos: [],
      },
      {
        id: "demo-3",
        name: "Demo DJ 3",
        bio: "Sample DJ for demonstration",
        image: "https://via.placeholder.com/300/e74/fff?text=DJ+3",
        soundcloud_url: "",
        spotify_url: "",
        apple_music_url: "",
        tier: null,
        criteria: { flow: 0, vibes: 0, visuals: 0, guests: 0 },
        notes: "",
        photos: [],
        videos: [],
      },
    ];
  },

  // Fetch artist image from Spotify (if configured)
  async fetchArtistImage(artistName) {
    const clientId = CONFIG.apis.spotify.clientId;
    const clientSecret = CONFIG.apis.spotify.clientSecret;

    if (!clientId || clientId === "YOUR_SPOTIFY_CLIENT_ID") {
      return null;
    }

    try {
      // Get access token
      const tokenResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
          },
          body: "grant_type=client_credentials",
        }
      );

      const { access_token } = await tokenResponse.json();

      // Search for artist
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          artistName
        )}&type=artist&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const data = await searchResponse.json();
      return data.artists.items[0]?.images[0]?.url || null;
    } catch (error) {
      console.error("Error fetching artist image:", error);
      return null;
    }
  },
};
