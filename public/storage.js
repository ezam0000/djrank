// Database Storage Management
// Uses Vercel Postgres via API endpoints

const DB = {
  // Get headers with admin token if available
  getHeaders() {
    const headers = { "Content-Type": "application/json" };
    const token = sessionStorage.getItem("adminToken");
    if (token) {
      headers["X-Admin-Token"] = token;
    }
    return headers;
  },

  // Get all DJs
  async getDJs() {
    try {
      const response = await fetch("/api/djs");
      if (!response.ok) throw new Error("Failed to fetch DJs");
      return await response.json();
    } catch (error) {
      console.error("Error fetching DJs:", error);
      return [];
    }
  },

  // Add new DJ
  async addDJ(djData) {
    try {
      const newDJ = {
        id: Date.now().toString(),
        ...djData,
        created_at: new Date().toISOString(),
      };

      const response = await fetch("/api/djs", {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(newDJ),
      });

      if (!response.ok) throw new Error("Failed to add DJ");
      return await response.json();
    } catch (error) {
      console.error("Error adding DJ:", error);
      return null;
    }
  },

  // Update DJ
  async updateDJ(id, updates) {
    try {
      const response = await fetch(`/api/djs?id=${id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update DJ");
      return await response.json();
    } catch (error) {
      console.error("Error updating DJ:", error);
      return null;
    }
  },

  // Delete DJ
  async deleteDJ(id) {
    try {
      const response = await fetch(`/api/djs?id=${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error("Failed to delete DJ");
      return true;
    } catch (error) {
      console.error("Error deleting DJ:", error);
      return false;
    }
  },

  // Upload file - returns base64
  async uploadFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  },
};

console.log("✅ Storage initialized (Vercel Postgres)");
