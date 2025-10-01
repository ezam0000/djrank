require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(express.static("public"));

// Serve config with environment variables
app.get("/api/config", (req, res) => {
  res.json({
    apis: {
      soundcloud: {
        clientId: process.env.SOUNDCLOUD_CLIENT_ID || "YOUR_SOUNDCLOUD_CLIENT_ID"
      },
      spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET
      }
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🎧 DJ Rank server running at http://localhost:${PORT}`);
  console.log(`📱 Clear data: http://localhost:${PORT}/clear-data.html`);
});
