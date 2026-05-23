const FaceitAPI = {
  BASE: 'https://open.faceit.com/data/v4',

  getApiKey() {
    return new Promise(resolve => {
      chrome.storage.sync.get(['faceitApiKey'], r => resolve(r.faceitApiKey || ''));
    });
  },

  async request(url) {
    const key = await this.getApiKey();
    if (!key) throw new Error('NO_API_KEY');

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'FETCH',
        url,
        options: { headers: { Authorization: `Bearer ${key}` } }
      }, res => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (res.ok) resolve(res.data);
        else reject(new Error(res.error));
      });
    });
  },

  async getPlayerBySteamId(steam64id) {
    const cacheKey = `faceit_player_${steam64id}`;
    const cached = NovStatsCache.get(cacheKey);
    if (cached) return cached;
    const data = await this.request(`${this.BASE}/players?game=cs2&game_player_id=${steam64id}`);
    NovStatsCache.set(cacheKey, data);
    return data;
  },

  async getPlayerStats(playerId) {
    const cacheKey = `faceit_stats_${playerId}`;
    const cached = NovStatsCache.get(cacheKey);
    if (cached) return cached;
    const data = await this.request(`${this.BASE}/players/${playerId}/stats/cs2`);
    NovStatsCache.set(cacheKey, data);
    return data;
  },

  async getMatchHistory(playerId) {
    const cacheKey = `faceit_history_${playerId}`;
    const cached = NovStatsCache.get(cacheKey);
    if (cached) return cached;
    const data = await this.request(`${this.BASE}/players/${playerId}/history?game=cs2&limit=5`);
    NovStatsCache.set(cacheKey, data);
    return data;
  },

  async getPlayerRanking(playerId, region) {
    if (!region) return null;
    const cacheKey = `faceit_ranking_${playerId}`;
    const cached = NovStatsCache.get(cacheKey);
    if (cached !== null) return cached;
    try {
      const data = await this.request(`${this.BASE}/rankings/games/cs2/regions/${region}/players/${playerId}?limit=1`);
      const position = data.position ?? 0;
      NovStatsCache.set(cacheKey, position);
      return position;
    } catch (_) {
      return 0;
    }
  },

  parseRecentResults(items, playerId) {
    return (items || []).map(match => {
      const f1 = match.teams?.faction1;
      const f2 = match.teams?.faction2;
      if (!f1 || !f2 || !match.results) return '?';

      const inF1 = f1.roster?.some(p => p.player_id === playerId);
      const playerFaction = inF1 ? 'faction1' : 'faction2';
      return match.results.winner === playerFaction ? 'W' : 'L';
    });
  },

  async getAllData(steam64id) {
    const player = await this.getPlayerBySteamId(steam64id);
    const cs2 = player.games?.cs2 || {};

    const [stats, history, ranking] = await Promise.all([
      this.getPlayerStats(player.player_id),
      this.getMatchHistory(player.player_id),
      this.getPlayerRanking(player.player_id, cs2.region)
    ]);

    const lifetime = stats.lifetime || {};

    return {
      nickname: player.nickname,
      avatar: player.avatar,
      country: player.country,
      createdAt: player.activated_at,
      elo: cs2.faceit_elo,
      level: cs2.skill_level,
      ranking,
      matches: lifetime['Matches'],
      kd: lifetime['Average K/D Ratio'],
      hsPercent: lifetime['Average Headshots %'],
      winRate: lifetime['Win Rate %'],
      avgKills: lifetime['Average Kills'],
      recentResults: this.parseRecentResults(history.items, player.player_id)
    };
  }
};
