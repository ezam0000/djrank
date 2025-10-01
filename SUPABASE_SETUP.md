# Supabase Setup Guide

This guide will help you set up Supabase backend for DJ Rank.

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `djrank`
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
5. Wait for project to be created (~2 minutes)

## 2. Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Create DJs table
CREATE TABLE djs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  soundcloud_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  tier TEXT CHECK (tier IN ('S', 'A', 'B', 'C', 'D', 'E', 'F')),
  criteria JSONB DEFAULT '{"flow": 0, "vibes": 0, "visuals": 0, "guests": 0}'::jsonb,
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_djs_updated_at
  BEFORE UPDATE ON djs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional but recommended)
ALTER TABLE djs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your needs)
CREATE POLICY "Allow all operations on djs"
  ON djs
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## 3. Set Up Storage (for Photos/Videos)

1. Go to **Storage** in Supabase dashboard
2. Click "Create a new bucket"
3. Create bucket:
   - Name: `dj-photos`
   - Public: ✅ (checked)
4. Click "Create bucket"
5. Repeat for `dj-videos` bucket

### Set Storage Policies

For each bucket, go to **Policies** tab and add:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'dj-photos');

-- Allow authenticated uploads
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dj-photos');
```

Repeat for `dj-videos` bucket.

## 4. Get API Credentials

1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## 5. Configure Your App

1. Open `public/config.js`
2. Replace the placeholder values:

```javascript
const CONFIG = {
  supabase: {
    url: "YOUR_SUPABASE_URL_HERE", // Paste Project URL
    anonKey: "YOUR_SUPABASE_ANON_KEY_HERE", // Paste anon key
  },
  // ... rest of config
};
```

## 6. Optional: API Keys for Artist Search

### SoundCloud API

1. Go to [https://soundcloud.com/you/apps](https://soundcloud.com/you/apps)
2. Click "Register a new application"
3. Fill in app details
4. Copy **Client ID**
5. Add to `config.js`:

```javascript
soundcloud: {
  clientId: "YOUR_SOUNDCLOUD_CLIENT_ID";
}
```

### Spotify API

1. Go to [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in app details
5. Copy **Client ID** and **Client Secret**
6. Add to `config.js`:

```javascript
spotify: {
  clientId: 'YOUR_SPOTIFY_CLIENT_ID',
  clientSecret: 'YOUR_SPOTIFY_CLIENT_SECRET'
}
```

## Done! 🎉

Your Supabase backend is ready. The app will automatically use it instead of localStorage.

## Troubleshooting

- **Can't connect to Supabase**: Check that URL and anon key are correct
- **Photos won't upload**: Verify storage buckets are created and public
- **Data not saving**: Check browser console for errors and verify RLS policies
