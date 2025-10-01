# Admin Authentication & Public View Plan

**Goal:** Public can view rankings & criteria, only you can edit

**Phases:**

- Phase 5A: Enhanced Music Links & Public Modal
- Phase 5B: Admin Authentication System

---

## 📱 PHASE 5A: Enhanced Music Links & Public Modal

### Music Platform Strategy

**Included:**

- ✅ **Spotify** - Full integration (already working)
  - Artist search, images, bios, followers
  - Deep links: `spotify:artist:ID` (opens app)
  - Web fallback: `https://open.spotify.com/artist/ID`
- 🟡 **SoundCloud** - Waiting for API approval
  - Email sent to support@support.soundcloud.com
  - Manual entry available until API approved
  - Optional field (not required)

**Removed:**

- ❌ **Apple Music** - Too complex, requires $99/year developer account

### Music Links UI Update

**Before (Current):**

```
Music Links
[________________________] ← Empty input (bad UX)
[________________________]
[________________________]
```

**After (New):**

```
🎧 Listen Now
┌─────────────────────────────────┐
│ [🟢 Open in Spotify App]        │
│ [🌐 Play on Web]                │
│ [🟠 SoundCloud] (if available)  │
└─────────────────────────────────┘
```

### Public DJ Detail Modal

**What Public Users See:**

- ✅ DJ photo & full bio
- ✅ Spotify stats (followers, genres)
- ✅ Music links as **clickable buttons**
- ✅ **Criteria breakdown** with visual stars:
  ```
  📊 Ranking Breakdown
  Flow:    ⭐⭐⭐ (3/3) - Excellent
  Vibes:   ⭐⭐☆ (2/3) - Good
  Visuals: ⭐☆☆ (1/3) - Below Average
  Guests:  ⭐⭐☆ (2/3) - Good
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total: 8/12 → Tier B
  ```
- ✅ Your notes (read-only)
- ✅ Uploaded photos/videos (if any)

**What They CANNOT Do:**

- ❌ Edit any information
- ❌ Upload files
- ❌ Change rankings
- ❌ Save changes
- ❌ Delete DJs

**Admin Mode Difference:**

- Same modal, but with edit buttons enabled
- Input fields instead of read-only text
- Save/upload functionality active

### Implementation Checklist - Phase 5A

- [ ] Remove Apple Music fields from HTML
- [ ] Update database to keep soundcloud_url optional
- [ ] Create `createMusicLinksSection()` function
  - Detect if Spotify app installed
  - Generate spotify: URI and https: fallback
  - Show SoundCloud button only if URL exists
- [ ] Update DJ Detail Modal
  - Add criteria breakdown display
  - Convert ratings to visual stars (⭐)
  - Show read-only mode by default
  - Add "Admin Mode Active 🔓" indicator when authenticated
- [ ] Extract Spotify artist ID from URL
  - Parse: `https://open.spotify.com/artist/60d24wfXkVzDSfLS6hyCjZ`
  - Extract: `60d24wfXkVzDSfLS6hyCjZ`
  - Generate: `spotify:artist:60d24wfXkVzDSfLS6hyCjZ`
