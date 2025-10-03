// API Service for fetching artist data from SoundCloud and Spotify

const APIService = {
  // Search SoundCloud for artists
  async searchSoundCloud(query) {
    const clientId = CONFIG.apis.soundcloud.clientId;

    if (!clientId || clientId === "YOUR_SOUNDCLOUD_CLIENT_ID") {
      return [];
    }

    try {
      const response = await fetch(
        `https://api.soundcloud.com/users?q=${encodeURIComponent(
          query
        )}&client_id=${clientId}`
      );

      if (!response.ok) return [];

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
      // Silently fail - SoundCloud is optional
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

    // Combine results
    const combined = [...soundcloudResults, ...spotifyResults];

    // Filter and rank by relevance - STRICT matching only
    const queryLower = query.toLowerCase().trim();

    const scoredResults = combined
      .filter((artist) => {
        // Only include if name contains the search query
        const nameLower = artist.name.toLowerCase();
        return nameLower.includes(queryLower);
      })
      .map((artist) => {
        const nameLower = artist.name.toLowerCase();
        let score = 0;

        // Exact match (highest priority)
        if (nameLower === queryLower) {
          score = 1000000 + (artist.followers || 0);
        }
        // Starts with query (high priority)
        else if (nameLower.startsWith(queryLower)) {
          score = 100000 + (artist.followers || 0);
        }
        // Contains query (medium priority)
        else if (nameLower.includes(queryLower)) {
          score = 10000 + (artist.followers || 0);
        }

        return { ...artist, score };
      });

    // Sort by score and limit results
    return scoredResults.sort((a, b) => b.score - a.score).slice(0, 10);
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
