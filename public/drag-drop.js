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

    // Add dragging class
    setTimeout(() => {
      this.draggedElement.classList.add("dragging");
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

    if (this.draggedDJId && tier) {
      // Update DJ tier in database
      await DB.updateDJ(this.draggedDJId, { tier });

      // Get the DJ data and recreate card with remove button
      const dj = window.app.djs.find((d) => d.id === this.draggedDJId);
      if (dj) {
        const card = window.app.createArtistCard(dj, true); // true = show remove button
        e.currentTarget.appendChild(card);
      }

      // Remove from original location if it was in a tier
      if (this.draggedElement.closest(".tier-drop-zone")) {
        this.draggedElement.remove();
      }

      console.log(`✅ DJ moved to tier ${tier}`);
    }

    return false;
  }
}

// Initialize drag-drop manager
window.dragDropManager = new DragDropManager();
