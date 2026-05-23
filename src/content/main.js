(async () => {
  const url = window.location.href;
  if (!url.includes('/profiles/') && !url.includes('/id/')) return;
  if (document.querySelector('.novstats-root')) return;

  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
  }

  const steam64id = await getSteam64Id();
  if (!steam64id) return;

  const panel = NovStatsUI.create();
  NovStatsUI.inject(panel);
  NovStatsEvents.setup(panel);

  document.getElementById('ns-leetify-logo-link').href = `https://leetify.com/app/profile/${steam64id}`;
  document.getElementById('ns-csstats-logo-link').href = `https://csstats.gg/player/${steam64id}`;

  const [leetifyResult, csstatsResult, faceitResult] = await Promise.allSettled([
    fetchLeetifyStats(steam64id),
    fetchCSStatsData(steam64id),
    fetchFaceitStats(steam64id)
  ]);

  NovStatsDataBinder.bindLeetify(leetifyResult.status === 'fulfilled' ? leetifyResult.value : null);
  NovStatsDataBinder.bindCSStats(csstatsResult.status === 'fulfilled' ? csstatsResult.value : null);
  NovStatsDataBinder.bindFaceit(faceitResult.status  === 'fulfilled' ? faceitResult.value  : null);
})();

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
  const raw = await LeetifyAPI.getProfile(steam64id);
  const stats = LeetifyAPI.extractStats(raw);
  if (!stats) throw new Error('no data');
  return stats;
}

async function fetchCSStatsData(steam64id) {
  const data = await CSStatsAPI.getProfile(steam64id);
  if (!data) throw new Error('no data');
  return data;
}

async function fetchFaceitStats(steam64id) {
  try {
    return await FaceitAPI.getAllData(steam64id);
  } catch (e) {
    if (e.message === 'NO_API_KEY') return { error: 'NO_API_KEY' };
    throw e;
  }
}
