# DJ Rank - Criteria V2 Implementation Plan

**Goal:** Implement academic, comprehensive DJ evaluation system with event context metadata

---

## 📊 PART 1: Current Schema Review

### **Current `djs` Table Structure:**

```sql
id                TEXT PRIMARY KEY
name              TEXT NOT NULL
bio               TEXT
image             TEXT
soundcloud_url    TEXT
spotify_url       TEXT
apple_music_url   TEXT
tier              TEXT
criteria          JSONB -- { flow, vibes, visuals, guests }
notes             TEXT
photos            TEXT[]
videos            TEXT[]
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

### **Current Criteria Structure (JSONB):**

```json
{
  "flow": 0-3,
  "vibes": 0-3,
  "visuals": 0-3,
  "guests": 0-3
}
```

**Total Score:** 0-12 points

---

## 🎯 PART 2: New Schema (Criteria V2)

### **Updated `djs` Table:**

```sql
-- Core Skills (0-3 each) - KEEP AS IS, RENAME GUESTS → CREATIVITY
criteria          JSONB NOT NULL DEFAULT '{
  "flow": 0,
  "vibes": 0,
  "visuals": 0,
  "creativity": 0
}'

-- Performance Bonuses (0.5 points each)
bonus_crowd_control      BOOLEAN DEFAULT false
bonus_signature_moment   BOOLEAN DEFAULT false
bonus_bold_risks         BOOLEAN DEFAULT false

-- Performance Penalties (0.5 points each)
penalty_cliche_tracks    BOOLEAN DEFAULT false
penalty_overreliance     BOOLEAN DEFAULT false
penalty_poor_energy      BOOLEAN DEFAULT false

-- Event Context (non-scoring metadata)
event_venue              TEXT
event_city               TEXT
event_date               DATE
event_type               TEXT
event_slot               TEXT
set_duration             TEXT

-- Existing fields remain unchanged
id, name, bio, image, soundcloud_url, spotify_url, apple_music_url
tier, notes, photos, videos, created_at, updated_at
```

### **New Scoring Formula:**

```javascript
// Core (0-12)
coreScore =
  criteria.flow + criteria.vibes + criteria.visuals + criteria.creativity;

// Bonuses (0-1.5)
bonusScore =
  (bonus_crowd_control ? 0.5 : 0) +
  (bonus_signature_moment ? 0.5 : 0) +
  (bonus_bold_risks ? 0.5 : 0);

// Penalties (0 to -1.5)
penaltyScore =
  (penalty_cliche_tracks ? -0.5 : 0) +
  (penalty_overreliance ? -0.5 : 0) +
  (penalty_poor_energy ? -0.5 : 0);

// Final Score (9 to 15)
totalScore = coreScore + bonusScore + penaltyScore;
```

---

## 🏙️ PART 3: Venue & City Dropdowns

### **Major Cities with Top Venues:**

#### **Las Vegas, NV** (Primary - Most Events)

Nightclubs:

- XS Nightclub
- Omnia Nightclub
- Hakkasan Nightclub
- Marquee Nightclub
- Jewel Nightclub
- Zouk Nightclub
- Drai's Nightclub
- Tao Nightclub
- Encore Beach Club (Day)
- Wet Republic (Day)
- Ayu Dayclub
- Other Vegas Venue

#### **Los Angeles, CA**

Venues:

- Exchange LA
- Academy LA
- Sound Nightclub
- Avalon Hollywood
- The Shrine
- Hollywood Palladium
- Insomniac Park
- Other LA Venue

#### **Miami, FL**

Venues:

- LIV at Fontainebleau
- Story Miami
- E11even Miami
- Space Miami
- Club Space Terrace
- Treehouse Miami
- Other Miami Venue

#### **New York, NY**

Venues:

- Brooklyn Mirage
- Avant Gardner
- Elsewhere
- Output (closed but legacy)
- Marquee New York
- Tao Downtown
- Other NYC Venue

#### **Portland, OR**

Venues:

- 45 East
- Realm
- Holocene
- Analog Theater
- Revolution Hall
- Other Portland Venue

#### **Festival/Other**

- Coachella
- EDC Las Vegas
- Tomorrowland
- Ultra Music Festival
- Lightning in a Bottle
- Electric Forest
- Burning Man
- Private Event
- Other Festival
- Other Venue

---

## 🎪 PART 4: Event Type & Slot Dropdowns

### **Event Type:**

```javascript
eventTypes = [
  "Club Residency",
  "One-Off Show",
  "Festival Main Stage",
  "Festival Side Stage",
  "Pool Party / Day Club",
  "Underground / Warehouse",
  "Rooftop / Open Air",
  "Private Event",
  "Back-to-Back Set",
  "Extended Set (3+ hours)",
];
```

### **Set Slot:**

```javascript
setSlots = [
  "Opening (First 2 hours)",
  "Early Prime (10PM-12AM)",
  "Peak Prime (12AM-2AM)",
  "Late Night (2AM-4AM)",
  "Closing Set",
  "All Night Long",
];
```

### **Set Duration (Freeform Text):**

Examples: "90 minutes", "2 hours", "3.5 hours"

---

## 🗄️ PART 5: Database Migration SQL

### **Step 1: Add New Columns**

```sql
-- Add bonus columns (0.5 points each)
ALTER TABLE djs ADD COLUMN bonus_crowd_control BOOLEAN DEFAULT false;
ALTER TABLE djs ADD COLUMN bonus_signature_moment BOOLEAN DEFAULT false;
ALTER TABLE djs ADD COLUMN bonus_bold_risks BOOLEAN DEFAULT false;