- [ ] Style music link buttons
  - Spotify: Green (#1DB954)
  - SoundCloud: Orange (#FF5500)
  - Add hover effects
  - Mobile-friendly tap targets
- [ ] Test on mobile (deep links)
- [ ] Test on desktop (fallback to web)

---

## 🎯 PHASE 5B: Admin Secret Token Authentication

### Why This Works

- ✅ **Simple** - No complex auth system needed
- ✅ **Secure** - Cryptographically strong token (64+ characters)
- ✅ **Flexible** - Works on any device where you enter the token
- ✅ **Attack-resistant** - Rate limiting + strong token = brute force impossible
- ✅ **No login UI** - Hidden admin button, invisible to public

---

## 🏗️ Architecture

### Public Mode (Default)

```
User visits site → Read-only mode → Can view tiers, see DJs, browse
```

### Admin Mode (You Only)

```
You visit site → Click hidden button → Enter admin token → Full access
Token stored in sessionStorage → Sent with all API requests
```

### API Protection

```
API receives request → Checks for admin token in header
- No token? → Allow GET only (view data)
- Valid token? → Allow POST/PUT/DELETE (edit data)
- Invalid token? → Reject + rate limit IP
- Too many attempts? → Temporary ban
```

---

## 🔐 Security Layers

### Layer 1: Strong Admin Token

- **Generated**: Cryptographically random 64-character string
- **Stored**: Vercel environment variable `ADMIN_SECRET`
- **Example**: `a7f3k9m2p5q8r1s4t6v9w2x5y7z0b3c6d8e1f4g7h0j2k5m8n1p4q6r9s2t5u7v0w3x6y9`
- **Entropy**: 2^256 combinations = impossible to brute force

### Layer 2: Rate Limiting

- **Limit**: 5 failed attempts per IP per hour
- **Lockout**: 1 hour temporary ban after 5 failures
- **Reset**: Successful auth resets counter
- **Implementation**: In-memory cache (or Redis for distributed)

### Layer 3: Request Validation

- **Token location**: Custom header `X-Admin-Token`
- **Constant-time comparison**: Prevents timing attacks
- **No token hints**: Don't reveal if token is close/wrong
- **Logging**: Track all failed auth attempts

### Layer 4: UI Obfuscation

- **No visible "Admin Login"** - Hidden button (triple-click logo)
- **No password field on page load** - Appears only when activated
- **Session-based** - Token stored in sessionStorage (clears on browser close)
- **Auto-logout** - Clear token after 1 hour of inactivity

---

## 🛠️ Implementation Plan

### 1. Generate Admin Token

```bash
# Run locally to generate a secure token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Add to Vercel Environment

```bash
vercel env add ADMIN_SECRET
# Paste the generated token
```

### 3. Update API (`api/djs.js`)

```javascript
// Add auth middleware
function isAdmin(req) {
  const token = req.headers["x-admin-token"];
  if (!token) return false;

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(process.env.ADMIN_SECRET)
  );
}

// Protect mutations
if (req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: "Unauthorized" });
  }
}
```

### 4. Update Frontend (`public/app.js`)

```javascript
// Hidden admin activation (triple-click logo)
let clickCount = 0;
document.querySelector(".app-title").addEventListener("click", () => {
  clickCount++;
  if (clickCount === 3) {
    showAdminPrompt();
  }
  setTimeout(() => (clickCount = 0), 1000);
});

// Admin token prompt
function showAdminPrompt() {
  const token = prompt("Enter admin token:");
  if (token) {
    sessionStorage.setItem("adminToken", token);
    location.reload();
  }
}

