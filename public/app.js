// Main Application Logic

class DJRankApp {
  constructor() {
    this.djs = [];
    this.currentDJ = null;
    this.deleteMode = false;
    this.longPressTimer = null;
    this.isAdmin = false;
    this.uploadsInProgress = 0;
    this.init();
  }

  async init() {
    console.log("🎧 Initializing DJ Rank App...");

    // Wait for config to load
    await configReady;

    // Check if admin token exists
    this.checkAdminStatus();

    // Load DJs from database or create sample data
    await this.loadDJs();

    // Setup event listeners
    this.setupEventListeners();

    // Render initial UI
    this.renderArtistGrid();
    this.loadTierRankings();

    // Update UI based on admin status
    this.updateUIForAdminMode();

    console.log("✅ App initialized");
  }

  checkAdminStatus() {
    const token = sessionStorage.getItem("adminToken");
    this.isAdmin = !!token;
    if (this.isAdmin) {
      console.log("🔓 Admin mode active");
    } else {
      console.log("👁️ Public view mode");
    }
  }

  showAdminPrompt() {
    const token = prompt("🔐 Enter admin token:");
    if (token && token.trim()) {
      sessionStorage.setItem("adminToken", token.trim());
      this.isAdmin = true;
      console.log("🔓 Admin mode activated");
      location.reload();
    }
  }

  logout() {
    sessionStorage.removeItem("adminToken");
    this.isAdmin = false;
    console.log("🔒 Logged out");
    location.reload();
  }

  updateUIForAdminMode() {
    // Add/remove admin-mode class to body
    if (this.isAdmin) {
      document.body.classList.add("admin-mode");
    } else {
      document.body.classList.remove("admin-mode");
    }

    // Show/hide admin indicator
    let indicator = document.getElementById("adminIndicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "adminIndicator";
      indicator.className = "admin-indicator";
      indicator.innerHTML = `
        <span>🔓 Admin Mode</span>
        <button onclick="window.app.logout()">Logout</button>
      `;
      document.body.appendChild(indicator);
    }

    indicator.style.display = this.isAdmin ? "flex" : "none";

    // Make notes field read-only for public
    const notesField = document.getElementById("djNotes");
    if (notesField) {
      notesField.readOnly = !this.isAdmin;
      notesField.style.cursor = this.isAdmin ? "text" : "default";
      notesField.style.opacity = this.isAdmin ? "1" : "0.7";
    }
  }

  async loadDJs() {
    this.djs = await DB.getDJs();

    if (this.djs.length === 0) {
      console.log("✨ DJ Library is empty - search Spotify to add artists!");
    }
  }

  setupEventListeners() {
    // Triple-click logo for admin activation (hidden)
    let clickCount = 0;
    let clickTimer;
    const appTitle = document.querySelector(".app-title");

    appTitle.addEventListener("click", () => {
      clickCount++;
      clearTimeout(clickTimer);

      if (clickCount === 3) {
        this.showAdminPrompt();
        clickCount = 0;
      }

      // Reset click count after 1 second
      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 1000);
    });

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

    // City dropdown change - update venue dropdown
    document.getElementById("eventCity").addEventListener("change", (e) => {
      this.populateVenueDropdown(e.target.value);
    });

    // Venue dropdown - warn if no city selected
    document.getElementById("eventVenue").addEventListener("focus", (e) => {
      const citySelect = document.getElementById("eventCity");
      if (!citySelect.value) {
        e.target.blur();
        alert("⚠️ Please select a city first");
      }
    });

    // Bonus/penalty checkboxes - update score in real-time
    const bonusPenaltyCheckboxes = [
      "bonusCrowdControl",
      "bonusSignatureMoment",
      "bonusBoldRisks",
      "penaltyCliches",
      "penaltyOverreliance",
      "penaltyPoorEnergy",
    ];

    bonusPenaltyCheckboxes.forEach((id) => {
      document.getElementById(id).addEventListener("change", () => {
        this.updateTotalScore();
      });
    });

    // Collapsible sections
    document.querySelectorAll(".collapsible-header").forEach((header) => {
      header.addEventListener("click", (e) => {
        const section = e.target.closest(".collapsible-section");
        section.classList.toggle("collapsed");
      });
    });

    // Criteria labels - hover for desktop, click for mobile (using event delegation)
    const isMobile = window.matchMedia("(max-width: 1200px)").matches;

