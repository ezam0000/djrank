// API endpoint for DJ operations
const { sql } = require("@vercel/postgres");
const { requireAdmin } = require("./auth");

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Token");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // GET - Fetch all DJs (public access)
    if (req.method === "GET") {
      const result = await sql`SELECT * FROM djs ORDER BY created_at DESC`;
      return res.status(200).json(result.rows);
    }

    // Protect mutations - require admin authentication
    if (
      req.method === "POST" ||
      req.method === "PUT" ||
      req.method === "DELETE"
    ) {
      const authCheck = requireAdmin(req, res);
      if (!authCheck.authorized) {
        return res
          .status(authCheck.error.status)
          .json({ error: authCheck.error.message });
      }
    }

    // POST - Add new DJ (admin only)
    if (req.method === "POST") {
      const {
        id,
        name,
        bio,
        image,
        soundcloud_url,
        spotify_url,
        apple_music_url,
        tier,
        criteria,
        notes,
        photos,
        videos,
      } = req.body;

      const result = await sql`
        INSERT INTO djs (id, name, bio, image, soundcloud_url, spotify_url, apple_music_url, tier, criteria, notes, photos, videos)
        VALUES (${id}, ${name}, ${bio || null}, ${image || null}, ${
        soundcloud_url || null
      }, ${spotify_url || null}, ${apple_music_url || null}, ${
        tier || null
      }, ${JSON.stringify(criteria || {})}, ${notes || null}, ${
        photos || []
      }, ${videos || []})
        RETURNING *
      `;

      return res.status(201).json(result.rows[0]);
    }

    // PUT - Update DJ
    if (req.method === "PUT") {
      const { id } = req.query;
      const updates = req.body;

      // Build dynamic update query
      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updates).forEach((key) => {
        if (key !== "id") {
          fields.push(`${key} = $${paramCount}`);
          // Handle JSONB and array fields
          if (key === "criteria") {
            values.push(JSON.stringify(updates[key]));
          } else if (key === "photos" || key === "videos") {
            // TEXT[] arrays - pass as-is (Postgres will handle)
            values.push(updates[key] || []);
          } else {
            values.push(updates[key]);
          }
          paramCount++;
        }
      });

      if (fields.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      // Add updated_at timestamp
      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `UPDATE djs SET ${fields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`;
      const result = await sql.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "DJ not found" });
      }

      return res.status(200).json(result.rows[0]);
    }

    // DELETE - Remove DJ
    if (req.method === "DELETE") {
      const { id } = req.query;

      const result = await sql`DELETE FROM djs WHERE id = ${id} RETURNING *`;

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "DJ not found" });
      }

      return res.status(200).json({ success: true });
    }

    // Method not allowed
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: error.message });
  }
};
