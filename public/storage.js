// Local Storage Management
// Simple localStorage-based storage for DJ data

const DB = {
  // Get all DJs
  async getDJs() {
    return JSON.parse(localStorage.getItem("djs") || "[]");
  },

  // Add new DJ
  async addDJ(djData) {
    const djs = JSON.parse(localStorage.getItem("djs") || "[]");
    const newDJ = {
      id: Date.now().toString(),
      ...djData,
      created_at: new Date().toISOString(),
    };
    djs.push(newDJ);
    localStorage.setItem("djs", JSON.stringify(djs));
    return newDJ;
  },

  // Update DJ
  async updateDJ(id, updates) {
    const djs = JSON.parse(localStorage.getItem("djs") || "[]");
    const index = djs.findIndex((dj) => dj.id === id);
    if (index !== -1) {
      djs[index] = { ...djs[index], ...updates };
      localStorage.setItem("djs", JSON.stringify(djs));
      return djs[index];
    }
    return null;
  },

  // Delete DJ
  async deleteDJ(id) {
    const djs = JSON.parse(localStorage.getItem("djs") || "[]");
    const filtered = djs.filter((dj) => dj.id !== id);
    localStorage.setItem("djs", JSON.stringify(filtered));
    return true;
  },

  // Upload file - returns base64 for localStorage
  async uploadFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  },
};

console.log("✅ Storage initialized (localStorage)");
