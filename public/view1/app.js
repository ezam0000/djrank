import { STORAGE_KEYS, read, write } from '../js/utils/storage.js';
import { showToast } from '../js/utils/toast.js';

const catalogContainer = document.querySelector('.catalog');
const searchInput = document.querySelector('#dj-search');
const chipButtons = Array.from(document.querySelectorAll('.chip'));
const selectedCountEl = document.querySelector('.selected-count');
const startRankingButton = document.querySelector('.primary');

let catalog = [];
let selectedIds = new Set(read(STORAGE_KEYS.selected, []));
let activeFilters = new Set();

async function loadCatalog() {
  try {
    const response = await fetch('../data/djs.json');
    if (!response.ok) throw new Error('Failed to load DJ catalog');
    catalog = await response.json();
    renderCatalog();
  } catch (error) {
    console.error(error);
    showToast('Unable to load DJs. Please try again later.', 'error');
  }
}

function renderCatalog() {
  const query = searchInput.value.trim().toLowerCase();
  const filters = Array.from(activeFilters);

  const matches = catalog.filter(dj => {
    const matchesQuery = !query ||
      dj.name.toLowerCase().includes(query) ||
      dj.genres.some(genre => genre.toLowerCase().includes(query));

    const matchesFilters = filters.every(filter =>
      dj.residencies.includes(filter) || dj.genres.includes(filter)
    );

    return matchesQuery && matchesFilters;
  });

  catalogContainer.textContent = '';

  if (!matches.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <h2>No DJs match your search</h2>
      <p>Try another name or adjust the filters.</p>
      <button type="button" class="chip" data-clear>Clear filters</button>
    `;
    catalogContainer.appendChild(emptyState);
    const clearButton = emptyState.querySelector('[data-clear]');
    clearButton.addEventListener('click', resetFilters);
    return;
  }

  matches.forEach(dj => {
    const card = document.createElement('article');
    card.className = 'dj-card';
    card.innerHTML = `
      <img src="${dj.image}" alt="${dj.name}" loading="lazy" />
      <div class="dj-meta">
        <h2>${dj.name}</h2>
        <div class="badge">${dj.residencies.join(' · ')}</div>
      </div>
      <button type="button" class="select-toggle" data-id="${dj.id}">Add</button>
    `;

    const toggle = card.querySelector('.select-toggle');
    if (selectedIds.has(dj.id)) {
      toggle.classList.add('selected');
      toggle.textContent = 'Added';
    }

    toggle.addEventListener('click', () => handleSelectionToggle(dj.id, toggle));
    catalogContainer.appendChild(card);
  });
}

function handleSelectionToggle(djId, button) {
  if (selectedIds.has(djId)) {
    selectedIds.delete(djId);
    button.classList.remove('selected');
    button.textContent = 'Add';
  } else {
    selectedIds.add(djId);
    button.classList.add('selected');
    button.textContent = 'Added';
  }
  updateSelectionState();
}

function updateSelectionState() {
  const ids = Array.from(selectedIds);
  write(STORAGE_KEYS.selected, ids);
  selectedCountEl.textContent = `Selected: ${ids.length}`;
  startRankingButton.disabled = !ids.length;
}

function resetFilters() {
  activeFilters.clear();
  chipButtons.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
  renderCatalog();
}

chipButtons.forEach(button => {
  button.addEventListener('click', () => {
    const value = button.dataset.filter;
    if (activeFilters.has(value)) {
      activeFilters.delete(value);
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
    } else {
      activeFilters.add(value);
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
    }
    renderCatalog();
  });
});

searchInput.addEventListener('input', () => {
  renderCatalog();
});

startRankingButton.addEventListener('click', () => {
  window.location.href = '../view2/index.html';
});

updateSelectionState();
loadCatalog();

