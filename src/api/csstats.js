const CSStatsAPI = {
  async fetchHtml(url) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'FETCH_HTML', url }, res => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (res.ok) resolve(res.data);
        else reject(new Error(res.error));
      });
    });
  },

  async getProfile(steam64id) {
    const cacheKey = `csstats_${steam64id}`;
    const cached = NovStatsCache.get(cacheKey);
    if (cached) return cached;

    const parser = new DOMParser();

    const [profileHtml, statsHtml] = await Promise.all([
      this.fetchHtml(`https://csstats.gg/player/${steam64id}`),
      this.fetchHtml(`https://csstats.gg/player/${steam64id}/stats`)
    ]);

    if (!profileHtml) return null;
    const profile = parser.parseFromString(profileHtml, 'text/html');

    if (profile.querySelector('#outer-wrapper h1')?.textContent.trim() === 'Private Profile') {
      return { error: 'private' };
    }

    if (!statsHtml) return null;
    const stats = parser.parseFromString(statsHtml, 'text/html');
    if (!stats.querySelector('.content-sub-nav-outer')) return { error: 'not found' };

    // ── K/D et HLTV Rating ──
    const kdRatio   = parseFloat(stats.querySelector('#kpd span')?.textContent?.trim());
    const hltvRating = parseFloat(stats.querySelector('#rating span')?.textContent?.trim());

    // ── Stat panels ──
    let winRate = null, matches = null, hsPercent = null, adr = null, clutch = null;

    const getPanelValue = (panel) => {
      const text = panel.querySelector("[style*='font-size:34px']")?.childNodes[0]?.textContent.trim();
      return text ? parseInt(text) : null;
    };

    stats.querySelectorAll('.stat-panel').forEach(panel => {
      const heading = panel.querySelector('.stat-heading')?.textContent.trim();
      if (!heading) return;
      if (heading === 'Win Rate') {
        winRate = getPanelValue(panel);
        matches = parseInt(panel.querySelector('.total-value')?.textContent.trim()) || null;
      } else if (heading.includes('HS') && hsPercent === null) {
        hsPercent = getPanelValue(panel);
      } else if (heading.includes('ADR')) {
        adr = getPanelValue(panel);
      } else if (heading.includes('Clutch')) {
        clutch = getPanelValue(panel);
      }
    });

    const getRating = (container) => {
      if (!container) return null;
      const span = container.querySelector('.cs2rating span');
      if (!span) return null;
      const main = span.childNodes[0]?.textContent.trim();
      if (!main || main === '---') return 0;
      const decimal = span.querySelector('small')?.textContent.trim().replace(',', '') ?? '';
      return parseInt(main + decimal);
    };

    const premierRatings = [];
    profile.querySelectorAll('#player-ranks .ranks').forEach(rankDiv => {
      const icon = rankDiv.querySelector('.icon');
      if (!icon) return;
      const alt = icon.querySelector('img')?.getAttribute('alt') ?? '';
      if (!alt.startsWith('Premier')) return;

      const wins        = parseInt(rankDiv.querySelector('.bottom .wins b')?.textContent.trim()) || 0;
      const seasonMatch = alt.match(/Season (\d+)/);

      premierRatings.push({
        season:        seasonMatch ? parseInt(seasonMatch[1]) : 1,
        latest_rating: getRating(rankDiv.querySelector('.rank')),
        best_rating:   getRating(rankDiv.querySelector('.best')),
        wins
      });
    });

    // ── Map avec le meilleur winrate ──
    // Les sections de map contiennent un canvas dont l'ID est "{mapname}-wr-chart-canvas"
    // On essaie de trouver un texte de winrate dans la section, sinon on prend la 1ère map
    let bestMap = null;
    let bestMapWR = -1;

    stats.querySelectorAll('#player-maps > div').forEach(section => {
      const canvas = section.querySelector('canvas[id$="-wr-chart-canvas"]');
      if (!canvas) return;
      const mapName = canvas.id.replace('-wr-chart-canvas', '');

      // Cherche un % de winrate textuel dans la même section
      const wrEl = section.querySelector('.wr-val, .win-rate-val, [class*="wr"]');
      const wrText = wrEl?.textContent.replace('%', '').trim();
      const wr = wrText ? parseFloat(wrText) : null;

      if (wr !== null && !isNaN(wr) && wr > bestMapWR) {
        bestMapWR = wr;
        bestMap   = mapName;
      }
    });

    // Fallback : première map listée
    if (!bestMap) {
      bestMap = stats.querySelector('#player-maps canvas')?.id.replace('-wr-chart-canvas', '') ?? null;
    }

    const currentPremier = premierRatings[0]?.latest_rating ?? null;
    const bestPremier    = premierRatings.length
      ? premierRatings.reduce((m, r) => Math.max(m, r.best_rating ?? 0), 0) || null
      : null;

    const data = {
      kd: isNaN(kdRatio)   ? null : kdRatio,
      hltvRating: isNaN(hltvRating) ? null : hltvRating,
      matches,
      winRate,
      hsPercent,
      adr,
      clutch,
      bestMap,
      currentPremier,
      bestPremier
    };

    NovStatsCache.set(cacheKey, data);
    return data;
  }
};
