// content.js
let isEnabled = false;

const originalPreventDefault = Event.prototype.preventDefault;
const originalRemoveAllRanges = window.Selection
  ? Selection.prototype.removeAllRanges
  : null;
const originalEmpty = window.Selection ? Selection.prototype.empty : null;

const cssText = `
  *, *::before, *::after,
  table, caption, tbody, thead, tfoot, tr, th, td,
  .table, .table *, table * {
    -webkit-user-select: text !important;
    -moz-user-select: text !important;
    -ms-user-select: text !important;
    user-select: text !important;
    pointer-events: auto !important;
  }
  *::selection, td::selection, th::selection {
    background-color: #3297fd !important;
    color: #ffffff !important;
  }
`;

const STYLE_ID = "force-select-shadow-css";

const protectedEvents = [
  "contextmenu",
  "selectstart",
  "copy",
  "cut",
  "mousedown",
  "mouseup",
  "mousemove",
  "dragstart",
];

const blockingEvents = [
  "contextmenu",
  "selectstart",
  "copy",
  "cut",
  "dragstart",
  "selectionchange",
];

const stopPropagationHandler = (e) => {
  if (isEnabled) {
    e.stopPropagation();
  }
};

const injectCSSIntoRoot = (root) => {
  if (!isEnabled) return;
  if (root.querySelector(`#${STYLE_ID}`)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = cssText;

  if (root.nodeType === Node.DOCUMENT_NODE) {
    (root.head || root.documentElement)?.appendChild(style);
  } else {
    root.appendChild(style);
  }
};

const pierceShadowDOM = (root) => {
  if (!isEnabled) return;
  injectCSSIntoRoot(root);

  const elements = root.querySelectorAll("*");
  elements.forEach((el) => {
    if (el.shadowRoot) {
      pierceShadowDOM(el.shadowRoot);
    }
  });
};

const removeCSSFromRoot = (root) => {
  const style = root.querySelector(`#${STYLE_ID}`);
  if (style) {
    style.remove();
  }
  const elements = root.querySelectorAll("*");
  elements.forEach((el) => {
    if (el.shadowRoot) {
      removeCSSFromRoot(el.shadowRoot);
    }
  });
};

const observer = new MutationObserver(() => {
  if (isEnabled) {
    pierceShadowDOM(document);
  }
});

function applyOverrides() {
  Event.prototype.preventDefault = function () {
    if (isEnabled && protectedEvents.includes(this.type)) {
      return;
    }
    return originalPreventDefault.apply(this, arguments);
  };

  if (window.Selection) {
    Selection.prototype.removeAllRanges = function () {
      if (isEnabled) return;
      if (originalRemoveAllRanges) {
        return originalRemoveAllRanges.apply(this, arguments);
      }
    };
    Selection.prototype.empty = function () {
      if (isEnabled) return;
      if (originalEmpty) {
        return originalEmpty.apply(this, arguments);
      }
    };
  }
}

function enable() {
  if (isEnabled) return;
  isEnabled = true;

  pierceShadowDOM(document);

  blockingEvents.forEach((type) => {
    window.addEventListener(type, stopPropagationHandler, true);
  });

  if (document.documentElement) {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
}

function disable() {
  if (!isEnabled) return;
  isEnabled = false;

  removeCSSFromRoot(document);

  blockingEvents.forEach((type) => {
    window.removeEventListener(type, stopPropagationHandler, true);
  });

  observer.disconnect();

  Event.prototype.preventDefault = originalPreventDefault;
  if (window.Selection) {
    if (originalRemoveAllRanges)
      Selection.prototype.removeAllRanges = originalRemoveAllRanges;
    if (originalEmpty) Selection.prototype.empty = originalEmpty;
  }
}

applyOverrides();

window.addEventListener("COPYABLE_STATE_CHANGE", (e) => {
  const shouldEnable = e.detail && e.detail.enabled;
  if (shouldEnable) {
    applyOverrides();
    enable();
  } else {
    disable();
  }
});

window.dispatchEvent(new CustomEvent("COPYABLE_REQUEST_STATE"));
