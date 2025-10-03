// Drag and Drop Functionality

class DragDropManager {
  constructor() {
    this.draggedElement = null;
    this.draggedDJId = null;
    this.init();
  }

  init() {
    // We'll attach event listeners dynamically when cards are created
    this.setupDropZones();
  }

  setupDropZones() {
    const dropZones = document.querySelectorAll(".tier-drop-zone");

    dropZones.forEach((zone) => {
      zone.addEventListener("dragover", this.handleDragOver.bind(this));
      zone.addEventListener("dragleave", this.handleDragLeave.bind(this));
      zone.addEventListener("drop", this.handleDrop.bind(this));
    });

    // Make artist library a drop zone (to move DJs back from tiers)
    const artistGrid = document.getElementById("artistGrid");
    if (artistGrid) {
      artistGrid.addEventListener("dragover", this.handleDragOver.bind(this));
      artistGrid.addEventListener("dragleave", this.handleDragLeave.bind(this));
      artistGrid.addEventListener("drop", this.handleDropToLibrary.bind(this));
    }
  }

  makeDraggable(card, djId) {
    card.draggable = true;
    card.addEventListener("dragstart", (e) => this.handleDragStart(e, djId));
    card.addEventListener("dragend", this.handleDragEnd.bind(this));
  }

  handleDragStart(e, djId) {
    this.draggedElement = e.target.closest(".artist-card");
    this.draggedDJId = djId;

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this.draggedElement.innerHTML);

    // Add dragging class with null check
    setTimeout(() => {
      if (this.draggedElement && this.draggedElement.classList) {
        this.draggedElement.classList.add("dragging");
      }
    }, 0);
  }

  handleDragEnd(e) {
    if (this.draggedElement) {
      this.draggedElement.classList.remove("dragging");
    }

    // Remove drag-over class from all zones
    document.querySelectorAll(".tier-drop-zone").forEach((zone) => {
      zone.classList.remove("drag-over");
    });

    this.draggedElement = null;
    this.draggedDJId = null;
  }

  handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add("drag-over");

    return false;
  }

  handleDragLeave(e) {
    e.currentTarget.classList.remove("drag-over");
  }

  async handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");

    const tier = e.currentTarget.dataset.tier;
    // Store ID locally before it gets cleared by handleDragEnd
    const djId = this.draggedDJId;

    if (djId && tier) {
      console.log(`🔄 Dragging DJ ID: ${djId} to tier ${tier}`);

      // Update DJ tier in database (admin can override any tier)
      const result = await DB.updateDJ(djId, { tier });

      console.log("📦 Update result:", result);
      console.log("📦 Result tier:", result?.tier);

      if (result) {
        // Update local data with result from database for instant refresh
        const djIndex = window.app.djs.findIndex((d) => d.id === djId);

        console.log(`📍 Found DJ at index: ${djIndex}`);
        console.log(`📍 Total DJs in array: ${window.app.djs.length}`);
        console.log(`📍 Looking for ID: ${djId}`);

        if (djIndex !== -1) {
          // DJ exists in array - update it
          window.app.djs[djIndex] = result;
        } else {
          // DJ not in array yet - add it (edge case: newly added DJ)
          console.log("➕ Adding DJ to local array");
          window.app.djs.push(result);
        }

        window.app.renderArtistGrid();
        window.app.loadTierRankings();

        console.log(`✅ DJ moved to tier ${tier}`);
      } else {
        console.error("❌ Update failed - result is null");
      }
    }

    return false;
  }

  async handleDropToLibrary(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");

    // Store ID locally before it gets cleared by handleDragEnd
    const djId = this.draggedDJId;

    if (djId) {
      // Move DJ back to library (set tier to null)
      const result = await DB.updateDJ(djId, { tier: null });

      if (result) {
        // Update local data with result from database for instant refresh
        const djIndex = window.app.djs.findIndex((d) => d.id === djId);
        if (djIndex !== -1) {
          window.app.djs[djIndex] = result;
        } else {
          // DJ not in array - add it
          window.app.djs.push(result);
        }

        window.app.renderArtistGrid();
        window.app.loadTierRankings();

        console.log(`✅ DJ moved back to library`);
      } else {
        console.error("Failed to move DJ to library");
      }
    }

    return false;
  }
}

// Initialize drag-drop manager
window.dragDropManager = new DragDropManager();