// Add token to all API requests
DB.addDJ = async (data) => {
  const headers = { "Content-Type": "application/json" };
  const token = sessionStorage.getItem("adminToken");
  if (token) headers["X-Admin-Token"] = token;

  const response = await fetch("/api/djs", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  // ...
};
```

### 5. Add Rate Limiting (`api/rate-limit.js`)

```javascript
const attempts = new Map();

function checkRateLimit(ip) {
  const key = `auth_${ip}`;
  const data = attempts.get(key) || { count: 0, resetAt: Date.now() + 3600000 };

  if (Date.now() > data.resetAt) {
    data.count = 0;
    data.resetAt = Date.now() + 3600000;
  }

  if (data.count >= 5) {
    throw new Error("Too many failed attempts. Try again in 1 hour.");
  }

  data.count++;
  attempts.set(key, data);
  return data;
}
```

---

## 🎨 User Experience

### For Public Viewers

1. Visit site → See all ranked DJs
2. Can browse, scroll, view tiers
3. **Cannot** drag, add, delete, or edit
4. Search shows results but no "+ Add" button
5. No indication that admin mode exists

### For You (Admin)

1. Visit site → Triple-click "DJ RANK" title
2. Enter your admin token (paste from password manager)
3. Token stored in session → Full access enabled
4. All editing features work normally
5. Token cleared when browser closes

---

## 🚨 Attack Scenarios & Defenses

### Attack 1: Brute Force Token

- **Method**: Try millions of tokens
- **Defense**:
  - Rate limiting (5 attempts/hour)
  - 64-character hex token = 2^256 combinations
  - At 5 attempts/hour = 10^75 years to crack

### Attack 2: Timing Attacks

- **Method**: Measure response time to guess token
- **Defense**: Constant-time comparison (`crypto.timingSafeEqual`)

### Attack 3: XSS to Steal Token

- **Method**: Inject script to read sessionStorage
- **Defense**:
  - CSP headers (Content Security Policy)
  - httpOnly cookies (alternative storage)
  - Input sanitization

### Attack 4: Network Sniffing

- **Method**: Intercept token in transit
- **Defense**: HTTPS only (Vercel enforces this)

### Attack 5: SQL Injection

- **Method**: Inject malicious SQL
- **Defense**: Parameterized queries (Vercel Postgres handles this)

### Attack 6: DOS Attack

- **Method**: Flood server with requests
- **Defense**: Vercel's built-in DDoS protection + rate limiting

---

## 🔄 Alternative Approaches

### Option A: Separate Admin Subdomain

- Public: `djrank.vercel.app` (view-only)
- Admin: `admin-djrank.vercel.app` (password protected)
- **Pros**: Complete separation
- **Cons**: Two deployments to manage

### Option B: Vercel Password Protection

- **Vercel Pro feature** ($20/month)
- Entire site behind password
- **Pros**: Built-in, secure
- **Cons**: Costs money, blocks public viewing

### Option C: NextAuth.js

- Full OAuth integration (Google, GitHub, etc.)
- **Pros**: Production-grade auth
- **Cons**: Overkill for single user, requires Next.js migration

---

## ✅ Recommended Implementation

**Use: Admin Secret Token (Option from above)**

**Why:**

- Free (no Pro plan needed)
- Simple (~100 lines of code)
- Secure (brute force impossible)
- Public can view, you can edit
- Works on any device
- No database changes needed

**Estimated Time:** 30 minutes

---

## 📋 Complete Implementation Checklist

### Phase 5A: Enhanced Music Links & Public Modal ⏳

- [ ] Remove Apple Music from HTML/CSS
- [ ] Update DJ Detail Modal layout
- [ ] Add music link buttons (Spotify app + web)
- [ ] Add SoundCloud button (conditional)
- [ ] Add criteria breakdown display with stars
- [ ] Style buttons (Spotify green, SoundCloud orange)
- [ ] Extract Spotify artist ID from URLs
- [ ] Test deep links on mobile
- [ ] Test web fallbacks on desktop

### Phase 5B: Admin Authentication System 📅

- [ ] Generate strong admin token (64 chars)
- [ ] Add `ADMIN_SECRET` to Vercel environment variables
- [ ] Create `api/auth-middleware.js` with token validation
- [ ] Update `api/djs.js` to require auth for mutations
- [ ] Add rate limiting to API
- [ ] Update `public/storage.js` to send token header
- [ ] Add hidden admin activation in `public/app.js`
- [ ] Add visual indicator when in admin mode
- [ ] Disable edit features in public mode
- [ ] Add auto-logout after 1 hour inactivity
- [ ] Test public mode (no token)
- [ ] Test admin mode (with token)
- [ ] Test rate limiting (5 failed attempts)
- [ ] Deploy to production
- [ ] Save admin token in password manager

### External Dependencies ⏰

- [ ] SoundCloud API approval (waiting for email response)

---

## 🚀 Immediate Next Steps

**Starting Phase 5A now:**

1. ✅ Remove Apple Music fields
2. ✅ Add beautiful Spotify buttons (app + web)
3. ✅ Add SoundCloud button (if URL exists)
4. ✅ Show criteria breakdown in modal
5. ✅ Visual star ratings display

**Estimated Time:** 45 minutes

**Ready to start!** 🎯
