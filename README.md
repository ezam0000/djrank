# DJ RANK 🎧

An interactive web application for ranking DJs using a tier-based system with custom criteria evaluation.

## Features

✨ **Beautiful Glassmorphism UI** - Dark mode with liquid glass design effects  
🎯 **Tier Ranking** - Drag & drop DJs into S-F tiers  
📊 **Criteria Scoring** - Rate DJs on Flow, Vibes, Visuals, and Guests (0-3 points each)  
🔍 **Artist Search** - Pull DJ data from Spotify API with real photos  
🎵 **Music Links** - Connect to SoundCloud, Spotify, and Apple Music  
💾 **Persistent Storage** - localStorage (Vercel Postgres coming soon)  
📱 **Mobile-First** - Responsive design with touch gestures

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Spotify API

Get your Spotify API credentials at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

Update `public/config.js`:

```javascript
spotify: {
  clientId: "YOUR_CLIENT_ID",
  clientSecret: "YOUR_CLIENT_SECRET"
}
```

### 3. Run the App

```bash
npm start
```

Open [http://localhost:3003](http://localhost:3003) in your browser.

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/djrank)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
4. Deploy!

Your app will be live at `https://your-project.vercel.app`

## Usage

### Adding DJs

1. Type in the search box at the top
2. Search results appear from Spotify with real artist photos
3. Click the **"+"** button on any artist to add them
4. DJ appears in your Artist Library

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

**Mobile:** Long-press any DJ in a tier to enter wiggle mode, then tap × to remove

### DJ Details

Click any DJ image to:

- View artist bio and info
- Rate them on criteria (Flow, Vibes, Visuals, Guests)
- Add personal notes and commentary
- Add music platform links (Spotify, SoundCloud, Apple Music)

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
│   ├── config.js           # API configuration
│   ├── storage.js          # localStorage wrapper
│   ├── api-service.js      # Spotify API integration
│   ├── drag-drop.js        # Drag & drop functionality
│   └── app.js              # Main application logic
├── server.js               # Express server
├── vercel.json             # Vercel deployment config
├── package.json            # Dependencies
└── README.md               # This file
```

## Environment Variables

Create a `.env` file (or add to Vercel):

```bash
# Required for artist search
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# Optional
SOUNDCLOUD_CLIENT_ID=your_soundcloud_id
```

## Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js + Express
- **Storage**: localStorage (Vercel Postgres coming soon)
- **APIs**: Spotify Web API
- **Deployment**: Vercel
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
