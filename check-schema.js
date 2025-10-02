// Check current database schema
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { sql } = require("@vercel/postgres");

async function checkSchema() {
  try {
    console.log("🔍 Checking current database schema...\n");

    // Get all columns from djs table
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'djs'
      ORDER BY ordinal_position;
    `;

    console.log("📊 Current 'djs' table columns:\n");
    columns.rows.forEach((col) => {
      console.log(
        `  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${
          col.is_nullable === "YES" ? "NULL" : "NOT NULL"
        }`
      );
    });

    console.log("\n");

    // Get sample data to see criteria structure
    const sample = await sql`SELECT id, name, criteria FROM djs LIMIT 1`;

    if (sample.rows.length > 0) {
      console.log("📝 Sample criteria structure:");
      console.log(JSON.stringify(sample.rows[0].criteria, null, 2));
    } else {
      console.log("⚠️  No DJs in database yet");
    }

    console.log("\n✅ Schema check complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkSchema();
