const NovStatsDataBinder = {

  // ── Leetify ────────────────────────────────────────────────────────────
  bindLeetify(data) {
    const loading = document.getElementById('ns-leetify-loading');
    const error   = document.getElementById('ns-leetify-error');
    const grid    = document.getElementById('ns-leetify-grid');

    loading.style.display = 'none';

    if (!data) { error.style.display = 'flex'; return; }

    if (data.status === 404) {
      document.getElementById('ns-leetify-error-msg').textContent = '⚠ Profil non enregistré sur Leetify';
      error.style.display = 'flex'; return;
    }

    grid.style.display = 'grid';

    const s = data.stats || {};

    const premier = s.premier_rating ?? null;
    if (premier != null) {
      document.getElementById('ns-leetify-premier-header').style.display = 'flex';
      this._fillPremierChip('ns-leetify-premier-wrap', premier);
    }

    this._set('leetify-matches',     NovStatsFormatters.number(s.matches));
    this._set('leetify-first-match', NovStatsFormatters.date(s.first_match));
    this._set('leetify-winrate',     s.win_rate != null ? s.win_rate + '%' : null);
    this._set('leetify-rating',      NovStatsFormatters.score(s.leetify_rating));
    this._set('leetify-clutching',   NovStatsFormatters.score(s.clutching));
    this._set('leetify-opening',     NovStatsFormatters.score(s.opening));
    this._set('leetify-preaim',      s.preaim_angle != null ? s.preaim_angle + '°' : null);
    this._set('leetify-reaction',    s.reaction_time != null ? s.reaction_time + ' ms' : null);
    this._set('leetify-kd',          NovStatsFormatters.kd(s.kd_ratio),          NovStatsFormatters.kdColor(s.kd_ratio));
    this._set('leetify-aim',         NovStatsFormatters.score(s.aim_rating),      NovStatsFormatters.scoreColor(s.aim_rating));
    this._set('leetify-positioning', NovStatsFormatters.score(s.positioning),     NovStatsFormatters.scoreColor(s.positioning));
    this._set('leetify-utility',     NovStatsFormatters.score(s.utility),         NovStatsFormatters.scoreColor(s.utility));
  },

  // ── CSStats ────────────────────────────────────────────────────────────
  bindCSStats(data) {
    const loading = document.getElementById('ns-csstats-loading');
    const error   = document.getElementById('ns-csstats-error');
    const grid    = document.getElementById('ns-csstats-grid');

    loading.style.display = 'none';

    if (!data) { error.style.display = 'flex'; return; }

    if (data.error === 'private') {
      document.getElementById('ns-csstats-error-msg').textContent = '&#128274; Profil CSStats privé';
      error.style.display = 'flex'; return;
    }
    if (data.error === 'not found') {
      error.style.display = 'flex'; return;
    }

    // ── ELO Premier dans le header ──
    if (data.currentPremier != null || data.bestPremier != null) {
      document.getElementById('ns-premier-header').style.display = 'flex';
      this._fillPremierChip('ns-premier-current-wrap', data.currentPremier);
      this._fillPremierChip('ns-premier-best-wrap',    data.bestPremier);
    }

    grid.style.display = 'grid';

    // ── Section expandable (Competitive / Premier / Wingman) ──
    const hasRankData = data.competitive?.length || data.premierSeasons?.length || data.wingman;
    if (hasRankData) {
      const toggleBtn = document.getElementById('ns-csstats-show-ranks');
      const expanded  = document.getElementById('ns-csstats-expanded');
      const panelsEl  = document.getElementById('ns-ranks-panels');

      if (panelsEl) panelsEl.appendChild(this._buildRanksPanels(data));

      if (toggleBtn && expanded) {
        toggleBtn.style.display = 'inline';
        toggleBtn.addEventListener('click', () => {
          const open = expanded.style.display !== 'none';
          expanded.style.display = open ? 'none' : 'block';
          toggleBtn.textContent  = open ? 'Show all ranks ▾' : 'Hide ranks ▴';
        });
      }
    }

    this._set('csstats-kd',      NovStatsFormatters.kd(data.kd),           NovStatsFormatters.kdColor(data.kd));
    this._set('csstats-hltv',    data.hltvRating != null ? parseFloat(data.hltvRating).toFixed(2) : 'N/A');
    this._set('csstats-matches', NovStatsFormatters.number(data.matches));
    this._set('csstats-winrate', data.winRate != null ? data.winRate + '%' : 'N/A', NovStatsFormatters.winrateColor(data.winRate));
    this._set('csstats-hs',      data.hsPercent != null ? data.hsPercent + '%' : 'N/A');
    this._set('csstats-adr',     data.adr != null ? String(data.adr) : 'N/A');
    this._set('csstats-clutch',  data.clutch != null ? data.clutch + '%' : 'N/A');
    this._set('csstats-bestmap', data.bestMap || 'N/A');
  },

  // ── Faceit ─────────────────────────────────────────────────────────────
  bindFaceit(data) {
    const loading = document.getElementById('ns-faceit-loading');
    const error   = document.getElementById('ns-faceit-error');
    const grid    = document.getElementById('ns-faceit-grid');

    loading.style.display = 'none';

    if (!data) { error.style.display = 'flex'; return; }

    grid.style.display = 'grid';

    const profile = document.getElementById('ns-faceit-profile');
    profile.style.display = 'flex';

    // Icône de niveau (challenger si top 1000, sinon 1–10)
    const levelPh = document.getElementById('ns-level-ph');
    if (levelPh && data.level) {
      const isChallenger = data.ranking > 0 && data.ranking <= 1000;
      const iconFile = isChallenger ? 'challenger' : data.level;
      const img = document.createElement('img');
      img.src   = chrome.runtime.getURL(`assets/faceit_levels/${iconFile}.png`);
      img.style.cssText = 'height:36px;width:auto;';
      img.style.filter  = `drop-shadow(${_faceitLevelColor(data.level)} 0 0 5px)`;
      img.title = isChallenger ? `Challenger — Rank #${data.ranking}` : `Level ${data.level}`;
      img.onerror = () => { img.style.display = 'none'; };
      levelPh.replaceWith(img);
    }

    // Drapeau pays
    const flagPh = document.getElementById('ns-flag-ph');
    if (flagPh && data.country) {
      const img = document.createElement('img');
      img.src   = `https://flagsapi.com/${data.country.toUpperCase()}/flat/24.png`;
      img.style.cssText = 'height:18px;width:auto;';
      img.onerror = () => { img.style.display = 'none'; };
      flagPh.replaceWith(img);
    }

    document.getElementById('ns-faceit-nickname').textContent = data.nickname || '—';
    if (data.nickname) {
      const link = document.getElementById('ns-faceit-logo-link');
      if (link) link.href = `https://www.faceit.com/en/players/${data.nickname}`;
    }
    const memberEl = document.getElementById('ns-faceit-registered');
    if (memberEl && data.membership) {
      const lc = data.membership.toLowerCase();
      let label, color;
      if (lc === 'premium')                       { label = 'Faceit Premium'; color = '#ff5500'; }
      else if (lc === 'free+' || lc === 'plus')   { label = 'Faceit Plus';    color = '#ffaa00'; }
      else                                         { label = 'Free';           color = '#6b7d8e'; }
      memberEl.textContent = '· ' + label;
      memberEl.style.color = color;
    }

    const eloEl = document.getElementById('ns-elo-val');
    eloEl.textContent = data.elo || '—';
    if (data.elo) eloEl.style.color = NovStatsFormatters.eloColor(parseInt(data.elo));

    this._set('faceit-created',  NovStatsFormatters.date(data.createdAt));
    this._set('faceit-matches',  NovStatsFormatters.number(data.matches));
    this._set('faceit-kd',       NovStatsFormatters.kd(data.kd),   NovStatsFormatters.kdColor(data.kd));
    this._set('faceit-hs',       data.hsPercent  ? parseFloat(data.hsPercent).toFixed(1) + '%'  : 'N/A');
    this._set('faceit-winrate',  data.winRate    ? parseFloat(data.winRate).toFixed(1) + '%'    : 'N/A',
      NovStatsFormatters.winrateColor(data.winRate));
    this._set('faceit-avg-kills',data.avgKills   ? parseFloat(data.avgKills).toFixed(1)         : 'N/A');

    this._bindRecent(data.recentResults || []);
  },

  _bindRecent(results) {
    const container = document.getElementById('ns-faceit-recent');
    if (!container) return;
    container.innerHTML = '';
    if (!results.length) { container.textContent = '—'; return; }
    results.forEach(r => {
      const span = document.createElement('span');
      span.textContent = r;
      span.className = r === 'W' ? 'ns-result-w' : r === 'L' ? 'ns-result-l' : 'ns-result-unknown';
      container.appendChild(span);
    });
  },

  // ── Ranks panels builder ───────────────────────────────────────────────
  _buildRanksPanels(data) {
    const container = document.createElement('div');
    container.className = 'ns-ranks-panels';

    // LEFT — Competitive maps
    if (data.competitive?.length) {
      const panel = document.createElement('div');
      panel.className = 'ns-ranks-panel';
      const rows = data.competitive.map(m =>
        this._makeRankRow(
          NovStatsFormatters.mapIcon(m.map), m.mapImg,
          m.map, m.wins,
          this._makeRankBadge(m.currentImg),
          this._makeRankBadge(m.bestImg)
        )
      );
      panel.appendChild(this._makeRankSection('Competitive', 'Map', rows, 'competitive'));
      container.appendChild(panel);
    }

    // RIGHT — Premier seasons + Wingman
    const right = document.createElement('div');
    right.className = 'ns-ranks-panel';

    if (data.premierSeasons?.length) {
      const rows = data.premierSeasons.map(s => {
        const cur  = document.createElement('div');
        cur.className = 'ns-ranks-badge';
        cur.appendChild(this._makePremierChipEl(s.latest_rating));

        const best = document.createElement('div');
        best.className = 'ns-ranks-badge';
        best.appendChild(this._makePremierChipEl(s.best_rating));

        const coinSrc = NovStatsFormatters.premierCoin(s.season, s.best_rating ?? 0, s.wins);
        return this._makeRankRow(
          coinSrc, `S${s.season}`,
          `Season ${s.season}`, s.wins,
          cur, best
        );
      });
      right.appendChild(this._makeRankSection('Premier', 'Season', rows, 'premier'));
    }

    if (data.wingman) {
      const row = this._makeRankRow(
        data.wingman.iconImg, 'WM',
        'Wingman', data.wingman.wins,
        this._makeRankBadge(data.wingman.currentImg),
        this._makeRankBadge(data.wingman.bestImg)
      );
      right.appendChild(this._makeRankSection('Wingman', 'Mode', [row], 'wingman'));
    }

    if (right.children.length) container.appendChild(right);
    return container;
  },

  _makeRankSection(title, col1Label, rows, type) {
    const section = document.createElement('div');
    section.className = 'ns-ranks-section' + (type ? ` ns-ranks-section--${type}` : '');

    const titleEl = document.createElement('div');
    titleEl.className = 'ns-ranks-section-title';
    titleEl.textContent = title;
    section.appendChild(titleEl);

    const header = document.createElement('div');
    header.className = 'ns-ranks-col-header';
    [col1Label, 'Current', 'Best'].forEach(label => {
      const span = document.createElement('span');
      span.textContent = label;
      header.appendChild(span);
    });
    section.appendChild(header);

    rows.forEach(row => section.appendChild(row));
    return section;
  },

  _makeRankRow(iconSrc, iconFallback, name, wins, currentEl, bestEl) {
    const row = document.createElement('div');
    row.className = 'ns-ranks-row';

    const info = document.createElement('div');
    info.className = 'ns-ranks-info';
    info.appendChild(this._makeIconEl(iconSrc, iconFallback));

    const text = document.createElement('div');
    text.className = 'ns-ranks-text';
    const nameEl = document.createElement('span');
    nameEl.className = 'ns-ranks-name';
    nameEl.textContent = name;
    const winsEl = document.createElement('span');
    winsEl.className = 'ns-ranks-wins';
    winsEl.textContent = 'Wins: ' + wins;
    text.append(nameEl, winsEl);
    info.appendChild(text);

    row.append(info, currentEl, bestEl);
    return row;
  },

  _makeIconEl(src, fallback) {
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.className = 'ns-ranks-icon';
      img.onerror = () => img.replaceWith(this._makeIconEl(null, fallback));
      return img;
    }
    if (fallback && (fallback.startsWith('http') || fallback.startsWith('chrome-extension'))) {
      const img = document.createElement('img');
      img.src = fallback;
      img.className = 'ns-ranks-icon';
      img.onerror = () => img.replaceWith(this._makeIconEl(null, null));
      return img;
    }
    const ph = document.createElement('div');
    ph.className = 'ns-ph ns-ranks-ph';
    ph.textContent = (fallback || '?').slice(0, 3).toUpperCase();
    return ph;
  },

  _makeRankBadge(imgSrc) {
    const wrap = document.createElement('div');
    wrap.className = 'ns-ranks-badge';
    if (imgSrc) {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.onerror = () => { img.style.display = 'none'; };
      wrap.appendChild(img);
    }
    return wrap;
  },

  _makePremierChipEl(rating) {
    const el = document.createElement('div');
    el.className = 'ns-premier-rating';
    const bg = document.createElement('img');
    bg.src = NovStatsFormatters.premierBg(rating);
    el.appendChild(bg);
    const label = document.createElement('span');
    label.style.color = NovStatsFormatters.premierColor(rating);
    label.textContent = NovStatsFormatters.premierFormat(rating);
    el.appendChild(label);
    return el;
  },

  _fillPremierChip(wrapperId, rating) {
    const wrap = document.getElementById(wrapperId);
    if (!wrap) return;
    wrap.innerHTML = '';
    wrap.appendChild(this._makePremierChipEl(rating));
  },

  _set(id, value, color) {
    const el = document.getElementById(`ns-${id}`);
    if (!el) return;
    el.textContent = value || '—';
    if (color) el.style.color = color;
  }
};

function _faceitLevelColor(level) {
  if (level <= 1) return '#dddddd';
  if (level <= 3) return '#47e66e';
  if (level <= 7) return '#fecd23';
  if (level <= 9) return '#fd6c1e';
  return '#e80026';
}
