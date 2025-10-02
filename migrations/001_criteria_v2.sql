-- ====================================================================
-- DJ Rank - Criteria V2 Migration
-- Date: October 1, 2025
-- Purpose: Add bonus/penalty fields, event context, migrate guests→creativity
-- ====================================================================

-- Step 1: Add Bonus Columns (0.5 points each)
ALTER TABLE djs ADD COLUMN IF NOT EXISTS bonus_crowd_control BOOLEAN DEFAULT false;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS bonus_signature_moment BOOLEAN DEFAULT false;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS bonus_bold_risks BOOLEAN DEFAULT false;

-- Step 2: Add Penalty Columns (0.5 points each)
ALTER TABLE djs ADD COLUMN IF NOT EXISTS penalty_cliche_tracks BOOLEAN DEFAULT false;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS penalty_overreliance BOOLEAN DEFAULT false;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS penalty_poor_energy BOOLEAN DEFAULT false;

-- Step 3: Add Event Context Columns (non-scoring metadata)
ALTER TABLE djs ADD COLUMN IF NOT EXISTS event_venue TEXT;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS event_city TEXT;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS event_date DATE;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS event_slot TEXT;
ALTER TABLE djs ADD COLUMN IF NOT EXISTS set_duration TEXT;

-- Step 4: Migrate existing criteria (rename "guests" to "creativity")
-- This updates all existing records to use the new field name
UPDATE djs 
SET criteria = jsonb_set(
  criteria - 'guests',
  '{creativity}',
  COALESCE(criteria->'guests', '0'::jsonb)
) 
WHERE criteria ? 'guests';

-- Step 5: Verify migration
-- Check that all records have the new structure
SELECT 
  id, 
  name, 
  criteria->>'flow' as flow,
  criteria->>'vibes' as vibes,
  criteria->>'visuals' as visuals,
  criteria->>'creativity' as creativity,
  criteria->>'guests' as old_guests
FROM djs;

-- Display summary
SELECT 
  'Total DJs' as metric,
  COUNT(*) as count
FROM djs
UNION ALL
SELECT 
  'DJs with creativity field' as metric,
  COUNT(*) as count
FROM djs 
WHERE criteria ? 'creativity'
UNION ALL
SELECT 
  'DJs still with old guests field' as metric,
  COUNT(*) as count
FROM djs 
WHERE criteria ? 'guests';

