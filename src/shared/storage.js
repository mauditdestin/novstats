const NOVSTATS_DEFAULTS = {
  showLeetify: true,
  showCSStats: true,
  showFaceit:  true,
  compactMode: false,
};

const NovStatsStorage = {
  get() {
    return new Promise(resolve => chrome.storage.sync.get(NOVSTATS_DEFAULTS, resolve));
  },
  set(data) {
    return chrome.storage.sync.set(data);
  },
};
