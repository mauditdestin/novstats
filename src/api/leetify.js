const LeetifyAPI = {
  BASE: 'https://api.leetify.com/api',

  async request(url) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'FETCH', url }, res => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (!res) return reject(new Error('No response from background'));
        if (res.ok) resolve(res.data);
        else if (res.status === 404) resolve(null);
        else reject(new Error(res.error));
      });
    });
  },

  async getProfile(steam64id) {
    const cacheKey = `leetify_${steam64id}`;
    const cached = NovStatsCache.get(cacheKey);
    if (cached) return cached;
    try {
      const data = await this.request(`${this.BASE}/profile/${steam64id}`);
      if (data) NovStatsCache.set(cacheKey, data);
      return data;
    } catch (_) {
      return null;
    }
  },

  extractStats(data) {
    if (!data) return null;

    // Leetify can return different structures depending on version
    const allTime = data.appRating?.allTimeRating
      || data.appRating?.latestRating
      || data.ratings
      || data.miniGames
      || {};

    const meta = data.meta || data.games || data.stats || {};

    const pick = (...paths) => {
      for (const path of paths) {
        let v = data;
        for (const key of path.split('.')) v = v?.[key];
        if (v != null) return v;
      }
      return null;
    };

    return {
      matchesPlayed: pick('meta.matchesPlayed', 'games.matchesPlayed', 'matchesPlayed'),
      firstMatchAt: pick('meta.firstMatchAt', 'games.firstMatchAt', 'firstMatchAt', 'meta.firstMatchDate'),
      winRate: pick('meta.winPercentage', 'games.winPercentage', 'meta.winRate', 'games.winRate', 'winRate'),
      aim: allTime.aimRating ?? allTime.aim ?? pick('aimRating', 'aim'),
      rating: allTime.overallRating ?? pick('overallRating', 'rating'),
      positioning: allTime.positioningRating ?? allTime.positioning ?? pick('positioningRating', 'positioning'),
      utility: allTime.utilityRating ?? allTime.utility ?? pick('utilityRating', 'utility'),
      clutch: allTime.clutchRating ?? allTime.clutch ?? pick('clutchRating', 'clutch'),
      opening: allTime.openingDuelRating ?? allTime.opening ?? pick('openingDuelRating', 'opening'),
      preaim: allTime.preaim ?? pick('preaim', 'preAim'),
      reactionTime: pick('reactionTime', 'meta.reactionTime'),
      kd: pick('kdr', 'kd', 'meta.kdr', 'games.kdr')
    };
  }
};
