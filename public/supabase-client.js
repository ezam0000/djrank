// Supabase Client Initialization
let supabaseClient = null;

// Initialize Supabase
function initSupabase() {
  if (CONFIG.supabase.url === "YOUR_SUPABASE_URL") {
    console.warn("⚠️ Supabase not configured. Using localStorage fallback.");
    return null;
  }

  try {
    supabaseClient = supabase.createClient(
      CONFIG.supabase.url,
      CONFIG.supabase.anonKey
    );
    console.log("✅ Supabase initialized");
    return supabaseClient;
  } catch (error) {
    console.error("❌ Supabase initialization failed:", error);
    return null;
  }
}

// Database operations
const DB = {
  // Get all DJs
  async getDJs() {
    if (!supabaseClient) {
      return JSON.parse(localStorage.getItem("djs") || "[]");
    }

    const { data, error } = await supabaseClient
      .from("djs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching DJs:", error);
      return [];
    }
    return data;
  },

  // Add new DJ
  async addDJ(djData) {
    if (!supabaseClient) {
      const djs = JSON.parse(localStorage.getItem("djs") || "[]");
      const newDJ = {
        id: Date.now().toString(),
        ...djData,
        created_at: new Date().toISOString(),
      };
      djs.push(newDJ);
      localStorage.setItem("djs", JSON.stringify(djs));
      return newDJ;
    }

    const { data, error } = await supabaseClient
      .from("djs")
      .insert([djData])
      .select()
      .single();

    if (error) {
      console.error("Error adding DJ:", error);
      throw error;
    }
    return data;
  },

  // Update DJ
  async updateDJ(id, updates) {
    if (!supabaseClient) {
      const djs = JSON.parse(localStorage.getItem("djs") || "[]");
      const index = djs.findIndex((dj) => dj.id === id);
      if (index !== -1) {
        djs[index] = { ...djs[index], ...updates };
        localStorage.setItem("djs", JSON.stringify(djs));
        return djs[index];
      }
      return null;
    }

    const { data, error } = await supabaseClient
      .from("djs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating DJ:", error);
      throw error;
    }
    return data;
  },

  // Delete DJ
  async deleteDJ(id) {
    if (!supabaseClient) {
      const djs = JSON.parse(localStorage.getItem("djs") || "[]");
      const filtered = djs.filter((dj) => dj.id !== id);
      localStorage.setItem("djs", JSON.stringify(filtered));
      return true;
    }

    const { error } = await supabaseClient.from("djs").delete().eq("id", id);

    if (error) {
      console.error("Error deleting DJ:", error);
      throw error;
    }
    return true;
  },

  // Upload file to Supabase Storage
  async uploadFile(file, bucket = "dj-media") {
    if (!supabaseClient) {
      // For localStorage fallback, convert to base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },
};

// Initialize on load
initSupabase();
