// 1. The CSS rules to inject
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

// 2. Inject CSS into a specific root (either the main document or a shadow root)
const injectCSSIntoRoot = (root) => {
  const styleId = "force-select-shadow-css";
  // Check if we already injected into this specific root
  if (root.querySelector(`#${styleId}`)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = cssText;

  if (root.nodeType === Node.DOCUMENT_NODE) {
    (root.head || root.documentElement).appendChild(style);
  } else {
    root.appendChild(style); // Append directly into the Shadow DOM
  }
};

// 3. Recursively find all Shadow DOMs and inject the CSS
const pierceShadowDOM = (root) => {
  injectCSSIntoRoot(root);

  // Find all elements within the current root
  const elements = root.querySelectorAll("*");
  elements.forEach((el) => {
    // If the element has a Shadow DOM attached, dive inside it
    if (el.shadowRoot) {
      pierceShadowDOM(el.shadowRoot);
    }
  });
};

// 4. Override event cancellations (Stops JS blocks before they reach the Shadow DOM)
const unblockPreventDefault = () => {
  const originalPreventDefault = Event.prototype.preventDefault;
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

  Event.prototype.preventDefault = function () {
    if (protectedEvents.includes(this.type)) return;
    return originalPreventDefault.apply(this, arguments);
  };
};

const stopBlockingListeners = () => {
  const events = [
    "contextmenu",
    "selectstart",
    "copy",
    "cut",
    "dragstart",
    "selectionchange",
  ];
  events.forEach((type) => {
    window.addEventListener(type, (e) => e.stopPropagation(), true);
  });
};

// 5. Neutralize selection clearing
const neutralizeSelectionClearing = () => {
  if (window.Selection) {
    Selection.prototype.removeAllRanges = function () {};
    Selection.prototype.empty = function () {};
  }
};

// Execute
neutralizeSelectionClearing();
try {
  unblockPreventDefault();
} catch (e) {}
stopBlockingListeners();

// Run the Shadow DOM piercer on load
pierceShadowDOM(document);

// Observe the page for new Web Components being added dynamically
const observer = new MutationObserver(() => {
  pierceShadowDOM(document);
});

if (document.documentElement) {
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
