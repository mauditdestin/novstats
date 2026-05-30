const NovStatsFormatters = {
  date(val) {
    if (!val) return 'N/A';
    const d = new Date(val);
    if (isNaN(d)) return 'N/A';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  kd(val) {
    if (val == null) return 'N/A';
    const n = parseFloat(val);
    return isNaN(n) ? 'N/A' : n.toFixed(2);
  },

  score(val) {
    if (val == null) return 'N/A';
    const n = parseFloat(val);
    return isNaN(n) ? 'N/A' : n.toFixed(1);
  },

  number(val) {
    if (val == null) return 'N/A';
    const n = parseInt(val);
    return isNaN(n) ? 'N/A' : n.toLocaleString('fr-FR');
  },

  kdColor(val) {
    const n = parseFloat(val);
    if (isNaN(n)) return '#3E4855';
    if (n >= 1.3) return '#4ade80';
    if (n >= 1.0) return '#facc15';
    if (n >= 0.7) return '#fb923c';
    return '#f87171';
  },

  scoreColor(val) {
    const n = parseFloat(val);
    if (isNaN(n)) return '#3E4855';
    if (n >= 58) return '#4ade80';
    if (n >= 48) return '#facc15';
    if (n >= 38) return '#fb923c';
    return '#f87171';
  },

  winrateColor(val) {
    const n = parseFloat(val);
    if (isNaN(n)) return '#3E4855';
    const pct = n > 1 ? n : n * 100;
    if (pct >= 55) return '#4ade80';
    if (pct >= 48) return '#facc15';
    if (pct >= 40) return '#fb923c';
    return '#f87171';
  },

  eloColor(elo) {
    const n = parseInt(elo);
    if (!n) return '#3E4855';
    if (n >= 2500) return '#ff6b6b';
    if (n >= 2000) return '#fb923c';
    if (n >= 1500) return '#facc15';
    if (n >= 1000) return '#4ade80';
    return '#94a3b8';
  },

  faceitLevelColor(level) {
    if (level <= 1) return '#dddddd';
    if (level <= 3) return '#47e66e';
    if (level <= 7) return '#fecd23';
    if (level <= 9) return '#fd6c1e';
    return '#e80026';
  },

  premierRankName(rating) {
    if (!rating || rating < 5000)  return 'grey';
    if (rating < 10000) return 'lightblue';
    if (rating < 15000) return 'blue';
    if (rating < 20000) return 'purple';
    if (rating < 25000) return 'pink';
    if (rating < 30000) return 'red';
    return 'gold';
  },

  premierColor(rating) {
    if (!rating)          return '#c4cce2';
    if (rating >= 30000)  return '#ffd700';
    if (rating >= 25000)  return '#eb4b4b';
    if (rating >= 20000)  return '#f03cff';
    if (rating >= 15000)  return '#c166ff';
    if (rating >= 10000)  return '#6a7dff';
    if (rating >= 5000)   return '#8cc6ff';
    return '#c4cce2';
  },

  premierFormat(rating) {
    if (rating == null) return '—';
    if (rating === 0)   return '---';
    return new Intl.NumberFormat('en-US').format(rating);
  },

  premierBg(rating) {
    return chrome.runtime.getURL(`assets/premier_ratings/${this.premierRankName(rating)}.svg`);
  },

  premierCoin(season, rating, wins) {
    if (wins < 25)    return chrome.runtime.getURL(`assets/premier_coins/${season}.png`);
    if (season === 1) return chrome.runtime.getURL('assets/premier_coins/1.png');
    const color    = this.premierRankName(rating ?? 0);
    const progress = wins < 50 ? '1' : wins < 75 ? '2' : wins < 100 ? '3' : wins < 125 ? '4' : '5';
    return chrome.runtime.getURL(`assets/premier_coins/${season}_${color}_${progress}.png`);
  },

  mapIcon(mapName) {
    const key = (mapName || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    return chrome.runtime.getURL(`assets/map_icons/${key}.png`);
  },
};
