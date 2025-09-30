const STORAGE_KEYS = {
  selected: 'djrank:selected',
  placements: 'djrank:placements',
  notes: 'djrank:notes'
};

function read(key, defaultValue) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return structuredClone(defaultValue);
    return JSON.parse(raw);
  } catch (error) {
    console.error('storage read error', key, error);
    return structuredClone(defaultValue);
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('storage write error', key, error);
  }
}

export { STORAGE_KEYS, read, write };

