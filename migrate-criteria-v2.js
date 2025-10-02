// Migration: Criteria V2 - Add bonus/penalty fields and event context
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { sql } = require("@vercel/postgres");

async function migrate() {
  try {
    console.log("🚀 Starting Criteria V2 Migration...\n");

    // Step 1: Add Bonus Columns
    console.log("📦 Step 1: Adding bonus columns...");
    await sql`ALTER TABLE djs ADD COLUMN IF NOT EXISTS bonus_crowd_control BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE djs ADD COLUMN IF NOT EXISTS bonus_signature_moment BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE djs ADD COLUMN IF NOT EXISTS bonus_bold_risks BOOLEAN DEFAULT false`;
    console.log("✅ Bonus columns added\n");

    // Step 2: Add Penalty Columns
    console.log("📦 Step 2: Adding penalty columns...");
    await sql`ALTER TABLE djs ADD COLUMN IF NOT EXISTS penalty_cliche_tracks BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE djs ADD COLUMN IF NOT EXISTS penalty_overreliance BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE djs ADD COLUMN IF NOT EXISTS penalty_poor_energy BOOLEAN DEFAULT false`;
    console.log("✅ Penalty columns added\n");

    // Step 3: Add Event Context Columns
    console.log("📦 Step 3: Adding event context columns...");
    await sql`ALTER TABLE djs ADD COLUMN IF NOT EXISTS event_venue TEXT`;
    await sql`ALTER TABLE djs ADD COLUMN IF NOT EXISTS event_city TEXT`;
    await sql`ALTER TABLE djs ADD COLUMN IF NOT EXISTS event_date DATE`;
    await sql`ALTER TABLE djs ADD COLUMN IF NOT EXISTS event_type TEXT`;
    await sql`ALTER TABLE djs ADD COLUMN IF NOT EXISTS event_slot TEXT`;
    await sql`ALTER TABLE djs ADD COLUMN IF NOT EXISTS set_duration TEXT`;
    console.log("✅ Event context columns added\n");

    // Step 4: Migrate criteria (guests → creativity)
    console.log("📦 Step 4: Migrating criteria (guests → creativity)...");
    const result = await sql`
      UPDATE djs 
      SET criteria = jsonb_set(
        criteria - 'guests',
        '{creativity}',
        COALESCE(criteria->'guests', '0'::jsonb)
      ) 
      WHERE criteria ? 'guests'
    `;
    console.log(`✅ Migrated ${result.rowCount} records\n`);

    // Step 5: Verify migration
    console.log("🔍 Step 5: Verifying migration...\n");

    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'djs'
      AND (column_name LIKE 'bonus_%' OR column_name LIKE 'penalty_%' OR column_name LIKE 'event_%')
      ORDER BY column_name
    `;

    console.log("📊 New columns added:");
    columns.rows.forEach((col) => {
      console.log(`  ✓ ${col.column_name.padEnd(30)} ${col.data_type}`);
    });

    const sample = await sql`SELECT id, name, criteria FROM djs LIMIT 1`;
    if (sample.rows.length > 0) {
      console.log("\n📝 Sample criteria structure (updated):");
      console.log(JSON.stringify(sample.rows[0].criteria, null, 2));
    }

    // Check for any remaining 'guests' fields
    const oldFields = await sql`
      SELECT id, name
      FROM djs 
      WHERE criteria ? 'guests'
    `;

    if (oldFields.rows.length > 0) {
      console.log(
        `\n⚠️  Warning: ${oldFields.rows.length} records still have 'guests' field`
      );
    } else {
      console.log("\n✅ All records successfully migrated");
    }

    console.log("\n🎉 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
