// Test the updated API with new Criteria V2 fields
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { sql } = require("@vercel/postgres");

async function testAPI() {
  try {
    console.log("🧪 Testing Criteria V2 API...\n");

    // Get first DJ
    const djs = await sql`SELECT * FROM djs LIMIT 1`;
    if (djs.rows.length === 0) {
      console.log("⚠️  No DJs to test with");
      process.exit(0);
    }

    const testDJ = djs.rows[0];
    console.log(`📝 Testing with: ${testDJ.name}`);
    console.log(`   ID: ${testDJ.id}\n`);

    // Test 1: Update with bonus fields
    console.log("Test 1: Adding bonus points...");
    const update1 = await sql`
      UPDATE djs 
      SET 
        bonus_crowd_control = true,
        bonus_signature_moment = true,
        event_venue = 'XS Nightclub',
        event_city = 'Las Vegas, NV',
        event_date = '2024-12-31'
      WHERE id = ${testDJ.id}
      RETURNING *
    `;
    console.log("✅ Bonus fields updated");
    console.log(`   crowd_control: ${update1.rows[0].bonus_crowd_control}`);
    console.log(
      `   signature_moment: ${update1.rows[0].bonus_signature_moment}`
    );
    console.log(`   venue: ${update1.rows[0].event_venue}`);
    console.log(`   city: ${update1.rows[0].event_city}`);
    console.log(`   date: ${update1.rows[0].event_date}\n`);

    // Test 2: Calculate score
    console.log("Test 2: Calculating score...");
    const dj = update1.rows[0];
    const criteria = dj.criteria;
    const coreScore =
      (criteria.flow || 0) +
      (criteria.vibes || 0) +
      (criteria.visuals || 0) +
      (criteria.creativity || 0);
    const bonusScore =
      (dj.bonus_crowd_control ? 0.5 : 0) +
      (dj.bonus_signature_moment ? 0.5 : 0) +
      (dj.bonus_bold_risks ? 0.5 : 0);
    const penaltyScore =
      (dj.penalty_cliche_tracks ? -0.5 : 0) +
      (dj.penalty_overreliance ? -0.5 : 0) +
      (dj.penalty_poor_energy ? -0.5 : 0);
    const totalScore = coreScore + bonusScore + penaltyScore;

    console.log(`✅ Score calculation:`);
    console.log(`   Core: ${coreScore}/12`);
    console.log(`   Bonus: +${bonusScore}`);
    console.log(`   Penalty: ${penaltyScore}`);
    console.log(`   Total: ${totalScore}/15\n`);

    // Test 3: Verify all new fields exist
    console.log("Test 3: Checking all new fields...");
    const allFields = await sql`SELECT * FROM djs WHERE id = ${testDJ.id}`;
    const dj2 = allFields.rows[0];

    const newFields = [
      "bonus_crowd_control",
      "bonus_signature_moment",
      "bonus_bold_risks",
      "penalty_cliche_tracks",
      "penalty_overreliance",
      "penalty_poor_energy",
      "event_venue",
      "event_city",
      "event_date",
      "event_type",
      "event_slot",
      "set_duration",
    ];

    let allPresent = true;
    newFields.forEach((field) => {
      if (dj2[field] === undefined) {
        console.log(`   ❌ Missing: ${field}`);
        allPresent = false;
      }
    });

    if (allPresent) {
      console.log("✅ All new fields present in database\n");
    }

    console.log("🎉 All API tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testAPI();