    if (!isMobile) {
      // Desktop: hover behavior
      document.addEventListener("mouseover", (e) => {
        if (e.target.classList.contains("criteria-label")) {
          const type = e.target.dataset.info;
          this.showCriteriaTooltip(type);
        }
      });

      document.addEventListener("mouseout", (e) => {
        if (e.target.classList.contains("criteria-label")) {
          // Check if we're not moving to the tooltip itself
          const tooltip = document.getElementById("criteriaTooltip");
          if (!tooltip.contains(e.relatedTarget)) {
            this.hideCriteriaTooltip();
          }
        }
      });

      // Keep tooltip open when hovering over it
      document.addEventListener("mouseover", (e) => {
        const tooltip = document.getElementById("criteriaTooltip");
        if (tooltip && tooltip.contains(e.target)) {
          tooltip.classList.add("active");
        }
      });

      document.addEventListener("mouseout", (e) => {
        const tooltip = document.getElementById("criteriaTooltip");
        if (
          tooltip &&
          tooltip.contains(e.target) &&
          !tooltip.contains(e.relatedTarget)
        ) {
          const criteriaRanking = document.querySelector(".criteria-ranking");
          if (!criteriaRanking.contains(e.relatedTarget)) {
            this.hideCriteriaTooltip();
          }
        }
      });
    } else {
      // Mobile: click/tap behavior
      document.addEventListener("click", (e) => {
        if (e.target.classList.contains("criteria-label")) {
          e.preventDefault();
          e.stopPropagation();
          const type = e.target.dataset.info;
          this.toggleCriteriaTooltip(type);
          return;
        }

        // Close tooltip when clicking outside
        const tooltip = document.getElementById("criteriaTooltip");
        if (tooltip && tooltip.classList.contains("active")) {
          this.hideCriteriaTooltip();
        }
      });
    }
  }

  toggleCriteriaTooltip(type) {
    const tooltip = document.getElementById("criteriaTooltip");
    const currentType = tooltip.dataset.currentType;

    // If clicking the same label, close it
    if (tooltip.classList.contains("active") && currentType === type) {
      this.hideCriteriaTooltip();
      return;
    }

    // Show tooltip with new content
    this.showCriteriaTooltip(type);
  }

  showCriteriaTooltip(type) {
    const infoData = {
      flow: {
        title: "Flow — Set Progression & Transitions",
        levels: [
          "0 — Choppy, no cohesion",
          "1 — Basic mixing, some awkward transitions",
          "2 — Smooth transitions, good pacing",
          "3 — Masterful journey, flawless energy management",
        ],
      },
      vibes: {
        title: "Vibes — Energy & Crowd Connection",
        levels: [
          "0 — Crowd disconnected, low energy",
          "1 — Some energy, occasional connection",
          "2 — Good energy, crowd engaged",
          "3 — Electric atmosphere, crowd fully immersed",
        ],
      },
      visuals: {
        title: "Visuals — Stage Presence & Production",
        levels: [
          "0 — No stage presence or visuals",
          "1 — Basic presence, minimal visuals",
          "2 — Strong presence, good visual elements",
          "3 — Commanding presence, stunning production",
        ],
      },
      creativity: {
        title: "Creativity — Track Selection & Originality",
        levels: [
          "0 — Generic, predictable set",
          "1 — Some unique choices, mostly safe",
          "2 — Creative selections, good variety",
          "3 — Bold, unique, memorable track choices",
        ],
      },
    };

    const info = infoData[type];
    if (!info) return;

    const tooltip = document.getElementById("criteriaTooltip");
    const tooltipTitle = document.getElementById("tooltipTitle");
    const tooltipBody = document.getElementById("tooltipBody");

    if (!tooltip || !tooltipTitle || !tooltipBody) return;

    tooltipTitle.textContent = info.title;

    const bodyHTML = info.levels
      .map((level) => `<div class="rating-level">${level}</div>`)
      .join("");

    tooltipBody.innerHTML = bodyHTML;

    tooltip.dataset.currentType = type;
    tooltip.classList.add("active");
  }

  hideCriteriaTooltip() {
    const tooltip = document.getElementById("criteriaTooltip");
    tooltip.classList.remove("active");
    tooltip.dataset.currentType = "";
  }

  enterDeleteMode() {
    // Only allow delete mode for admins
    if (!this.isAdmin) {
      console.log("👁️ View-only mode - login required to edit");
      return;
    }

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
      document.body.classList.add("modal-open");
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      // Pause all videos in the modal before closing
      modal.querySelectorAll("video").forEach((video) => {
        video.pause();
        video.currentTime = 0;
      });

      modal.classList.remove("active");

      // Only remove modal-open if no other modals are active
      const anyModalActive = document.querySelector(".modal.active");
      if (!anyModalActive) {
        document.body.classList.remove("modal-open");
      }

      // Hide tooltip when closing modal
      this.hideCriteriaTooltip();
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
      card.addEventListener(
        "touchstart",
        (e) => {
          if (!this.deleteMode) {
            pressTimer = setTimeout(() => {
              this.enterDeleteMode();
              // Vibrate if supported
              if (navigator.vibrate) {
                navigator.vibrate(50);
              }
            }, 500); // 500ms long press
          }
        },
        { passive: true }
      );

      card.addEventListener(
        "touchend",
        () => {
          clearTimeout(pressTimer);
        },
        { passive: true }
      );

      card.addEventListener(
        "touchmove",
        () => {
          clearTimeout(pressTimer);
        },
        { passive: true }
      );
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
        tier: null,
        criteria: { flow: 0, vibes: 0, visuals: 0, creativity: 0 },
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

    // Only show add button for admins
    const addButtonHTML = this.isAdmin
      ? `
      <button class="add-artist-btn" data-dj-id="${dj.id}" 
              style="position: absolute; bottom: -10px; right: -10px; width: 35px; height: 35px; 
                     border-radius: 50%; background: rgba(138, 180, 248, 0.9); border: 2px solid white;
                     color: white; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center;
                     justify-content: center; font-weight: bold; transition: all 0.3s ease;">
        +
      </button>
    `
      : "";

    card.innerHTML = `
      <div style="position: relative;">
        <img src="${
          dj.image ||
          "https://via.placeholder.com/150/333/fff?text=" +
            encodeURIComponent(dj.name)
        }" 
             alt="${dj.name}" 
             class="artist-avatar">
        ${addButtonHTML}
      </div>
      <div class="artist-name">${dj.name}</div>
    `;

    // Add click handler for the + button (only if admin)
    if (this.isAdmin) {
      const addBtn = card.querySelector(".add-artist-btn");
      addBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await this.addArtistFromSearch(dj._sourceData);

        // Clear search and show library
        document.getElementById("searchInput").value = "";
        this.renderArtistGrid();
      });
    }

    // Make the card clickable to preview (not add)
    card.addEventListener("click", (e) => {
      if (!e.target.closest(".add-artist-btn")) {
        // Show preview modal or add directly
        this.previewArtist(dj);
      }
    });

    return card;
  }

  async previewArtist(dj) {
    // Quick preview - for now just add them
    await this.addArtistFromSearch(dj._sourceData);

    // Clear search and show library
    document.getElementById("searchInput").value = "";
    this.renderArtistGrid();
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

  renderCriteriaBreakdown(dj) {
    const container = document.getElementById("criteriaBreakdown");
    const criteria = dj.criteria || {
      flow: 0,
      vibes: 0,
      visuals: 0,
      creativity: 0,
    };

    // Calculate scores (new academic system)
    const coreScore =
      criteria.flow + criteria.vibes + criteria.visuals + criteria.creativity;

    const bonusScore =
      (dj.bonus_crowd_control ? 0.5 : 0) +
      (dj.bonus_signature_moment ? 0.5 : 0) +
      (dj.bonus_bold_risks ? 0.5 : 0);

    const penaltyScore =
      (dj.penalty_cliche_tracks ? -0.5 : 0) +
      (dj.penalty_overreliance ? -0.5 : 0) +
      (dj.penalty_poor_energy ? -0.5 : 0);

    const totalScore = coreScore + bonusScore + penaltyScore;

    // Generate star rating
    const getStars = (value) => {
      const filled = "⭐".repeat(value);
      const empty = "☆".repeat(3 - value);
      return filled + empty;
    };

    // Get rating description
    const getDescription = (value) => {
      if (value === 3) return "Masterful";
      if (value === 2) return "Proficient";
      if (value === 1) return "Developing";
      return "Not Rated";
    };

    // Event context display
    const eventInfo = [];
    if (dj.event_venue) eventInfo.push(dj.event_venue);
    if (dj.event_city) eventInfo.push(dj.event_city);
    const eventLocation = eventInfo.join(", ");

    const eventDate = dj.event_date
      ? new Date(dj.event_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

    const eventDetails = [];
    if (dj.event_type) eventDetails.push(dj.event_type);
    if (dj.event_slot) eventDetails.push(dj.event_slot);
    if (dj.set_duration) eventDetails.push(dj.set_duration);
    const eventDetailsStr = eventDetails.join(" • ");

    const suggestedTier = this.getTierFromScore(totalScore);

    container.innerHTML = `
      ${
        eventLocation || eventDate || eventDetailsStr
          ? `
        <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border);">
          <h4 style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">📍 SEEN AT</h4>
          ${
            eventLocation
              ? `<div style="font-size: 1rem; margin-bottom: 0.25rem;">${eventLocation}</div>`
              : ""
          }
          ${
            eventDate
              ? `<div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.25rem;">${eventDate}</div>`
              : ""
          }
          ${
            eventDetailsStr
              ? `<div style="color: var(--text-secondary); font-size: 0.85rem;">${eventDetailsStr}</div>`
              : ""
          }
        </div>
      `
          : ""
      }
      
      <h4 style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">📊 RANKING BREAKDOWN</h4>
      
      <div style="margin-bottom: 1rem;">
        <strong style="color: var(--text-primary);">Core Skills:</strong>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-label">Flow:</span>
        <span class="breakdown-stars">${getStars(criteria.flow)}</span>
        <span class="breakdown-score">(${criteria.flow}/3)</span>
        <span class="breakdown-desc">${getDescription(criteria.flow)}</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-label">Vibes:</span>
        <span class="breakdown-stars">${getStars(criteria.vibes)}</span>
        <span class="breakdown-score">(${criteria.vibes}/3)</span>
        <span class="breakdown-desc">${getDescription(criteria.vibes)}</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-label">Visuals:</span>
        <span class="breakdown-stars">${getStars(criteria.visuals)}</span>
        <span class="breakdown-score">(${criteria.visuals}/3)</span>
        <span class="breakdown-desc">${getDescription(criteria.visuals)}</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-label">Creativity:</span>
        <span class="breakdown-stars">${getStars(criteria.creativity)}</span>
        <span class="breakdown-score">(${criteria.creativity}/3)</span>
        <span class="breakdown-desc">${getDescription(
          criteria.creativity
        )}</span>
      </div>
      <div style="padding: 0.5rem 0; border-top: 1px solid var(--glass-border); margin-top: 0.5rem;">
        <strong style="color: var(--text-primary);">Core Total: ${coreScore}/12</strong>
      </div>
      
      ${
        bonusScore > 0 || penaltyScore < 0
          ? `
        <div style="margin-top: 1rem;">
          <strong style="color: var(--text-primary);">Performance Modifiers:</strong>
        </div>
      `
          : ""
      }
      
      ${
        bonusScore > 0
          ? `
        <div style="margin-top: 0.75rem;">
          <div style="color: #4ade80; font-size: 0.9rem; margin-bottom: 0.5rem;">⭐ Bonuses:</div>
          ${
            dj.bonus_crowd_control
              ? '<div style="padding-left: 1rem; color: var(--text-secondary); font-size: 0.85rem;">✓ Exceptional Crowd Control (+0.5)</div>'
              : ""
          }
          ${
            dj.bonus_signature_moment
              ? '<div style="padding-left: 1rem; color: var(--text-secondary); font-size: 0.85rem;">✓ Signature Moment (+0.5)</div>'
              : ""
          }
          ${
            dj.bonus_bold_risks
              ? '<div style="padding-left: 1rem; color: var(--text-secondary); font-size: 0.85rem;">✓ Bold Risk-Taking (+0.5)</div>'
              : ""
          }
          <div style="padding: 0.5rem 0; padding-left: 1rem;">
            <strong style="color: #4ade80;">Bonus Total: +${bonusScore.toFixed(
              1
            )}</strong>
          </div>
        </div>
      `
          : ""
      }
      
      ${
        penaltyScore < 0
          ? `
        <div style="margin-top: 0.75rem;">
          <div style="color: #f87171; font-size: 0.9rem; margin-bottom: 0.5rem;">⚠️ Penalties:</div>
          ${
            dj.penalty_cliche_tracks
              ? '<div style="padding-left: 1rem; color: var(--text-secondary); font-size: 0.85rem;">✓ Cliché Tracks (-0.5)</div>'
              : ""
          }
          ${
            dj.penalty_overreliance
              ? '<div style="padding-left: 1rem; color: var(--text-secondary); font-size: 0.85rem;">✓ Over-Reliance on Hits (-0.5)</div>'
              : ""
          }
          ${
            dj.penalty_poor_energy
              ? '<div style="padding-left: 1rem; color: var(--text-secondary); font-size: 0.85rem;">✓ Poor Energy Management (-0.5)</div>'
              : ""
          }
          <div style="padding: 0.5rem 0; padding-left: 1rem;">
            <strong style="color: #f87171;">Penalty Total: ${penaltyScore.toFixed(
              1
            )}</strong>
          </div>
        </div>
      `
          : ""
      }
      
      <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid var(--accent-primary);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 1.1rem; color: var(--accent-primary);">FINAL SCORE: ${totalScore.toFixed(
            1
          )}/15</strong>
          <span style="color: var(--text-secondary);">→ Tier <strong style="color: var(--accent-primary); font-size: 1.2rem;">${suggestedTier}</strong></span>
        </div>
      </div>
    `;
  }

  renderMusicLinks(dj) {
    const container = document.getElementById("musicButtons");
    container.innerHTML = "";

    // Extract Spotify artist ID from URL
    const getSpotifyId = (url) => {
      if (!url) return null;
      const match = url.match(/artist\/([a-zA-Z0-9]+)/);
      return match ? match[1] : null;
    };

    // Spotify buttons
    if (dj.spotify_url) {
      const spotifyId = getSpotifyId(dj.spotify_url);

      // Primary: Open in Spotify app
      const spotifyAppBtn = document.createElement("a");
      spotifyAppBtn.href = spotifyId
        ? `spotify:artist:${spotifyId}`
        : dj.spotify_url;
      spotifyAppBtn.className = "music-btn spotify-btn";
      spotifyAppBtn.innerHTML = "🟢 Open in Spotify App";
      spotifyAppBtn.target = "_blank";
      container.appendChild(spotifyAppBtn);

      // Fallback: Open in web player
      const spotifyWebBtn = document.createElement("a");
      spotifyWebBtn.href = dj.spotify_url;
      spotifyWebBtn.className = "music-btn spotify-web-btn";
      spotifyWebBtn.innerHTML = "🌐 Spotify Web Player";
      spotifyWebBtn.target = "_blank";
      container.appendChild(spotifyWebBtn);
    }

    // SoundCloud button (if URL exists)
    if (dj.soundcloud_url) {
      const soundcloudBtn = document.createElement("a");
      soundcloudBtn.href = dj.soundcloud_url;
      soundcloudBtn.className = "music-btn soundcloud-btn";
      soundcloudBtn.innerHTML = "🟠 SoundCloud";
      soundcloudBtn.target = "_blank";
      container.appendChild(soundcloudBtn);
    }

    // If no music links
    if (!dj.spotify_url && !dj.soundcloud_url) {
      container.innerHTML =
        '<p style="color: var(--text-muted); font-size: 0.9rem;">No music links available</p>';
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

    // Update music links (show buttons by default, inputs for admin mode later)
    this.renderMusicLinks(dj);

    // Update criteria breakdown (public view)
    this.renderCriteriaBreakdown(dj);

    // Also update the input fields (for admin edit mode)
    document.getElementById("detailSoundcloud").value = dj.soundcloud_url || "";
    document.getElementById("detailSpotify").value = dj.spotify_url || "";

    document.getElementById("djNotes").value = dj.notes || "";

    // Set criteria ratings
    const criteria = dj.criteria || {
      flow: 0,
      vibes: 0,
      visuals: 0,
      creativity: 0,
    };
    this.setCriteriaRating("flow", criteria.flow);
    this.setCriteriaRating("vibes", criteria.vibes);
    this.setCriteriaRating("visuals", criteria.visuals);
    this.setCriteriaRating("creativity", criteria.creativity);

    // Set bonus checkboxes
    document.getElementById("bonusCrowdControl").checked =
      dj.bonus_crowd_control || false;
    document.getElementById("bonusSignatureMoment").checked =
      dj.bonus_signature_moment || false;
    document.getElementById("bonusBoldRisks").checked =
      dj.bonus_bold_risks || false;

    // Set penalty checkboxes
    document.getElementById("penaltyCliches").checked =
      dj.penalty_cliche_tracks || false;
    document.getElementById("penaltyOverreliance").checked =
      dj.penalty_overreliance || false;
    document.getElementById("penaltyPoorEnergy").checked =
      dj.penalty_poor_energy || false;

    // Set event context fields
    document.getElementById("eventCity").value = dj.event_city || "";
    document.getElementById("eventDate").value = dj.event_date || "";
    document.getElementById("eventType").value = dj.event_type || "";
    document.getElementById("eventSlot").value = dj.event_slot || "";
    document.getElementById("setDuration").value = dj.set_duration || "";

    // Update venue dropdown based on selected city (this also handles disabling if no city)
    this.populateVenueDropdown(dj.event_city || "");

    this.updateTotalScore();

    // Load photos and videos
    this.loadMediaPreviews(dj);

    this.openModal("djDetailModal");

    // Update UI for admin/public mode
    this.updateUIForAdminMode();
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
    // Core skills (0-12)
    const flow = parseInt(document.getElementById("flowRating").value) || 0;
    const vibes = parseInt(document.getElementById("vibesRating").value) || 0;
    const visuals =
      parseInt(document.getElementById("visualsRating").value) || 0;
    const creativity =
      parseInt(document.getElementById("creativityRating").value) || 0;

    const coreScore = flow + vibes + visuals + creativity;

    // Bonuses (0-1.5)
    const bonusCrowdControl = document.getElementById("bonusCrowdControl")
      .checked
      ? 0.5
      : 0;
    const bonusSignatureMoment = document.getElementById("bonusSignatureMoment")
      .checked
      ? 0.5
      : 0;
    const bonusBoldRisks = document.getElementById("bonusBoldRisks").checked
      ? 0.5
      : 0;
    const bonusScore =
      bonusCrowdControl + bonusSignatureMoment + bonusBoldRisks;

    // Penalties (0 to -1.5)
    const penaltyCliches = document.getElementById("penaltyCliches").checked
      ? -0.5
      : 0;
    const penaltyOverreliance = document.getElementById("penaltyOverreliance")
      .checked
      ? -0.5
      : 0;
    const penaltyPoorEnergy = document.getElementById("penaltyPoorEnergy")
      .checked
      ? -0.5
      : 0;
    const penaltyScore =
      penaltyCliches + penaltyOverreliance + penaltyPoorEnergy;

    // Final score (0-15)
    const totalScore = coreScore + bonusScore + penaltyScore;

    // Update display
    document.getElementById("totalScore").textContent = coreScore; // Core Score at top
    document.getElementById("finalCoreScore").textContent = coreScore;
    document.getElementById("finalBonusScore").textContent =
      bonusScore.toFixed(1);
    document.getElementById("finalPenaltyScore").textContent =
      penaltyScore.toFixed(1);
    document.getElementById("finalTotalScore").textContent =
      totalScore.toFixed(1);
    document.getElementById("bonusScore").textContent = bonusScore.toFixed(1);
    document.getElementById("penaltyScore").textContent =
      penaltyScore.toFixed(1);

    // Calculate suggested tier (0-15 points)
    const tier = this.getTierFromScore(totalScore);
    document.getElementById("suggestedTier").textContent = tier;
  }

  getTierFromScore(score) {
    if (score >= 13.0) return "S"; // Perfect core + net bonus = S tier
    if (score >= 11.0) return "A";
    if (score >= 9.0) return "B";
    if (score >= 7.0) return "C";
    if (score >= 5.0) return "D";
    if (score >= 3.0) return "E";
    return "F";
  }

  populateVenueDropdown(selectedCity = "") {
    const venueSelect = document.getElementById("eventVenue");
    const citySelect = document.getElementById("eventCity");
    const city = selectedCity || citySelect.value;

    // Clear existing options
    if (!city) {
      venueSelect.innerHTML = '<option value="">Select city first</option>';
      venueSelect.disabled = true;
      return;
    }

    venueSelect.disabled = false;
    venueSelect.innerHTML = '<option value="">Select Venue</option>';

    if (VENUE_DATA[city]) {
      VENUE_DATA[city].forEach((venue) => {
        const option = document.createElement("option");
        option.value = venue;
        option.textContent = venue;
        venueSelect.appendChild(option);
      });
    }

    // Restore selected venue if updating existing DJ
    if (this.currentDJ && this.currentDJ.event_venue) {
      venueSelect.value = this.currentDJ.event_venue;
    }
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
      notes: document.getElementById("djNotes").value,
      criteria: {
        flow: parseInt(document.getElementById("flowRating").value) || 0,
        vibes: parseInt(document.getElementById("vibesRating").value) || 0,
        visuals: parseInt(document.getElementById("visualsRating").value) || 0,
        creativity:
          parseInt(document.getElementById("creativityRating").value) || 0,
      },
      // Performance bonuses
      bonus_crowd_control: document.getElementById("bonusCrowdControl").checked,
      bonus_signature_moment: document.getElementById("bonusSignatureMoment")
        .checked,
      bonus_bold_risks: document.getElementById("bonusBoldRisks").checked,
      // Performance penalties
      penalty_cliche_tracks: document.getElementById("penaltyCliches").checked,
      penalty_overreliance: document.getElementById("penaltyOverreliance")
        .checked,
      penalty_poor_energy: document.getElementById("penaltyPoorEnergy").checked,
      // Event context
      event_city: document.getElementById("eventCity").value,
      event_venue: document.getElementById("eventVenue").value,
      event_date: document.getElementById("eventDate").value,
      event_type: document.getElementById("eventType").value,
      event_slot: document.getElementById("eventSlot").value,
      set_duration: document.getElementById("setDuration").value,
      // Media
      photos: this.currentDJ.photos || [],
      videos: this.currentDJ.videos || [],
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
    const saveBtn = document.getElementById("saveDetailBtn");

    for (const file of files) {
      // Create loading placeholder
      const loadingDiv = document.createElement("div");
      loadingDiv.className = "media-loading";
      loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Uploading ${file.name}...</p>
        <p class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
      `;
      photoPreview.appendChild(loadingDiv);

      // Disable save button
      this.uploadsInProgress++;
      this.updateSaveButtonState();

      try {
        const url = await DB.uploadFile(file);

        // Remove loading placeholder
        loadingDiv.remove();

        // Create image with click to expand
        const wrapper = document.createElement("div");
        wrapper.className = "media-item";
        wrapper.innerHTML = `
          <img src="${url}" alt="DJ Photo">
          <button class="remove-media-btn" title="Remove">×</button>
        `;

        // Click to expand
        wrapper.querySelector("img").addEventListener("click", () => {
          this.expandMedia(url, "image");
        });

        // Remove button
        wrapper
          .querySelector(".remove-media-btn")
          .addEventListener("click", (e) => {
            e.stopPropagation();
            wrapper.remove();
            const index = this.currentDJ.photos.indexOf(url);
            if (index > -1) this.currentDJ.photos.splice(index, 1);
          });

        photoPreview.appendChild(wrapper);

        // Store URL in current DJ
        if (!this.currentDJ.photos) this.currentDJ.photos = [];
        this.currentDJ.photos.push(url);
      } catch (error) {
        console.error("Error uploading photo:", error);
        loadingDiv.innerHTML = `<p style="color: #ff4444;">Upload failed: ${error.message}</p>`;
      } finally {
        this.uploadsInProgress--;
        this.updateSaveButtonState();
      }
    }
  }

  async handleVideoUpload(files) {
    if (!files || files.length === 0) return;

    const videoPreview = document.getElementById("videoPreview");

    for (const file of files) {
      // Create loading placeholder
      const loadingDiv = document.createElement("div");
      loadingDiv.className = "media-loading";
      loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Uploading ${file.name}...</p>
        <p class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
        <p class="upload-hint">This may take a minute...</p>
      `;
      videoPreview.appendChild(loadingDiv);

      // Disable save button
      this.uploadsInProgress++;
      this.updateSaveButtonState();

      try {
        const url = await DB.uploadFile(file);

        // Remove loading placeholder
        loadingDiv.remove();

        // Create video with click to expand
        const wrapper = document.createElement("div");
        wrapper.className = "media-item video-item";
        wrapper.innerHTML = `
          <video src="${url}" preload="metadata"></video>
          <div class="video-play-overlay">▶</div>
          <button class="remove-media-btn" title="Remove">×</button>
        `;

        // Click to expand
        wrapper.addEventListener("click", (e) => {
          if (!e.target.classList.contains("remove-media-btn")) {
            this.expandMedia(url, "video");
          }
        });

        // Remove button
        wrapper
          .querySelector(".remove-media-btn")
          .addEventListener("click", (e) => {
            e.stopPropagation();
            wrapper.remove();
            const index = this.currentDJ.videos.indexOf(url);
            if (index > -1) this.currentDJ.videos.splice(index, 1);
          });

        videoPreview.appendChild(wrapper);

        // Store URL in current DJ
        if (!this.currentDJ.videos) this.currentDJ.videos = [];
        this.currentDJ.videos.push(url);
      } catch (error) {
        console.error("Error uploading video:", error);
        loadingDiv.innerHTML = `<p style="color: #ff4444;">Upload failed: ${error.message}</p>`;
      } finally {
        this.uploadsInProgress--;
        this.updateSaveButtonState();
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
        const wrapper = document.createElement("div");
        wrapper.className = "media-item";
        wrapper.innerHTML = `
          <img src="${url}" alt="DJ Photo">
          <button class="remove-media-btn" title="Remove">×</button>
        `;

        // Click to expand
        wrapper.querySelector("img").addEventListener("click", () => {
          this.expandMedia(url, "image");
        });

        // Remove button (admin only)
        if (this.isAdmin) {
          wrapper
            .querySelector(".remove-media-btn")
            .addEventListener("click", (e) => {
              e.stopPropagation();
              wrapper.remove();
              const index = this.currentDJ.photos.indexOf(url);
              if (index > -1) this.currentDJ.photos.splice(index, 1);
            });
        } else {
          wrapper.querySelector(".remove-media-btn").remove();
        }

        photoPreview.appendChild(wrapper);
      });
    }

    if (dj.videos && dj.videos.length > 0) {
      dj.videos.forEach((url) => {
        const wrapper = document.createElement("div");
        wrapper.className = "media-item video-item";
        wrapper.innerHTML = `
          <video src="${url}" preload="metadata"></video>
          <div class="video-play-overlay">▶</div>
          <button class="remove-media-btn" title="Remove">×</button>
        `;

        // Click to expand
        wrapper.addEventListener("click", (e) => {
          if (!e.target.classList.contains("remove-media-btn")) {
            this.expandMedia(url, "video");
          }
        });

        // Remove button (admin only)
        if (this.isAdmin) {
          wrapper
            .querySelector(".remove-media-btn")
            .addEventListener("click", (e) => {
              e.stopPropagation();
              wrapper.remove();
              const index = this.currentDJ.videos.indexOf(url);
              if (index > -1) this.currentDJ.videos.splice(index, 1);
            });
        } else {
          wrapper.querySelector(".remove-media-btn").remove();
        }

        videoPreview.appendChild(wrapper);
      });
    }
  }

  updateSaveButtonState() {
    const saveBtn = document.getElementById("saveDetailBtn");
    if (!saveBtn) return;

    if (this.uploadsInProgress > 0) {
      saveBtn.disabled = true;
      saveBtn.style.opacity = "0.5";
      saveBtn.style.cursor = "not-allowed";
      saveBtn.textContent = `⏳ Uploading (${this.uploadsInProgress})...`;
    } else {
      saveBtn.disabled = false;
      saveBtn.style.opacity = "1";
      saveBtn.style.cursor = "pointer";
      saveBtn.textContent = "💾 Save Changes";
    }
  }

  expandMedia(url, type) {
    // Create lightbox overlay
    const lightbox = document.createElement("div");
    lightbox.className = "media-lightbox";
    lightbox.innerHTML = `
      <div class="lightbox-content">
        ${
          type === "image"
            ? `<img src="${url}" alt="Full size">`
            : `<video src="${url}" controls autoplay></video>`
        }
        <button class="lightbox-close">×</button>
      </div>
    `;

    // Function to properly close lightbox
    const closeLightbox = () => {
      // Pause video if it's playing
      const video = lightbox.querySelector("video");
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      lightbox.remove();
      document.removeEventListener("keydown", handleEscape);
    };

    // Close on click
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.className === "lightbox-close") {
        closeLightbox();
      }
    });

    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeLightbox();
      }
    };
    document.addEventListener("keydown", handleEscape);

    document.body.appendChild(lightbox);
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
