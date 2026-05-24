const SPINNER = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" style="color:#66c0f4;flex-shrink:0">
    <path fill="currentColor" d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
      <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
    </path>
  </svg>
`;

const NovStatsUI = {
  create() {
    const root = document.createElement('div');
    root.className = 'profile_customization novstats-root';
    root.innerHTML = `
      <div class="profile_customization_header ns-main-header">
        <div class="ns-main-header-left">
          <span class="ns-logo">NOV<span class="ns-accent">STATS</span></span>
        </div>
        <button class="ns-collapse-btn" title="Réduire">▲</button>
      </div>
      <div class="profile_customization_block">
        ${this._leetifyBlock()}
        ${this._csstatsBlock()}
        ${this._faceitBlock()}
      </div>
    `;
    return root;
  },

  // ── Section Leetify ───────────────────────────────────────────────────
  _leetifyBlock() {
    return `
      <div class="showcase_content_bg ns-section" id="ns-sec-leetify">
        <div class="ns-sec-header">
          <div class="ns-sec-header-left">
            <a id="ns-leetify-logo-link" target="_blank" rel="noopener">
              <img src="${chrome.runtime.getURL('assets/logos/leetify_logo.png')}" class="ns-logo-img" />
            </a>
            <div class="ns-premier-header" id="ns-leetify-premier-header" style="display:none">
              <div class="ns-premier-chip" id="ns-leetify-premier-wrap"></div>
            </div>
            <div class="ns-sec-meta">
              <span class="ns-sec-title">Leetify</span>
              <span class="ns-sec-sub">Skill ratings</span>
            </div>
          </div>
          <div class="ns-sec-header-right">
            <img src="${chrome.runtime.getURL('assets/logos/leetify_badge.png')}" class="ns-badge-img" />
          </div>
        </div>
        <div class="ns-loading" id="ns-leetify-loading">${SPINNER}<span>Chargement Leetify…</span></div>
        <div class="ns-error" id="ns-leetify-error" style="display:none">
          <span id="ns-leetify-error-msg">&#9888; Profil Leetify introuvable</span>
        </div>
        <div class="ns-details" id="ns-leetify-grid" style="display:none">
          ${this._cell('Matchs',      'leetify-matches')}
          ${this._cell('1er Match',   'leetify-first-match')}
          ${this._cell('Winrate',     'leetify-winrate')}
          ${this._cell('Rating',      'leetify-rating')}
          ${this._cell('Clutching',   'leetify-clutching')}
          ${this._cell('Opening',     'leetify-opening')}
          ${this._cell('Pre-aim',     'leetify-preaim')}
          ${this._cell('Reaction',    'leetify-reaction')}
          ${this._cell('KD',          'leetify-kd')}
          ${this._cell('Aim',         'leetify-aim')}
          ${this._cell('Positioning', 'leetify-positioning')}
          ${this._cell('Utility',     'leetify-utility')}
        </div>
      </div>
    `;
  },

  // ── Section CSStats ───────────────────────────────────────────────────
  _csstatsBlock() {
    return `
      <div class="showcase_content_bg ns-section" id="ns-sec-csstats">
        <div class="ns-sec-header">
          <div class="ns-sec-header-left">
            <a id="ns-csstats-logo-link" target="_blank" rel="noopener">
              <img src="${chrome.runtime.getURL('assets/logos/csstats_logo.png')}" class="ns-logo-img" />
            </a>
            <div class="ns-premier-header" id="ns-premier-header" style="display:none">
              <span class="ns-premier-label">Current</span>
              <div class="ns-premier-chip" id="ns-premier-current-wrap"></div>
              <span class="ns-premier-sep">|</span>
              <span class="ns-premier-label">Best</span>
              <div class="ns-premier-chip" id="ns-premier-best-wrap"></div>
            </div>
          </div>
          <div class="ns-sec-header-right">
            <button class="ns-show-ranks-btn" id="ns-csstats-show-ranks" style="display:none">
              Show all ranks ▾
            </button>
          </div>
        </div>
        <div class="ns-loading" id="ns-csstats-loading">${SPINNER}<span>Chargement CSStats…</span></div>
        <div class="ns-error" id="ns-csstats-error" style="display:none">
          <span id="ns-csstats-error-msg">&#9888; Profil CSStats introuvable</span>
        </div>
        <div class="ns-details" id="ns-csstats-grid" style="display:none">
          ${this._cell('K/D Ratio',     'csstats-kd')}
          ${this._cell('HLTV Rating',   'csstats-hltv')}
          ${this._cell('Matchs',        'csstats-matches')}
          ${this._cell('Winrate',       'csstats-winrate')}
          ${this._cell('HS%',           'csstats-hs')}
          ${this._cell('ADR',           'csstats-adr')}
          ${this._cell('Clutch Chance', 'csstats-clutch')}
          ${this._cell('Best Map',      'csstats-bestmap')}
        </div>
        <div id="ns-csstats-expanded" style="display:none">
          <div class="ns-ranks-divider"></div>
          <div id="ns-ranks-panels"></div>
        </div>
      </div>
    `;
  },

  // ── Section Faceit ────────────────────────────────────────────────────
  _faceitBlock() {
    return `
      <div class="showcase_content_bg ns-section" id="ns-sec-faceit">
        <div class="ns-sec-header">
          <div class="ns-sec-header-left">
            <!--
              IMAGE #4 — Logo Faceit
              Remplace par : <img src="assets/logos/faceit_logo.png" class="ns-logo-img" />
            -->
            <a id="ns-faceit-logo-link" target="_blank" rel="noopener">
              <img src="${chrome.runtime.getURL('assets/logos/faceit_logo.png')}" class="ns-logo-img" />
            </a>
            <div class="ns-faceit-profile" id="ns-faceit-profile" style="display:none">
              <div class="ns-ph ns-ph-level" id="ns-level-ph">LVL</div>
              <div class="ns-faceit-name-block">
                <div class="ns-faceit-name-row">
                  <div class="ns-ph ns-ph-flag" id="ns-flag-ph">&#127988;</div>
                  <span class="ns-faceit-nick" id="ns-faceit-nickname"></span>
                  <span class="ns-faceit-reg" id="ns-faceit-registered"></span>
                </div>
              </div>
            </div>
          </div>
          <div class="ns-sec-header-right">
            <span class="ns-elo" id="ns-elo-val"></span>
          </div>
        </div>
        <div class="ns-loading" id="ns-faceit-loading">${SPINNER}<span>Chargement Faceit…</span></div>
        <div class="ns-error" id="ns-faceit-error" style="display:none">
          <span id="ns-faceit-error-msg">&#9888; Compte Faceit introuvable</span>
        </div>
        <div class="ns-details" id="ns-faceit-grid" style="display:none">
          ${this._cell('Créé le',    'faceit-created')}
          ${this._cell('Matchs',     'faceit-matches')}
          ${this._cell('KD',         'faceit-kd')}
          ${this._cell('HS%',        'faceit-hs')}
          ${this._cell('Winrate',    'faceit-winrate')}
          ${this._cell('Avg. Kills', 'faceit-avg-kills')}
          <div class="ns-cell ns-cell-recent">
            Récents
            <div class="ns-recent-wrap" id="ns-faceit-recent">—</div>
          </div>
        </div>
      </div>
    `;
  },

  _cell(label, id) {
    return `<div class="ns-cell">${label}<span id="ns-${id}">—</span></div>`;
  },

  inject(panel) {
    const targets = ['.profile_leftcol', '.profile_content', '#responsive_page_template_content'];
    for (const sel of targets) {
      const el = document.querySelector(sel);
      if (el) { el.prepend(panel); return; }
    }
    document.body.prepend(panel);
  }
};
