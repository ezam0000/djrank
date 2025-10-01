# DJ RANK 🎧

An interactive web application for ranking DJs using a tier-based system with custom criteria evaluation.

## Features

✨ **Beautiful Glassmorphism UI** - Dark mode with liquid glass design effects  
🎯 **Tier Ranking** - Drag & drop DJs into S-F tiers  
📊 **Criteria Scoring** - Rate DJs on Flow, Vibes, Visuals, and Guests (0-3 points each)  
🎧 **Real Vegas 2025 DJs** - Pre-loaded with 15 DJs who performed in Las Vegas 2025  
🔍 **Artist Search** - Pull DJ data from SoundCloud and Spotify APIs  
📸 **Media Upload** - Add photos and videos for each DJ  
🎵 **Music Links** - Connect to SoundCloud, Spotify, and Apple Music  
💾 **Persistent Storage** - Save data to Supabase or localStorage

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend (Optional)

The app works out-of-the-box with localStorage. For cloud storage and media uploads:

1. Follow the [Supabase Setup Guide](./SUPABASE_SETUP.md)
2. Update `public/config.js` with your credentials

### 3. Run the App

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Reset Data (Optional)

To reload the app with fresh Vegas 2025 DJ data:

```
Visit http://localhost:3000/clear-data.html
```

## Included DJs

The app comes pre-loaded with 15 real DJs who performed in Las Vegas in 2025:

- **Kaskade** - EDC Las Vegas 2025
- **DJ Snake** - EDC Las Vegas 2025
- **Armin van Buuren** - EDC Las Vegas 2025
- **Alison Wonderland** - Zouk Nightclub
- **Illenium** - Zouk Nightclub
- **Deadmau5** - Wynn Nightlife
- **Afrojack** - Wynn Nightlife
- **Marshmello** - Wynn Nightlife
- **The Chainsmokers** - Wynn Nightlife
- **Tiësto** - Palm Tree Beach Club
- **Alesso** - Vegas Clubs
- **Zedd** - Vegas Venues
- **Diplo** - Vegas Clubs
- **Martin Garrix** - Vegas Events
- **Calvin Harris** - Vegas Residencies

Each DJ includes their bio, genre, venue info, and links to their music platforms.

## Usage

### Adding DJs

1. Click **"+ Add DJ"** button
2. Search for artists using SoundCloud/Spotify (if configured)
3. Or manually enter DJ details
4. DJ appears in the Artist Library

### Ranking DJs

**Method 1: Criteria-based Ranking**

1. Click on a DJ's image to open details
2. Rate them on each criterion (0-3 points)
3. View the suggested tier based on total score
4. Click "Apply to Tier" to place them

**Method 2: Manual Drag & Drop**

1. Drag a DJ's image from the Artist Library
2. Drop into any tier (S, A, B, C, D, E, F)
3. Rearrange by dragging between tiers

### DJ Details

Click any DJ image to:

- View/edit their bio
- Rate them on criteria (Flow, Vibes, Visuals, Guests)
- Add notes and commentary
- Upload photos and videos
- Add music platform links

## Tier System

| Tier  | Score Range  | Description                    |
| ----- | ------------ | ------------------------------ |
| **S** | 11-12 points | Elite tier - the absolute best |
| **A** | 9-10 points  | Excellent                      |
| **B** | 7-8 points   | Very good                      |
| **C** | 5-6 points   | Good                           |
| **D** | 3-4 points   | Average                        |
| **E** | 1-2 points   | Below average                  |
| **F** | 0 points     | Needs improvement              |

## Criteria Explanation

- **Flow** (0-3): Mixing skills, track selection, energy management
- **Vibes** (0-3): Atmosphere, crowd connection, stage presence
- **Visuals** (0-3): Visual production, lighting, overall aesthetic
- **Guests** (0-3): Quality of featured artists and collaborations

## Project Structure

```
djrank/
├── public/
│   ├── index.html          # Main HTML structure
│   ├── styles.css          # Glassmorphism styling
│   ├── config.js           # Configuration file
│   ├── supabase-client.js  # Supabase integration
│   ├── api-service.js      # SoundCloud/Spotify API
│   ├── drag-drop.js        # Drag & drop functionality
│   └── app.js              # Main application logic
├── server.js               # Express server
├── package.json            # Dependencies
├── SUPABASE_SETUP.md       # Backend setup guide
└── README.md               # This file
```

## API Configuration

### SoundCloud API (Optional)

Get API access at [SoundCloud for Developers](https://soundcloud.com/you/apps)

Add to `config.js`:

```javascript
soundcloud: {
  clientId: "YOUR_CLIENT_ID";
}
```

### Spotify API (Optional)

Get API access at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

Add to `config.js`:

```javascript
spotify: {
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET'
}
```

## Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **APIs**: SoundCloud API, Spotify Web API
- **Server**: Node.js + Express
- **Design**: Glassmorphism / Liquid Glass aesthetic

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

This is a personal project, but suggestions are welcome!

## License

MIT

---

Built with ❤️ for DJ culture
