const FaceitAPI = {
  async getAllData(steam64id) {
    const cacheKey = `faceit_${steam64id}`;
    const cached = NovStatsCache.get(cacheKey);
    if (cached) return cached;

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'FETCH',
        url: `https://api.cs2ps.com/api/stats/faceit/${steam64id}`
      }, res => {
        if (chrome.runtime.lastError || !res) return reject(new Error('fetch failed'));
        if (!res.ok) return reject(new Error(res.error || 'not found'));

        const d = res.data;
        const s = d.stats || {};

        const mapResult = r => {
          if (r === 'W' || r === 1 || r === true  || r === 'win')  return 'W';
          if (r === 'L' || r === 0 || r === false || r === 'loss') return 'L';
          return '?';
        };

        const data = {
          nickname:      d.nickname,
          avatar:        d.avatar,
          country:       d.country,
          createdAt:     d.registered,
          membership:    d.membership,
          elo:           d.elo,
          level:         d.level,
          ranking:       d.ranking ?? 0,
          matches:       s.matches,
          kd:            s.kd_ratio,
          hsPercent:     s.hs_percentage,
          winRate:       s.win_rate,
          avgKills:      s.avg_kills,
          recentResults: (s.recent_results || []).map(mapResult)
        };

        NovStatsCache.set(cacheKey, data);
        resolve(data);
      });
    });
  }
};
