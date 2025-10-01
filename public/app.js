// Main Application Logic

class DJRankApp {
  constructor() {
    this.djs = [];
    this.currentDJ = null;
    this.deleteMode = false;
    this.longPressTimer = null;
    this.init();
  }

  async init() {
    console.log("🎧 Initializing DJ Rank App...");

    // Wait for config to load
    await configReady;

    // Load DJs from database or create sample data
    await this.loadDJs();

    // Setup event listeners
    this.setupEventListeners();

    // Render initial UI
    this.renderArtistGrid();
    this.loadTierRankings();

    console.log("✅ App initialized");
  }

  async loadDJs() {
    this.djs = await DB.getDJs();

    if (this.djs.length === 0) {
      console.log("✨ DJ Library is empty - search Spotify to add artists!");
    }
  }

  setupEventListeners() {
    // Collapse library button
    document
      .getElementById("collapseLibraryBtn")
      .addEventListener("click", () => {
        const container = document.getElementById("artistGridContainer");
        const btn = document.getElementById("collapseLibraryBtn");

        if (container.classList.contains("collapsed")) {
          container.classList.remove("collapsed");
          btn.textContent = "−";
        } else {
          container.classList.add("collapsed");
          btn.textContent = "+";
        }
      });

    // Close modal buttons
    document.querySelectorAll(".close-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.closeModal(e.target.dataset.modal);
      });
    });

    // Close modals on backdrop click
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Search input - now searches APIs
    const searchInput = document.getElementById("searchInput");
    let searchTimeout;

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      // Clear previous timeout
      clearTimeout(searchTimeout);

      // If empty, show all unranked DJs
      if (!query) {
        this.renderArtistGrid();
        return;
      }

      // If less than 2 characters, just filter local DJs
      if (query.length < 2) {
        this.filterArtists(query);
        return;
      }

      // Debounce API search
      searchTimeout = setTimeout(() => {
        this.searchAndDisplayArtists(query);
      }, 500);
    });

    // Artist search in Add DJ modal
    document.getElementById("searchArtistBtn").addEventListener("click", () => {
      this.searchArtists();
    });

    document
      .getElementById("artistSearchInput")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.searchArtists();
        }
      });

    // Manual DJ form
    document.getElementById("manualDJForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.addManualDJ();
    });

    // Criteria rating dots
    this.setupCriteriaRating();

    // Apply tier button
    document.getElementById("applyTierBtn").addEventListener("click", () => {
      this.applyCalculatedTier();
    });

    // Save detail button
    document.getElementById("saveDetailBtn").addEventListener("click", () => {
      this.saveDJDetails();
    });

    // Photo upload
    document.getElementById("photoUpload").addEventListener("change", (e) => {
      this.handlePhotoUpload(e.target.files);
    });

    // Video upload
    document.getElementById("videoUpload").addEventListener("change", (e) => {
      this.handleVideoUpload(e.target.files);
    });

    // Done button for delete mode (mobile)
    document.getElementById("doneDeleteBtn").addEventListener("click", () => {
      this.exitDeleteMode();
    });

    // Exit delete mode when clicking overlay
    document
      .getElementById("deleteModeOverlay")
      .addEventListener("click", (e) => {
        if (e.target.id === "deleteModeOverlay") {
          this.exitDeleteMode();
        }
      });
  }

  enterDeleteMode() {
    this.deleteMode = true;
    document.querySelectorAll(".tier-drop-zone").forEach((zone) => {
      zone.classList.add("delete-mode");
    });
    document.getElementById("deleteModeOverlay").classList.add("active");
    console.log("🔄 Delete mode activated - tap × to remove DJs");
  }

  exitDeleteMode() {
    this.deleteMode = false;
    document.querySelectorAll(".tier-drop-zone").forEach((zone) => {
      zone.classList.remove("delete-mode");
    });
    document.getElementById("deleteModeOverlay").classList.remove("active");
    console.log("✅ Delete mode deactivated");
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
    }
  }

  renderArtistGrid(djs = null) {
    const grid = document.getElementById("artistGrid");
    grid.innerHTML = "";

    // Use provided DJs or default to unranked DJs
    const displayDJs = djs || this.djs.filter((dj) => !dj.tier);

    if (displayDJs.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 1rem;">🎧 No DJs in library</p>
          <p style="font-size: 0.9rem;">Click "+ Add DJ" to add artists to rank</p>
        </div>
      `;
      return;
    }

    displayDJs.forEach((dj) => {
      const card = this.createArtistCard(dj);
      grid.appendChild(card);
    });
  }

  createArtistCard(dj, showRemoveBtn = false) {
    const card = document.createElement("div");
    card.className = "artist-card";
    card.innerHTML = `
      <img src="${
        dj.image ||
        "https://via.placeholder.com/150/333/fff?text=" +
          encodeURIComponent(dj.name)
      }" 
           alt="${dj.name}" 
           class="artist-avatar">
      <div class="artist-name">${dj.name}</div>
      ${showRemoveBtn ? '<button class="remove-btn">×</button>' : ""}
    `;

    // Add remove button handler if in tier
    if (showRemoveBtn) {
      const removeBtn = card.querySelector(".remove-btn");
      removeBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await this.removeFromTier(dj.id);
      });

      // Long press for mobile delete mode
      let pressTimer;
      card.addEventListener("touchstart", (e) => {
        if (!this.deleteMode) {
          pressTimer = setTimeout(() => {
            this.enterDeleteMode();
            // Vibrate if supported
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }
          }, 500); // 500ms long press
        }
      });

      card.addEventListener("touchend", () => {
        clearTimeout(pressTimer);
      });

      card.addEventListener("touchmove", () => {
        clearTimeout(pressTimer);
      });
    }

    // Make draggable
    window.dragDropManager.makeDraggable(card, dj.id);

    // Click to open detail modal
    card.addEventListener("click", (e) => {
      if (
        !card.classList.contains("dragging") &&
        !e.target.classList.contains("remove-btn") &&
        !this.deleteMode
      ) {
        this.openDJDetail(dj.id);
      }
    });

    return card;
  }

  async removeFromTier(djId) {
    await DB.updateDJ(djId, { tier: null });
    await this.loadDJs();
    this.renderArtistGrid();
    this.loadTierRankings();
    console.log("✅ Removed DJ from tier");
  }

  loadTierRankings() {
    // Clear all tier zones first
    document.querySelectorAll(".tier-drop-zone").forEach((zone) => {
      zone.innerHTML = "";
    });

    // Add DJs to their respective tiers
    const rankedDJs = this.djs.filter((dj) => dj.tier);

    rankedDJs.forEach((dj) => {
      const zone = document.querySelector(
        `.tier-drop-zone[data-tier="${dj.tier}"]`
      );
      if (zone) {
        const card = this.createArtistCard(dj, true); // true = show remove button
        zone.appendChild(card);
      }
    });
  }

  filterArtists(query) {
    const cards = document.querySelectorAll("#artistGrid .artist-card");
    const lowerQuery = query.toLowerCase();

    cards.forEach((card) => {
      const name = card.querySelector(".artist-name").textContent.toLowerCase();
      card.style.display = name.includes(lowerQuery) ? "block" : "none";
    });
  }

  async searchAndDisplayArtists(query) {
    const grid = document.getElementById("artistGrid");

    // Show loading state
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <p style="font-size: 1.1rem;">🔍 Searching for "${query}"...</p>
      </div>
    `;

    try {
      const results = await APIService.searchArtists(query);

      if (results.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">No results found for "${query}"</p>
            <p style="font-size: 0.9rem;">Try a different search or click "+ Add DJ" to add manually</p>
          </div>
        `;
        return;
      }

      // Convert search results to DJ format for display
      const searchDJs = results.map((artist) => ({
        id: `search-${artist.id}`,
        name: artist.name,
        bio: artist.bio,
        image: artist.image,
        soundcloud_url: artist.source === "soundcloud" ? artist.url : "",
        spotify_url: artist.source === "spotify" ? artist.url : "",
        apple_music_url: "",
        tier: null,
        criteria: { flow: 0, vibes: 0, visuals: 0, guests: 0 },
        notes: "",
        photos: [],
        videos: [],
        _isSearchResult: true,
        _sourceData: artist,
      }));

      // Render search results with "Add" buttons
      grid.innerHTML = "";
      searchDJs.forEach((dj) => {
        const card = this.createSearchResultCard(dj);
        grid.appendChild(card);
      });
    } catch (error) {
      console.error("Search error:", error);
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <p style="font-size: 1.1rem; color: #ff4545;">Error searching. Please try again.</p>
        </div>
      `;
    }
  }

  createSearchResultCard(dj) {
    const card = document.createElement("div");
    card.className = "artist-card search-result";
    card.innerHTML = `
      <div style="position: relative;">
        <img src="${
          dj.image ||
          "https://via.placeholder.com/150/333/fff?text=" +
            encodeURIComponent(dj.name)
        }" 
             alt="${dj.name}" 
             class="artist-avatar">
        <button class="add-artist-btn" data-dj-id="${dj.id}" 
                style="position: absolute; bottom: -10px; right: -10px; width: 35px; height: 35px; 
                       border-radius: 50%; background: rgba(138, 180, 248, 0.9); border: 2px solid white;
                       color: white; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center;
                       justify-content: center; font-weight: bold; transition: all 0.3s ease;">
          +
        </button>
      </div>
      <div class="artist-name">${dj.name}</div>
    `;

    // Add click handler for the + button
    const addBtn = card.querySelector(".add-artist-btn");
    addBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await this.addArtistFromSearch(dj._sourceData);

      // Remove the card or replace with "Added" state
      addBtn.textContent = "✓";
      addBtn.style.background = "#00ff88";
      addBtn.style.pointerEvents = "none";
    });

    // Make the card clickable to preview (not add)
    card.addEventListener("click", (e) => {
      if (!e.target.closest(".add-artist-btn")) {
        // Show preview modal or add directly
        this.previewArtist(dj);
      }
    });

    return card;
  }

  previewArtist(dj) {
    // Quick preview - for now just add them
    this.addArtistFromSearch(dj._sourceData);
  }

  async searchArtists() {
    const query = document.getElementById("artistSearchInput").value;
    const resultsContainer = document.getElementById("searchResults");

    if (!query.trim()) return;

    resultsContainer.innerHTML =
      '<p style="color: var(--text-muted);">Searching...</p>';

    const results = await APIService.searchArtists(query);

    if (results.length === 0) {
      resultsContainer.innerHTML =
        '<p style="color: var(--text-muted);">No results found. Try manual entry below.</p>';
      return;
    }

    resultsContainer.innerHTML = "";
    results.forEach((artist) => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.innerHTML = `
        <img src="${artist.image || "https://via.placeholder.com/60"}" alt="${
        artist.name
      }">
        <div style="flex: 1;">
          <strong>${artist.name}</strong>
          <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.25rem;">
            ${artist.source === "spotify" ? "🎵 Spotify" : "☁️ SoundCloud"} 
            ${
              artist.followers
                ? `• ${this.formatNumber(artist.followers)} followers`
                : ""
            }
          </p>
        </div>
      `;

      item.addEventListener("click", () => this.addArtistFromSearch(artist));
      resultsContainer.appendChild(item);
    });
  }

  async addArtistFromSearch(artist) {
    const djData = {
      name: artist.name,
      bio: artist.bio || "",
      image: artist.image,
      soundcloud_url: artist.source === "soundcloud" ? artist.url : "",
      spotify_url: artist.source === "spotify" ? artist.url : "",
      apple_music_url: "",
      tier: null,
      criteria: { flow: 0, vibes: 0, visuals: 0, guests: 0 },
      notes: "",
      photos: [],
      videos: [],
    };

    try {
      await DB.addDJ(djData);
      await this.loadDJs();
      this.renderArtistGrid();
      this.closeModal("addDJModal");

      // Clear search
      document.getElementById("artistSearchInput").value = "";
      document.getElementById("searchResults").innerHTML = "";

      console.log("✅ Artist added:", artist.name);
    } catch (error) {
      console.error("Error adding artist:", error);
      alert("Error adding artist. Please try manual entry.");
    }
  }

  async addManualDJ() {
    const djData = {
      name: document.getElementById("djName").value,
      bio: document.getElementById("djBio").value,
      image: document.getElementById("djImage").value,
      soundcloud_url: document.getElementById("djSoundcloud").value,
      spotify_url: document.getElementById("djSpotify").value,
      apple_music_url: document.getElementById("djAppleMusic").value,
      tier: null,
      criteria: { flow: 0, vibes: 0, visuals: 0, guests: 0 },
      notes: "",
      photos: [],
      videos: [],
    };

    try {
      await DB.addDJ(djData);
      await this.loadDJs();
      this.renderArtistGrid();
      this.closeModal("addDJModal");

      // Reset form
      document.getElementById("manualDJForm").reset();

      console.log("✅ DJ added manually:", djData.name);
    } catch (error) {
      console.error("Error adding DJ:", error);
      alert("Error adding DJ. Please try again.");
    }
  }

  openDJDetail(djId) {
    const dj = this.djs.find((d) => d.id === djId);
    if (!dj) return;

    this.currentDJ = dj;

    // Populate modal
    document.getElementById("djDetailName").textContent = dj.name;
    document.getElementById("djDetailImage").src =
      dj.image || "https://via.placeholder.com/250";
    document.getElementById("djDetailBio").textContent =
      dj.bio || "No bio available";

    document.getElementById("detailSoundcloud").value = dj.soundcloud_url || "";
    document.getElementById("detailSpotify").value = dj.spotify_url || "";
    document.getElementById("detailAppleMusic").value =
      dj.apple_music_url || "";

    document.getElementById("djNotes").value = dj.notes || "";

    // Set criteria ratings
    const criteria = dj.criteria || {
      flow: 0,
      vibes: 0,
      visuals: 0,
      guests: 0,
    };
    this.setCriteriaRating("flow", criteria.flow);
    this.setCriteriaRating("vibes", criteria.vibes);
    this.setCriteriaRating("visuals", criteria.visuals);
    this.setCriteriaRating("guests", criteria.guests);

    this.updateTotalScore();

    // Load photos and videos
    this.loadMediaPreviews(dj);

    this.openModal("djDetailModal");
  }

  setupCriteriaRating() {
    const criteriaItems = document.querySelectorAll(".criteria-item");

    criteriaItems.forEach((item) => {
      const dots = item.querySelectorAll(".dot");
      const label = item.querySelector("label").textContent.toLowerCase();

      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          this.setCriteriaRating(label, index);
          this.updateTotalScore();
        });
      });
    });
  }

  setCriteriaRating(criterion, value) {
    const item = Array.from(document.querySelectorAll(".criteria-item")).find(
      (el) => el.querySelector("label").textContent.toLowerCase() === criterion
    );

    if (!item) return;

    const dots = item.querySelectorAll(".dot");
    const input = document.getElementById(`${criterion}Rating`);

    if (input) input.value = value;

    dots.forEach((dot, index) => {
      if (index <= value) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  updateTotalScore() {
    const flow = parseInt(document.getElementById("flowRating").value) || 0;
    const vibes = parseInt(document.getElementById("vibesRating").value) || 0;
    const visuals =
      parseInt(document.getElementById("visualsRating").value) || 0;
    const guests = parseInt(document.getElementById("guestsRating").value) || 0;

    const total = flow + vibes + visuals + guests;
    document.getElementById("totalScore").textContent = total;

    // Calculate suggested tier (0-12 points)
    let tier = "F";
    if (total >= 11) tier = "S";
    else if (total >= 9) tier = "A";
    else if (total >= 7) tier = "B";
    else if (total >= 5) tier = "C";
    else if (total >= 3) tier = "D";
    else if (total >= 1) tier = "E";

    document.getElementById("suggestedTier").textContent = tier;
  }

  async applyCalculatedTier() {
    if (!this.currentDJ) return;

    const tier = document.getElementById("suggestedTier").textContent;

    await DB.updateDJ(this.currentDJ.id, { tier });
    await this.loadDJs();
    this.renderArtistGrid();
    this.loadTierRankings();

    console.log(`✅ Applied tier ${tier} to ${this.currentDJ.name}`);
  }

  async saveDJDetails() {
    if (!this.currentDJ) return;

    const updates = {
      soundcloud_url: document.getElementById("detailSoundcloud").value,
      spotify_url: document.getElementById("detailSpotify").value,
      apple_music_url: document.getElementById("detailAppleMusic").value,
      notes: document.getElementById("djNotes").value,
      criteria: {
        flow: parseInt(document.getElementById("flowRating").value) || 0,
        vibes: parseInt(document.getElementById("vibesRating").value) || 0,
        visuals: parseInt(document.getElementById("visualsRating").value) || 0,
        guests: parseInt(document.getElementById("guestsRating").value) || 0,
      },
    };

    try {
      await DB.updateDJ(this.currentDJ.id, updates);
      await this.loadDJs();
      console.log("✅ DJ details saved");
      this.closeModal("djDetailModal");
    } catch (error) {
      console.error("Error saving DJ details:", error);
      alert("Error saving details. Please try again.");
    }
  }

  async handlePhotoUpload(files) {
    if (!files || files.length === 0) return;

    const photoPreview = document.getElementById("photoPreview");

    for (const file of files) {
      try {
        const url = await DB.uploadFile(file, "dj-photos");

        const img = document.createElement("img");
        img.src = url;
        photoPreview.appendChild(img);

        // Store URL in current DJ
        if (!this.currentDJ.photos) this.currentDJ.photos = [];
        this.currentDJ.photos.push(url);
      } catch (error) {
        console.error("Error uploading photo:", error);
      }
    }
  }

  async handleVideoUpload(files) {
    if (!files || files.length === 0) return;

    const videoPreview = document.getElementById("videoPreview");

    for (const file of files) {
      try {
        const url = await DB.uploadFile(file, "dj-videos");

        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        videoPreview.appendChild(video);

        // Store URL in current DJ
        if (!this.currentDJ.videos) this.currentDJ.videos = [];
        this.currentDJ.videos.push(url);
      } catch (error) {
        console.error("Error uploading video:", error);
      }
    }
  }

  loadMediaPreviews(dj) {
    const photoPreview = document.getElementById("photoPreview");
    const videoPreview = document.getElementById("videoPreview");

    photoPreview.innerHTML = "";
    videoPreview.innerHTML = "";

    if (dj.photos && dj.photos.length > 0) {
      dj.photos.forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        photoPreview.appendChild(img);
      });
    }

    if (dj.videos && dj.videos.length > 0) {
      dj.videos.forEach((url) => {
        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        videoPreview.appendChild(video);
      });
    }
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new DJRankApp();
});
