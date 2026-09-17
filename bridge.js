// bridge.js
(function () {
  const STATE_EVENT = "COPYABLE_STATE_CHANGE";
  const REQUEST_EVENT = "COPYABLE_REQUEST_STATE";

  let currentState = true;

  function dispatchState(enabled) {
    currentState = enabled;
    window.dispatchEvent(
      new CustomEvent(STATE_EVENT, {
        detail: { enabled: currentState },
      }),
    );
  }

  chrome.storage.local.get({ enabled: true }, (res) => {
    dispatchState(res.enabled !== false);
  });

  window.addEventListener(REQUEST_EVENT, () => {
    dispatchState(currentState);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.enabled !== undefined) {
      dispatchState(changes.enabled.newValue !== false);
    }
  });
})();