-- Add penalty columns (0.5 points each)
ALTER TABLE djs ADD COLUMN penalty_cliche_tracks BOOLEAN DEFAULT false;
ALTER TABLE djs ADD COLUMN penalty_overreliance BOOLEAN DEFAULT false;
ALTER TABLE djs ADD COLUMN penalty_poor_energy BOOLEAN DEFAULT false;

-- Add event context columns (non-scoring)
ALTER TABLE djs ADD COLUMN event_venue TEXT;
ALTER TABLE djs ADD COLUMN event_city TEXT;
ALTER TABLE djs ADD COLUMN event_date DATE;
ALTER TABLE djs ADD COLUMN event_type TEXT;
ALTER TABLE djs ADD COLUMN event_slot TEXT;
ALTER TABLE djs ADD COLUMN set_duration TEXT;
```

### **Step 2: Migrate Existing Criteria (Rename "guests" to "creativity")**

```sql
-- Update all existing records
UPDATE djs SET criteria = jsonb_set(
  criteria - 'guests',
  '{creativity}',
  criteria->'guests'
) WHERE criteria ? 'guests';
```

### **Step 3: Verify Migration**

```sql
-- Check that all records have the new structure
SELECT id, name, criteria FROM djs LIMIT 5;

-- Verify new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'djs'
AND column_name LIKE 'bonus_%' OR column_name LIKE 'penalty_%' OR column_name LIKE 'event_%';
```

---

## 🎨 PART 6: Frontend UI Changes

### **Admin DJ Detail Modal Layout:**

```
┌─────────────────────────────────────────────────────┐
│ [DJ Photo]  David Guetta                            │
│             🎧 25M followers on Spotify              │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 📍 EVENT CONTEXT                                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ City:     [▼ Las Vegas, NV        ]             │ │
│ │ Venue:    [▼ XS Nightclub         ]             │ │
│ │ Date:     [📅 12/31/2024          ]             │ │
│ │ Type:     [▼ Club Residency       ]             │ │
│ │ Slot:     [▼ Peak Prime (12-2AM)  ]             │ │
│ │ Duration: [2 hours                ]             │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ 📊 CORE SKILLS (0-3 each)                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Flow:       ●●●○ (3/3)                          │ │
│ │ Vibes:      ●●○○ (2/3)                          │ │
│ │ Visuals:    ●●●○ (3/3)                          │ │
│ │ Creativity: ●●○○ (2/3)                          │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │ │
│ │ Core Total: 10/12                               │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ ⭐ PERFORMANCE BONUSES (+0.5 each)                 │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ☑ Exceptional Crowd Control     (+0.5)         │ │
│ │ ☑ Signature Moment              (+0.5)         │ │
│ │ ☐ Bold Risk-Taking              (+0.5)         │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │ │
│ │ Bonus Total: +1.0                               │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ ⚠️ PERFORMANCE PENALTIES (-0.5 each)               │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ☐ Cliché Tracks                 (-0.5)         │ │
│ │ ☐ Over-Reliance on Hits         (-0.5)         │ │
│ │ ☐ Poor Energy Management        (-0.5)         │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │ │
│ │ Penalty Total: 0.0                              │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ 🎯 FINAL SCORE                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Core:     10.0/12                               │ │
│ │ Bonus:    +1.0                                  │ │
│ │ Penalty:   0.0                                  │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │ │
│ │ TOTAL:    11.0/15  →  Tier A 🏆                │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ 📝 NOTES                                            │
│ [Textarea for personal notes...]                    │
│                                                      │
│ 🎧 MUSIC LINKS                                      │
│ [Spotify] [SoundCloud]                              │
│                                                      │
│ 📷 PHOTOS & VIDEOS                                  │
│ [Upload buttons and previews...]                    │
│                                                      │
│ [💾 Save Changes]                                   │
└─────────────────────────────────────────────────────┘
```

---

## 👁️ PART 7: Public View Display

```
┌─────────────────────────────────────────────────────┐
│ [DJ Photo]  David Guetta                            │
│             🎧 25M followers on Spotify              │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 📍 SEEN AT                                          │
│ XS Nightclub, Las Vegas, NV                         │
│ December 31, 2024                                    │
│ Club Residency • Peak Prime (12-2AM) • 2 hours     │
│                                                      │
│ 📊 RANKING BREAKDOWN                                │
│                                                      │
│ Core Skills:                                         │
│   Flow:       ⭐⭐⭐ (3/3) - Masterful              │
│   Vibes:      ⭐⭐☆ (2/3) - Proficient             │
│   Visuals:    ⭐⭐⭐ (3/3) - Masterful              │
│   Creativity: ⭐⭐☆ (2/3) - Proficient             │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│   Core Total: 10/12                                  │
│                                                      │
│ Performance Bonuses:                                 │
│   ✓ Exceptional Crowd Control      (+0.5)          │
│   ✓ Signature Moment                (+0.5)          │
│   ✗ Bold Risk-Taking                (0)             │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│   Bonus Total: +1.0                                  │
│                                                      │
│ Performance Penalties:                               │
│   ✗ Cliché Tracks                   (0)             │
│   ✗ Over-Reliance on Hits           (0)             │
│   ✗ Poor Energy Management          (0)             │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│   Penalty Total: 0.0                                 │
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ FINAL SCORE: 11.0/15  →  Tier A 🏆                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                      │
│ 🎧 Listen Now                                        │
│ [Spotify App] [Spotify Web] [SoundCloud]           │
│                                                      │
│ 📝 Notes                                             │
│ [Read-only notes text...]                           │
│                                                      │
│ 📷 Photos & Videos                                   │
│ [Click to expand gallery...]                         │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 PART 8: Implementation Steps

