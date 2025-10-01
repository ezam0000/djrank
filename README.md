# DJ RANK 🎧

Interactive web application for ranking DJs using a tier-based system with Spotify integration and secure admin authentication.

**Live Demo:** https://djrank.vercel.app

---

## ✨ Features

- **🎯 Tier Ranking** - Drag & drop DJs into S-F tiers
- **📊 Criteria Scoring** - Rate DJs on Flow, Vibes, Visuals, Guests (0-3 each)
- **🔍 Spotify Search** - Real-time artist search with photos and stats
- **🎵 Music Links** - Direct links to Spotify app/web and SoundCloud
- **📷 Media Galleries** - Upload photos/videos with lightbox viewing
- **🔐 Admin Authentication** - Secure token-based editing system
- **👁️ Public View** - Share rankings with read-only access
- **💾 Cloud Database** - Vercel Postgres for persistent storage
- **📱 Mobile-First** - Responsive design with touch gestures
- **🌙 Glassmorphism UI** - Dark mode with liquid glass effects

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/djrank.git
cd djrank
npm install
```

### 2. Configure Environment

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Or create .env.local manually:
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
ADMIN_SECRET=your_64_character_admin_token
POSTGRES_URL=your_postgres_connection_string
```

### 3. Run Locally

```bash
npm start
```

Open http://localhost:3003

---

## 🔐 Admin Access

### For Public Users:

- Browse all rankings
- View criteria breakdowns
- Click music links
- View photo/video galleries
- **Cannot edit**

### For Admin:

1. Triple-click "DJ RANK" logo
2. Enter your admin token
3. Full editing enabled

---

## 📊 Tier System

| Tier  | Score | Description               |
| ----- | ----- | ------------------------- |
| **S** | 11-12 | Elite - the absolute best |
| **A** | 9-10  | Excellent                 |
| **B** | 7-8   | Very good                 |
| **C** | 5-6   | Good                      |
| **D** | 3-4   | Average                   |
| **E** | 1-2   | Below average             |
| **F** | 0     | Needs improvement         |

### Criteria (0-3 points each):

- **Flow** - Mixing skills, track selection, energy
- **Vibes** - Atmosphere, crowd connection, presence
- **Visuals** - Production quality, lighting, aesthetic
- **Guests** - Featured artists and collaborations

---

## 🛠️ Tech Stack

**Frontend:**

- Vanilla JavaScript
- HTML5 + CSS3
- Glassmorphism design

**Backend:**

- Node.js + Express
- Vercel Serverless Functions
- Neon Postgres (serverless)

**APIs:**

- Spotify Web API
- SoundCloud (manual entry)

**Deployment:**

- Vercel (auto-deploy from Git)

---

## 📁 Project Structure

```
djrank/
├── api/
│   ├── djs.js                 # CRUD endpoint
│   └── auth.js                # Authentication
├── public/
│   ├── index.html             # HTML structure
│   ├── styles.css             # Glassmorphism styles
│   ├── app.js                 # Main logic
│   ├── storage.js             # Database wrapper
│   ├── api-service.js         # Spotify integration
│   ├── drag-drop.js           # Drag & drop
│   └── config.js              # Environment config
├── documents/                 # Documentation
├── server.js                  # Express server
├── vercel.json                # Deployment config
└── package.json               # Dependencies
```

---

## 🌐 Deployment

### Deploy to Vercel

1. **Push to GitHub:**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel:**

   - Go to https://vercel.com/new
   - Import your repository
   - Configure environment variables

3. **Environment Variables:**

```
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
ADMIN_SECRET=...
POSTGRES_URL=... (auto-configured)
```

4. **Deploy:**
   - Vercel auto-deploys on every push to `main`
   - Database auto-connects

---

## 📖 Usage Guide

### Adding DJs (Admin Only)

1. Type in search box
2. Results appear from Spotify
3. Click "+ Add" button
4. DJ appears in library

### Ranking DJs (Admin Only)

**Method 1: Criteria-Based**

1. Click DJ to open modal
2. Rate on each criterion (0-3)
3. View suggested tier
4. Click "Apply to Tier"

**Method 2: Drag & Drop**

1. Drag DJ from library
2. Drop into any tier
3. Rearrange as needed

### Uploading Media (Admin Only)

1. Click DJ to open modal
2. Click "Upload Photos" or "Upload Videos"
3. Select compressed files (<1MB images, <15MB videos)
4. Wait for upload to complete
5. Click "Save Changes"

**Recommended Compression:**

- Images: WebP, 80% quality (use Squoosh)
- Videos: MP4 H.264, RF 23-25 (use HandBrake)

### Mobile Gestures

- **Long-press** tier card → Enter delete mode (admin)
- **Horizontal scroll** → Browse artist library
- **Tap to expand** → View photos/videos fullscreen

---

## 🔒 Security

- **64-character admin token** (cryptographically secure)
- **Rate limiting** (5 attempts/hour per IP)
- **Constant-time comparison** (prevents timing attacks)
- **HTTPS enforced** (via Vercel)
- **Public read-only** (GET requests only)
- **Admin mutations** (POST/PUT/DELETE require token)

---

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📚 Documentation

Detailed docs in `/documents/`:

- `PROJECT_OVERVIEW.md` - Complete project guide
- `SESSION_DEBRIEF_2025-10-01.md` - Implementation summary
- `ADMIN_AUTH_PLAN.md` - Authentication system
- `PUBLIC_VIEW_AUDIT.md` - Public view security
- `MEDIA_UPLOAD_SYSTEM.md` - Upload functionality

---

## 🐛 Known Limitations

- Base64 media storage (+33% file size overhead)
- Manual image compression required
- Single admin user
- SoundCloud API pending (manual entry works)

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome via issues!

---

## 📄 License

MIT

---

**Built with ❤️ for DJ culture**
