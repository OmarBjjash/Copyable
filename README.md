# Copyable: Ultimate Text Selection & Right-Click Enabler

A lightweight, aggressive Manifest V3 browser extension that forcefully re-enables text selection, copying, and right-click context menus on heavily restricted websites.

Unlike basic CSS-override extensions, **Copyable** is designed to defeat modern anti-copying techniques, including Shadow DOM encapsulation (Web Components), dynamic JavaScript event blocking, and continuous selection clearing.

## ✨ Features

- **Shadow DOM Piercing:** Recursively traverses closed-off Web Components to inject selection-enabling CSS directly into isolated DOM trees (ideal for modern e-learning and assessment platforms).
- **JS Event Neutralization:** Intercepts and blocks anti-selection JavaScript events (`selectstart`, `copy`, `mousedown`, `contextmenu`) during the capture phase.
- **`preventDefault` Override:** Executes in the `MAIN` page world to override `Event.prototype.preventDefault`, forcing the browser to ignore website scripts that try to cancel mouse clicks and native menus.
- **Selection Persistence:** Patches the `window.Selection` prototype to neutralize scripts that continuously call `removeAllRanges()` or `empty()` when you try to drag your mouse.
- **IFrame Support:** Executes across all nested frames (`"all_frames": true`).
- **Manifest V3:** Built using the latest modern Chrome extension standards.

## 🚀 Installation (Developer Mode)

Since this extension is not currently in the Chrome Web Store, you can install it locally:

1. Clone this repository or download the ZIP file and extract it.

   ```bash
   git clone https://github.com/OmarBjjash/Copyable.git
   ```

2. Open Google Chrome (or any Chromium-based browser like Edge, Brave, or Vivaldi).
3. Navigate to the extensions page: `chrome://extensions/`
4. Toggle on **Developer mode** in the top right corner.
5. Click **Load unpacked** in the top left corner.
6. Select the `copyable` folder you just downloaded.
7. The extension is now active! (Refresh any open tabs for it to take effect).

## 📁 File Structure

```text
 copyable
├──  icons/
├──  bridge.js
├──  content.js
├──  LICENSE
├──  manifest.json
├──  popup.css
├──  popup.html
├──  popup.js
└──  README.md

```

## 🛠️ How it Works Under the Hood

Modern websites use a combination of techniques to prevent copying. This extension tackles them sequentially:

1. **The CSS Layer:** Injects `user-select: text !important` globally and explicitly targeting `table` tags.
2. **The Shadow DOM Layer:** Traditional CSS injection cannot style Web Components. The script uses a recursive function to find `element.shadowRoot` nodes and injects stylesheets directly inside their encapsulated walls.
3. **The Event Layer:** Injects into the `"world": "MAIN"` context, allowing it to modify the webpage's native JavaScript environment. It wipes inline `onmousedown` handlers and stops anti-copy event listeners in the capture phase.
4. **Dynamic Mutation:** Uses a lightweight `MutationObserver` to watch for newly loaded Web Components (SPAs/React/Angular apps) and instantly applies unlocking rules to them.

## 🤝 Contributing

Pull requests are welcome! If you find a website where the extension fails to unblock text selection, please open an Issue with the URL and details about the specific element blocking the selection.

## 📄 License

This project is open-source and available under the [MIT License](https://github.com/OmarBjjash/Copyable/blob/main/LICENSE).
