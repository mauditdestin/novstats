(async () => {
  const url = window.location.href;
  if (!/steamcommunity\.com\/(id|profiles)\/[^\/]+\/?$/.test(url.split('?')[0])) return;
  if (document.querySelector('.novstats-root')) return;

  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
  }

  const steam64id = await getSteam64Id();
  if (!steam64id) return;

  const prefs = await getPrefs();

  const panel = NovStatsUI.create();
  NovStatsUI.inject(panel);
  NovStatsEvents.setup(panel);

  if (!prefs.showLeetify) document.getElementById('ns-sec-leetify').style.display = 'none';
  if (!prefs.showCSStats) document.getElementById('ns-sec-csstats').style.display = 'none';
  if (!prefs.showFaceit)  document.getElementById('ns-sec-faceit').style.display  = 'none';
  if (prefs.compactMode)  panel.classList.add('ns-compact');

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync' || !changes.compactMode) return;
    panel.classList.toggle('ns-compact', changes.compactMode.newValue);
  });

  document.getElementById('ns-leetify-logo-link').href = `https://leetify.com/app/profile/${steam64id}`;
  document.getElementById('ns-csstats-logo-link').href = `https://csstats.gg/player/${steam64id}`;

  const skip = () => Promise.reject(new Error('disabled'));

  const [leetifyResult, csstatsResult, faceitResult] = await Promise.allSettled([
    prefs.showLeetify ? fetchLeetifyStats(steam64id) : skip(),
    prefs.showCSStats ? fetchCSStatsData(steam64id)  : skip(),
    prefs.showFaceit  ? fetchFaceitStats(steam64id)  : skip()
  ]);

  if (prefs.showLeetify) NovStatsDataBinder.bindLeetify(leetifyResult.status === 'fulfilled' ? leetifyResult.value : null);
  if (prefs.showCSStats) NovStatsDataBinder.bindCSStats(csstatsResult.status === 'fulfilled' ? csstatsResult.value : null);
  if (prefs.showFaceit)  NovStatsDataBinder.bindFaceit(faceitResult.status   === 'fulfilled' ? faceitResult.value  : null);
})();

function getPrefs() {
  return new Promise(resolve => {
    chrome.storage.sync.get(
      { showLeetify: true, showCSStats: true, showFaceit: true, compactMode: false },
      resolve
    );
  });
}

async function getSteam64Id() {
  const url = window.location.href;

  const directMatch = url.match(/\/profiles\/(\d{17})/);
  if (directMatch) return directMatch[1];

  for (const script of document.scripts) {
    const m = script.textContent.match(/"steamid"\s*:\s*"(\d{17})"/);
    if (m) return m[1];
  }

  const htmlMatch = document.documentElement.innerHTML.match(/g_steamID\s*=\s*"(\d{17})"/);
  if (htmlMatch) return htmlMatch[1];

  const vanityMatch = url.match(/\/id\/([^/?#]+)/);
  if (vanityMatch) return resolveVanityUrl(vanityMatch[1]);

  return null;
}

function resolveVanityUrl(vanity) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(
      { type: 'FETCH_XML', url: `https://steamcommunity.com/id/${vanity}?xml=1` },
      res => {
        if (!res || !res.ok) return resolve(null);
        const m = res.data.match(/<steamID64>(\d{17})<\/steamID64>/);
        resolve(m ? m[1] : null);
      }
    );
  });
}

async function fetchLeetifyStats(steam64id) {
  const data = await LeetifyAPI.getProfile(steam64id);
  if (!data) throw new Error('no data');
  return data;
}

async function fetchCSStatsData(steam64id) {
  const data = await CSStatsAPI.getProfile(steam64id);
  if (!data) throw new Error('no data');
  return data;
}

async function fetchFaceitStats(steam64id) {
  return FaceitAPI.getAllData(steam64id);
}