### **Phase 1: Database Migration**

1. Run SQL migration to add new columns
2. Migrate existing `criteria.guests` → `criteria.creativity`
3. Verify all records have correct structure
4. Test on staging environment

### **Phase 2: Backend API Updates**

1. Update `api/djs.js` POST to handle new fields
2. Update `api/djs.js` PUT to handle bonus/penalty booleans
3. Add special handling for JSONB criteria field
4. Test API endpoints with Postman/curl

### **Phase 3: Frontend - Event Context UI**

1. Create city dropdown component
2. Create venue dropdown component (dynamic based on city)
3. Add date picker
4. Create event type dropdown
5. Create set slot dropdown
6. Add duration text input
7. Style event context section

### **Phase 4: Frontend - Criteria UI**

1. Rename "Guests" to "Creativity" in HTML/JS
2. Add 3 bonus checkboxes
3. Add 3 penalty checkboxes
4. Update score calculation function
5. Update tier suggestion logic (new ranges)
6. Style bonus/penalty sections

### **Phase 5: Frontend - Display Logic**

1. Update `renderCriteriaBreakdown()` for public view
2. Add event context display
3. Add bonus/penalty display with checkmarks
4. Update final score display
5. Add academic descriptions

### **Phase 6: Testing**

1. Test with existing DJs (backward compatibility)
2. Test adding new DJ with all fields
3. Test score calculations (edge cases)
4. Test public view display
5. Test mobile responsive
6. Test admin mode vs public mode

### **Phase 7: Data Migration**

1. Update existing DJs with event context (manual)
2. Set default values for bonus/penalty (all false)
3. Verify tier assignments still correct

---

## 📝 PART 9: Tier Ranges Update

### **New Tier System:**

```javascript
function getTierFromScore(score) {
  if (score >= 13.0) return "S"; // Perfect core + net bonus = S tier
  if (score >= 11.0) return "A";
  if (score >= 9.0) return "B";
  if (score >= 7.0) return "C";
  if (score >= 5.0) return "D";
  if (score >= 3.0) return "E";
  return "F";
}
```

| Tier | Score Range | Label         |
| ---- | ----------- | ------------- |
| S    | 13.0-15.0   | Legendary     |
| A    | 11.0-12.9   | Elite         |
| B    | 9.0-10.9    | Very Strong   |
| C    | 7.0-8.9     | Good          |
| D    | 5.0-6.9     | Average       |
| E    | 3.0-4.9     | Below Average |
| F    | 0.0-2.9     | Poor          |

---

