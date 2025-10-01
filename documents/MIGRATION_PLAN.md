# DJ Rank - Vercel Migration Plan

**Goal:** Migrate from localStorage → Vercel deployment → Vercel Postgres storage

**Timeline:** 4 phases, incremental approach

---

## Phase 1: Clean Up Supabase ✂️

### Files to DELETE

- [ ] `public/supabase-client.js` (entire file)
- [ ] `SUPABASE_SETUP.md` (no longer needed)
- [ ] `public/data/vegas-djs-2025.json` (optional - data loads from localStorage now)

### Files to UPDATE

#### `package.json`

- [ ] Remove `@supabase/supabase-js` from dependencies

#### `public/config.js`

- [ ] Remove Supabase configuration section
- [ ] Keep only Spotify API config

#### `public/index.html`

- [ ] Remove Supabase CDN script: `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
- [ ] Remove `<script src="supabase-client.js"></script>`

#### `.env`

- [ ] Remove Supabase URL and keys
- [ ] Keep only Spotify credentials

#### `public/app.js`

- [ ] Verify localStorage is primary storage (already is)
- [ ] No changes needed - DB object already uses localStorage

### What Stays

✅ All localStorage logic in `public/supabase-client.js` → will become `public/storage.js`  
✅ Spotify API integration  
✅ All UI components  
✅ Drag & drop functionality

---

## Phase 2: Prepare for Vercel Deployment 🚀

### New Files to CREATE

#### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Update `.gitignore`

- [ ] Ensure `.env` is ignored
- [ ] Add `.vercel` to gitignore

### Files to UPDATE

#### `README.md`

- [ ] Add Vercel deployment badge
- [ ] Update deployment instructions
- [ ] Add environment variables setup section

#### `package.json`

- [ ] Add `"engines"` field for Node version
- [ ] Ensure all dependencies are in `dependencies` (not `devDependencies`)

---

## Phase 3: Deploy to Vercel 🌐

### Pre-deployment Checklist

- [ ] Code pushed to GitHub repository
- [ ] No Supabase references remain
- [ ] All sensitive data in `.env` (not committed)
- [ ] Test locally: `npm start` works on port 3003

### Vercel Setup Steps

1. **Connect Repository**

   - [ ] Go to [vercel.com](https://vercel.com)
   - [ ] Import GitHub repository
   - [ ] Select `djrank` project

2. **Configure Environment Variables**

   - [ ] Add `SPOTIFY_CLIENT_ID`
   - [ ] Add `SPOTIFY_CLIENT_SECRET`
   - [ ] (Optional) Add `SOUNDCLOUD_CLIENT_ID`

3. **Deploy Settings**

   - [ ] Build Command: (leave default)
   - [ ] Output Directory: `public`
   - [ ] Install Command: `npm install`
   - [ ] Development Command: `npm start`

4. **Deploy!**
   - [ ] Click "Deploy"
   - [ ] Wait for build to complete
   - [ ] Test live URL

### Post-Deployment Testing

- [ ] Homepage loads correctly
- [ ] Background image displays
- [ ] Search works (Spotify API)
- [ ] Drag & drop functions
- [ ] localStorage persists data
- [ ] Mobile wiggle mode works
- [ ] Tier rankings save

---

## Phase 4: Add Vercel Postgres (Later) 💾

### Prerequisites

- [ ] Successful Vercel deployment
- [ ] App working with localStorage
- [ ] Ready to migrate to cloud storage

### Vercel Dashboard Setup

1. **Enable Vercel Postgres**

   - [ ] Go to project in Vercel dashboard
   - [ ] Storage tab → Create Database
   - [ ] Choose "Postgres"
   - [ ] Select region (closest to users)

2. **Get Connection Strings**
   - [ ] Copy `POSTGRES_URL`
   - [ ] Add to project environment variables

### Code Changes Required

#### Create `/api` directory structure

```
/api
  /djs
    - GET.js (fetch all DJs)
    - POST.js (add DJ)
    - [id].js (update/delete DJ)
```

#### Database Schema (SQL)

```sql
CREATE TABLE djs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  soundcloud_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  tier TEXT CHECK (tier IN ('S', 'A', 'B', 'C', 'D', 'E', 'F')),
  criteria JSONB DEFAULT '{"flow": 0, "vibes": 0, "visuals": 0, "guests": 0}',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Update Files

**`public/storage.js`** (rename from `supabase-client.js`)

- [ ] Replace localStorage calls with `fetch('/api/djs')`
- [ ] Add error handling
- [ ] Keep same interface (no app.js changes needed)

**`package.json`**

- [ ] Add `@vercel/postgres` dependency

**`api/djs/GET.js`** (new)

- [ ] Serverless function to fetch DJs from Postgres
- [ ] Return JSON response

**`api/djs/POST.js`** (new)

- [ ] Add new DJ to database
- [ ] Validate input

**`api/djs/[id].js`** (new)

- [ ] Handle PUT (update) and DELETE requests

### Migration Script (Optional)

- [ ] Create `/scripts/migrate-to-postgres.js`
- [ ] Export localStorage data
- [ ] Import to Vercel Postgres
- [ ] Run once during migration

---

## Current Status 📊

**Phase:** Pre-Phase 1  
**Storage:** localStorage (browser-based)  
**Deployment:** Local only (port 3003)  
**APIs:** Spotify (configured)

---

## Notes & Decisions 📝

### Why This Approach?

✅ **Incremental** - Each phase is independently functional  
✅ **Low risk** - App works at every step  
✅ **No downtime** - Can rollback at any point  
✅ **Clean** - Remove unused code before adding new features

### Key Assumptions

- Images come from Spotify API (no file storage needed)
- User data is not critical (localStorage OK temporarily)
- Single user for now (no auth required yet)

### Future Enhancements (Post-Phase 4)

- User authentication (Vercel Auth / NextAuth)
- Share rankings via public URLs
- Export rankings as images
- Social media integration
- Multi-user support with private rankings

---

## Questions & Troubleshooting 🤔

**Q: What if localStorage data is lost during migration?**  
A: Phase 3 keeps localStorage. Phase 4 adds Postgres alongside it. Users won't lose data.

**Q: Can we skip Phase 4?**  
A: Yes! App works fine with localStorage. Add Postgres only when you want cloud sync.

**Q: What about file uploads?**  
A: Not needed! All images from Spotify API. If needed later, use Vercel Blob.

---

**Last Updated:** 2025-10-01  
**Status:** Ready to begin Phase 1
