chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH') {
    fetch(message.url, message.options ?? {})
      .then(async res => {
        if (!res.ok) return sendResponse({ ok: false, status: res.status, error: `HTTP ${res.status}` });
        sendResponse({ ok: true, data: await res.json() });
      })
      .catch(err => sendResponse({ ok: false, status: 0, error: err.message }));
    return true;
  }

  if (message.type === 'FETCH_TEXT') {
    fetch(message.url)
      .then(res => res.text())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }
});
