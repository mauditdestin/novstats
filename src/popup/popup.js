const DEFAULTS = { showLeetify: true, showCSStats: true, showFaceit: true };

const toggles = {
  leetify: document.getElementById('t-leetify'),
  csstats: document.getElementById('t-csstats'),
  faceit:  document.getElementById('t-faceit')
};

chrome.storage.sync.get(DEFAULTS, prefs => {
  toggles.leetify.checked = prefs.showLeetify;
  toggles.csstats.checked = prefs.showCSStats;
  toggles.faceit.checked  = prefs.showFaceit;
});

Object.entries(toggles).forEach(([key, el]) => {
  el.addEventListener('change', () => {
    const map = { leetify: 'showLeetify', csstats: 'showCSStats', faceit: 'showFaceit' };
    chrome.storage.sync.set({ [map[key]]: el.checked });
  });
});
