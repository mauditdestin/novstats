const toggles = {
  leetify: document.getElementById('t-leetify'),
  csstats: document.getElementById('t-csstats'),
  faceit:  document.getElementById('t-faceit'),
  compact: document.getElementById('t-compact'),
};

const prefKeys = {
  leetify: 'showLeetify',
  csstats: 'showCSStats',
  faceit:  'showFaceit',
  compact: 'compactMode',
};

NovStatsStorage.get().then(prefs => {
  toggles.leetify.checked = prefs.showLeetify;
  toggles.csstats.checked = prefs.showCSStats;
  toggles.faceit.checked  = prefs.showFaceit;
  toggles.compact.checked = prefs.compactMode;
});

Object.entries(toggles).forEach(([key, el]) => {
  el.addEventListener('change', () => NovStatsStorage.set({ [prefKeys[key]]: el.checked }));
});