## 🎯 PART 10: Venue Dropdown Data Structure

```javascript
const VENUE_DATA = {
  "Las Vegas, NV": [
    "XS Nightclub",
    "Omnia Nightclub",
    "Hakkasan Nightclub",
    "Marquee Nightclub",
    "Jewel Nightclub",
    "Zouk Nightclub",
    "Drai's Nightclub",
    "Tao Nightclub",
    "Encore Beach Club",
    "Wet Republic",
    "Ayu Dayclub",
    "Other Vegas Venue",
  ],
  "Los Angeles, CA": [
    "Exchange LA",
    "Academy LA",
    "Sound Nightclub",
    "Avalon Hollywood",
    "The Shrine",
    "Hollywood Palladium",
    "Insomniac Park",
    "Other LA Venue",
  ],
  "Miami, FL": [
    "LIV at Fontainebleau",
    "Story Miami",
    "E11even Miami",
    "Space Miami",
    "Club Space Terrace",
    "Treehouse Miami",
    "Other Miami Venue",
  ],
  "New York, NY": [
    "Brooklyn Mirage",
    "Avant Gardner",
    "Elsewhere",
    "Marquee New York",
    "Tao Downtown",
    "Other NYC Venue",
  ],
  "Portland, OR": [
    "45 East",
    "Realm",
    "Holocene",
    "Analog Theater",
    "Revolution Hall",
    "Other Portland Venue",
  ],
  "Festival/Other": [
    "Coachella",
    "EDC Las Vegas",
    "Tomorrowland",
    "Ultra Music Festival",
    "Lightning in a Bottle",
    "Electric Forest",
    "Burning Man",
    "Private Event",
    "Other Festival",
  ],
};
```

---

## ✅ PART 11: Testing Checklist

### **Backward Compatibility:**

- [ ] Existing DJs load correctly
- [ ] Old criteria structure migrates properly
- [ ] Tier assignments remain valid
- [ ] No data loss during migration

### **New Features:**

- [ ] Event context fields save correctly
- [ ] City selection updates venue dropdown
- [ ] Bonus checkboxes add 0.5 points each
- [ ] Penalty checkboxes subtract 0.5 points each
- [ ] Score calculation is accurate
- [ ] Tier suggestion matches new ranges

### **UI/UX:**

- [ ] Admin modal displays all new fields
- [ ] Public view shows event context
- [ ] Public view shows bonus/penalty breakdown
- [ ] Dropdowns work on mobile
- [ ] Date picker is user-friendly
- [ ] Score display is clear and accurate

### **Edge Cases:**

- [ ] Score of 15.0 (max) displays correctly
- [ ] Score of 0.0 (min with penalties) displays correctly
- [ ] Missing event context doesn't break display
- [ ] DJ with no bonuses/penalties works
- [ ] Fractional scores display properly (10.5, 11.0, etc.)

---

## 🚀 PART 12: Deployment Strategy

### **Step 1: Staging**

1. Create migration SQL script
2. Test on local Postgres instance
3. Verify data integrity
4. Deploy to staging Vercel environment
5. Full regression testing

### **Step 2: Production Migration**

1. Backup production database
2. Run migration during low-traffic period
3. Verify all existing DJs migrated correctly
4. Deploy frontend changes
5. Monitor error logs

### **Step 3: Post-Deployment**

1. Manually update existing DJs with event context
2. Verify public view displays correctly
3. Test admin functionality
4. Announce new features (if public-facing)

---

## 📊 PART 13: Estimated Timeline

| Phase               | Duration | Tasks                           |
| ------------------- | -------- | ------------------------------- |
| Database Migration  | 1 hour   | SQL scripts, testing            |
| Backend API Updates | 1 hour   | Handle new fields, testing      |
| Event Context UI    | 2 hours  | Dropdowns, date picker, styling |
| Criteria UI Updates | 2 hours  | Checkboxes, scoring, styling    |
| Display Logic       | 2 hours  | Public view, breakdown display  |
| Testing & QA        | 2 hours  | Full regression, edge cases     |
| Deployment          | 1 hour   | Staging, production, monitoring |

**Total Estimated Time: 11 hours**

---

## 📚 PART 14: Documentation Updates

Files to update after implementation:

- `PROJECT_OVERVIEW.md` - New criteria system
- `SESSION_DEBRIEF_2025-10-01.md` - Implementation notes
- `README.md` - Updated scoring system
- `CRITERIA_V2_IMPLEMENTATION_PLAN.md` - This file (mark as complete)

---

**Status:** 📋 Ready for Implementation
**Next Action:** Review plan, then begin Phase 1 (Database Migration)
