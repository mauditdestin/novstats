const NovStatsCache = {
  PREFIX: 'novstats_',
  TTL: 5 * 60 * 1000,

  set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify({ value, ts: Date.now() }));
    } catch (_) {}
  },

  get(key) {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      if (!raw) return null;
      const { value, ts } = JSON.parse(raw);
      if (Date.now() - ts > this.TTL) {
        localStorage.removeItem(this.PREFIX + key);
        return null;
      }
      return value;
    } catch (_) {
      return null;
    }
  }
};
