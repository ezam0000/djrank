require("dotenv").config({ path: ".env.local" });
require("dotenv").config(); // Fallback to .env
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3003;

// Increase body size limit for base64 images/videos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));

// Serve config with environment variables
app.get("/api/config", (req, res) => {
  res.json({
    apis: {
      soundcloud: {
        clientId:
          process.env.SOUNDCLOUD_CLIENT_ID || "YOUR_SOUNDCLOUD_CLIENT_ID",
      },
      spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      },
    },
  });
});

// API endpoint for DJs (Postgres)
const djsHandler = require("./api/djs");
app.all("/api/djs", djsHandler);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🎧 DJ Rank server running at http://localhost:${PORT}`);
  console.log(`📱 Clear data: http://localhost:${PORT}/clear-data.html`);
});
