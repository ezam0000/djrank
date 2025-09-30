import { STORAGE_KEYS, read, write } from '../js/utils/storage.js';
import { showToast } from '../js/utils/toast.js';
import { Modal } from '../js/utils/modal.js';
import { withDraggableList } from '../js/utils/drag.js';

const queueList = document.querySelector('[data-queue-list]');
const queueCount = document.querySelector('[data-queue-count]');
const tierDrops = Array.from(document.querySelectorAll('.tier-drop'));
const tierCounts = Object.fromEntries(
  Array.from(document.querySelectorAll('[data-tier-count]')).map(element => [
    element.dataset.tierCount,
    element
  ])
);

const modal = new Modal('#dj-detail-modal');
const form = document.querySelector('#dj-detail-form');
const modalName = document.querySelector('[data-modal-dj-name]');
const modalTier = document.querySelector('[data-modal-tier-label]');
const deleteButton = document.querySelector('[data-delete-entry]');

let catalog = [];
let selected = read(STORAGE_KEYS.selected, []);
let placements = read(STORAGE_KEYS.placements, {});
let notes = read(STORAGE_KEYS.notes, {});
let currentModalId = null;

async function loadCatalog() {
  try {
    const response = await fetch('../data/djs.json');
    if (!response.ok) throw new Error('Failed to load catalog');
    catalog = await response.json();
    const selectedCatalog = catalog.filter(item => selected.includes(item.id));
    if (!selectedCatalog.length) {
      showToast('No DJs selected. Returning to selection.', 'warning');
      setTimeout(() => {
        window.location.href = '../view1/index.html';
      }, 1500);
      return;
    }
    renderQueue(selectedCatalog);
    renderTiers(selectedCatalog);
  } catch (error) {
    console.error(error);
    showToast('Unable to load ranking data.', 'error');
  }
}

function renderQueue(selectedCatalog) {
  const placedIds = new Set(Object.values(placements).flat());
  const queueItems = selectedCatalog.filter(dj => !placedIds.has(dj.id));
  queueList.textContent = '';
  queueItems.forEach(dj => {
    queueList.appendChild(createQueueCard(dj));
  });
  queueCount.textContent = queueItems.length;
}

function renderTiers(selectedCatalog) {
  tierDrops.forEach(drop => {
    const tier = drop.dataset.tier;
    drop.textContent = '';
    const ids = placements[tier] || [];
    ids.forEach(id => {
      const dj = selectedCatalog.find(item => item.id === id);
      if (!dj) return;
      drop.appendChild(createTierCard(dj, tier));
    });
    tierCounts[tier].textContent = ids.length;
  });
}

function createQueueCard(dj) {
  const element = document.createElement('article');
  element.className = 'queue-card';
  element.draggable = true;
  element.dataset.draggableId = dj.id;
  element.innerHTML = `
    <img class="avatar" src="${dj.image}" alt="${dj.name}" loading="lazy" />
    <div class="meta">
      <strong>${dj.name}</strong>
      <span>${dj.residencies.join(' · ')}</span>
    </div>
  `;
  return element;
}

function createTierCard(dj, tier) {
  const element = document.createElement('article');
  element.className = 'tier-card';
  element.draggable = true;
  element.dataset.draggableId = dj.id;
  element.dataset.tier = tier;
  element.innerHTML = `
    <img class="avatar" src="${dj.image}" alt="${dj.name}" loading="lazy" />
    <span class="name">${dj.name}</span>
    <div class="status-icons">
      ${notes[dj.id]?.text ? '<span title="Notes added">📝</span>' : ''}
      ${notes[dj.id]?.image ? '<span title="Image attached">🖼️</span>' : ''}
      ${notes[dj.id]?.video ? '<span title="Video attached">🎬</span>' : ''}
      ${notes[dj.id]?.links ? '<span title="Links added">🔗</span>' : ''}
    </div>
  `;

  element.addEventListener('dblclick', () => openModal(dj.id, tier));
  element.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal(dj.id, tier);
    }
  });
  element.tabIndex = 0;

  return element;
}

function openModal(djId, tier) {
  currentModalId = djId;
  const dj = catalog.find(item => item.id === djId);
  modalName.textContent = dj.name;
  modalTier.textContent = `Tier ${tier}`;
  const entry = notes[djId] || {};

  form.elements.explanation.value = entry.text || '';
  form.elements.videoUrl.value = entry.videoUrl || '';
  form.elements.spotify.value = entry.links?.spotify || '';
  form.elements.appleMusic.value = entry.links?.appleMusic || '';
  form.elements.soundcloud.value = entry.links?.soundcloud || '';
  const preview = form.querySelector('[data-image-preview]');
  preview.textContent = entry.image ? 'Existing image attached' : '';

  deleteButton.hidden = !entry.text && !entry.image && !entry.video && !entry.links;
  deleteButton.onclick = () => {
    delete notes[djId];
    write(STORAGE_KEYS.notes, notes);
    renderTiers(catalog.filter(item => selected.includes(item.id)));
    modal.close();
  };

  modal.open();
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!currentModalId) return;
  const formData = new FormData(form);
  const entry = {
    text: formData.get('explanation') || '',
    image: formData.get('image')?.name || null,
    video: formData.get('video')?.name || null,
    videoUrl: formData.get('videoUrl') || '',
    links: {
      spotify: formData.get('spotify') || '',
      appleMusic: formData.get('appleMusic') || '',
      soundcloud: formData.get('soundcloud') || ''
    }
  };
  notes[currentModalId] = entry;
  write(STORAGE_KEYS.notes, notes);
  renderTiers(catalog.filter(item => selected.includes(item.id)));
  modal.close();
  showToast('Entry saved', 'success');
});

withDraggableList({
  container: document.querySelector('.drag-root'),
  onDrop: ({ draggableId, dropZone }) => {
    const tier = dropZone.dataset.tier;
    updatePlacements(draggableId, tier);
  }
});

function updatePlacements(djId, tier) {
  const currentTier = Object.keys(placements).find(key => placements[key]?.includes(djId));
  if (currentTier) {
    placements[currentTier] = placements[currentTier].filter(id => id !== djId);
    if (!placements[currentTier].length) delete placements[currentTier];
  }

  if (tier !== 'queue') {
    placements[tier] = placements[tier] || [];
    if (!placements[tier].includes(djId)) placements[tier].push(djId);
  }

  write(STORAGE_KEYS.placements, placements);
  const selectedCatalog = catalog.filter(item => selected.includes(item.id));
  renderQueue(selectedCatalog);
  renderTiers(selectedCatalog);
}

loadCatalog();

