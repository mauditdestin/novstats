const DEFAULTS = { showLeetify: true, showCSStats: true, showFaceit: true, compactMode: false };

const toggles = {
  leetify: document.getElementById('t-leetify'),
  csstats: document.getElementById('t-csstats'),
  faceit:  document.getElementById('t-faceit'),
  compact: document.getElementById('t-compact')
};

chrome.storage.sync.get(DEFAULTS, prefs => {
  toggles.leetify.checked = prefs.showLeetify;
  toggles.csstats.checked = prefs.showCSStats;
  toggles.faceit.checked  = prefs.showFaceit;
  toggles.compact.checked = prefs.compactMode;
});

const map = {
  leetify: 'showLeetify',
  csstats: 'showCSStats',
  faceit:  'showFaceit',
  compact: 'compactMode'
};

Object.entries(toggles).forEach(([key, el]) => {
  el.addEventListener('change', () => {
    chrome.storage.sync.set({ [map[key]]: el.checked });
  });
});
