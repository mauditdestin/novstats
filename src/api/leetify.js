const LeetifyAPI = {
  async getProfile(steam64id) {
    const cacheKey = `leetify_${steam64id}`;
    const cached = NovStatsCache.get(cacheKey);
    if (cached) return cached;

    return new Promise(resolve => {
      chrome.runtime.sendMessage({
        type: 'FETCH',
        url: `https://api.cs2ps.com/api/stats/leetify/${steam64id}`
      }, res => {
        if (chrome.runtime.lastError || !res) return resolve(null);
        const data = res.ok ? res.data : null;
        if (data) NovStatsCache.set(cacheKey, data);
        resolve(data);
      });
    });
  }
};
