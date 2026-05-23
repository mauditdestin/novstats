chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH') {
    const { url, options = {} } = message;

    fetch(url, options)
      .then(async res => {
        if (!res.ok) {
          sendResponse({ ok: false, status: res.status, error: `HTTP ${res.status}` });
          return;
        }
        const data = await res.json();
        sendResponse({ ok: true, data });
      })
      .catch(err => sendResponse({ ok: false, status: 0, error: err.message }));

    return true;
  }

  if (message.type === 'FETCH_XML' || message.type === 'FETCH_HTML') {
    fetch(message.url)
      .then(res => res.text())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));

    return true;
  }
});
