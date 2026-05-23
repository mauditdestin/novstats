const keyInput = document.getElementById('faceit-key');
const saveBtn = document.getElementById('save-btn');
const statusEl = document.getElementById('status');
const toggleBtn = document.getElementById('toggle-visibility');

// Load saved key
chrome.storage.sync.get(['faceitApiKey'], ({ faceitApiKey }) => {
  if (faceitApiKey) keyInput.value = faceitApiKey;
});

// Toggle password visibility
toggleBtn.addEventListener('click', () => {
  keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
});

// Save key
saveBtn.addEventListener('click', () => {
  const key = keyInput.value.trim();
  chrome.storage.sync.set({ faceitApiKey: key }, () => {
    showStatus(key ? '&#10003; Clé sauvegardée !' : '&#10003; Clé supprimée', key ? 'ok' : 'warn');
  });
});

keyInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveBtn.click();
});

function showStatus(msg, type) {
  statusEl.innerHTML = msg;
  statusEl.className = `status status-${type}`;
  setTimeout(() => { statusEl.textContent = ''; statusEl.className = 'status'; }, 2500);
}
