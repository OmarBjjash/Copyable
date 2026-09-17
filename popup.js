// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const toggleInput = document.getElementById("toggle-extension");
  const statusBadge = document.getElementById("status-badge");
  const statusText = document.getElementById("status-text");
  const currentDomainEl = document.getElementById("current-domain");

  if (chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        try {
          const url = new URL(tabs[0].url);
          if (url.protocol.startsWith("http")) {
            currentDomainEl.textContent = url.hostname;
          } else {
            currentDomainEl.textContent = "Internal Browser Page";
          }
        } catch (e) {
          currentDomainEl.textContent = "Active Tab";
        }
      } else {
        currentDomainEl.textContent = "Active Tab";
      }
    });
  }

  chrome.storage.local.get({ enabled: true }, (result) => {
    const isEnabled = result.enabled !== false;
    toggleInput.checked = isEnabled;
    updateUI(isEnabled);
  });

  toggleInput.addEventListener("change", (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.local.set({ enabled: isEnabled }, () => {
      updateUI(isEnabled);
    });
  });

  function updateUI(isEnabled) {
    if (isEnabled) {
      statusBadge.textContent = "Active";
      statusBadge.className = "badge badge-active";
      statusText.textContent =
        "Copyable is unblocking right-click & text selection.";
    } else {
      statusBadge.textContent = "Disabled";
      statusBadge.className = "badge badge-disabled";
      statusText.textContent = "Copyable is currently paused on all sites.";
    }
  }
});
