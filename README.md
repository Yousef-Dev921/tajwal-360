# Tajwal 360

A 360° virtual-tour editor that runs entirely in the browser, made for documenting
buildings, and heritage condition surveys in particular.

**[Open the editor →](https://yousef-dev921.github.io/tajwal-360/)**

![The editor in English: a lounge panorama with an info hotspot and two links, the scene list and the scene settings](docs/screenshot.jpg)

## Why Tajwal 360

- **Private.** Images and projects stay in your browser. Nothing is uploaded, and the page's
  security policy blocks requests to other servers.
- **Yours to keep.** A tour exports as one HTML file that opens anywhere, or as a folder for
  any static host, and runs without a network connection. No account and no subscription.
- **Made for surveys.** Scene notes, capture date and position from Exif, markers that lie on
  floors or hang on walls, and 8192 px panoramas for close inspection.
- **Arabic and English**, right-to-left and left-to-right throughout.

## Features

### Editing

- Add many panoramas at once; the import queue shows progress, catches duplicates (renamed
  copies included) and asks before placing an image that isn't 2:1.
- 60 steps of undo and redo; a deleted scene or hotspot can also be restored from its message
  for 10 seconds.
- Level correction for photos shot off level, and a start view, zoom and north per scene.
- Replace a scene's image and keep its hotspots and settings; download the best copy kept.
- A full-screen scene manager for large tours: search, sort, multi-select, drag to reorder,
  hide from navigation, rename in place.
- Search over the scene list once a tour passes 12 scenes.

### Hotspots

- Links between scenes, info points with popup text, and plain text notes on the panorama.
- Seven shapes, text only, or your own icons (PNG, WebP, GIF, JPEG or SVG); any colour,
  size and direction.
- Lay a hotspot on the floor or hang it on a wall, drawn in perspective.
- Multi-line labels on any side of the icon, optionally shown only on hover.
- Copy, paste and duplicate across scenes; a link pasted into its own destination points back.
- New hotspots take the last look used; Apply look restyles a scene or the whole tour.

### Images and scenes

- Panoramas up to 8192 px for desktops, with 4096 px copies for phones and tablets.
- Capture date, GPS position and camera read from Exif; date and position appear in the tour
  only if you turn them on.
- Notes per scene for visitors, such as the findings in that room.
- Square thumbnails rendered from a real view of each scene.
- Floor plan with a marker per scene, tripod patch, cover image and logo.
- Background music, plus a narration clip per scene that lowers the music while it plays.

### Tour viewing

- Walk, fade or cut between scenes, keeping the visitor's sense of direction.
- A thumbnail strip, scene names or no bar, and a searchable grid of the tour's scenes.
- A start screen with title, description and cover.
- Optional click anywhere: a click on empty space walks toward the nearest link.
- Auto-rotate, gyroscope, full screen and WebXR VR mode.
- Save the current view as a 2400 px JPEG.

### Export and sharing

- One self-contained HTML file that opens from disk or any host.
- A folder (ZIP) for static hosts, where visitors download only the scenes they visit and
  their neighbours.
- `.json` backups to move a project between browsers or machines.
- `<iframe>` embed code.

### Accessibility and languages

- Arabic (RTL) and English (LTR); an exported tour opens in its author's language.
- Search that ignores case, accents, Arabic diacritics and alef forms.
- Light, dark and system themes.
- Panorama, scene bar and scene grid work from the keyboard; messages reach screen readers.
- Reduced-motion settings turn transitions into short fades and keep auto-rotate off.
- Text contrast of at least 4.5:1, and 44 px targets on touch screens.

## Quick start

Open the [editor](https://yousef-dev921.github.io/tajwal-360/), add equirectangular
(2:1) panoramas, place hotspots, then export. [`samples/`](samples/) has three CC0
panoramas to try it with.

To run it locally, serve the folder over HTTP and open http://localhost:8000:

```bash
python3 -m http.server 8000
```

Export needs HTTP: from `file://` the editor opens, but can't read its own code to build
the tour.

## Limitations

- **Testing.** Tested in Chromium-based desktop browsers, and on iPhone Safari only in the
  iOS Simulator. Safari and Firefox on desktop, real phones and tablets, the gyroscope and
  VR headsets have not been tested.
- **Storage.** A project lives in one browser profile. Clearing site data, private browsing
  or Safari's seven-day eviction of unvisited sites loses it, so keep `.json` backups. The
  editor warns when storage is refused or nearly full.
- **High resolution** applies to images added after it is turned on; replace earlier images
  to upgrade them. Safari on iPhone and iPad can't make 8192 px masters, and touch devices,
  touch-screen laptops included, always show 4096 px.
- **Export size.** The single file carries about 1 MB of code and grows by a third over each
  image; use the folder for large tours. The folder needs a web server, even a local one.
- Exported tours don't follow later edits; export again.
- Hidden scenes are reached only through hotspots, which the keyboard can't focus.
- In VR the logo, scene bar and grid don't appear, and click anywhere is off.
- Safari on iOS can't set audio volume, so the music pauses during a scene clip instead.

## Development

No build step, no dependencies beyond the vendored Three.js. [docs/architecture.md](docs/architecture.md)
covers storage, exports and memory, and [docs/file-format.md](docs/file-format.md) the
project file.

- **Strings.** Every string exists in both languages in the `I18N` dictionary in `app.js`;
  static markup is translated through `data-i18n` attributes.
- **Cache.** After changing `app.js`, `boot.js` or `style.css`, bump its `?v=` query in
  `index.html`, or returning visitors keep the old copy.
- **Formatting.** Format only the lines you change with [Prettier](https://prettier.io) and
  `.prettierrc.json`, for example through your editor's Format Selection.
- **Security.** The editor's content security policy allows only its own origin; exported
  tours allow no network at all. Treat an imported `.json` as untrusted: validate every
  field and escape every value.
- **Deployment.** Any static host over HTTPS, which the gyroscope and WebXR require. This
  repository deploys to GitHub Pages from `main`.

## Credits

Sample panoramas by Greg Zaal, from [Poly Haven](https://polyhaven.com), CC0.
[Three.js](https://threejs.org) r128 is bundled under the MIT licence.

## Licence

[MIT](LICENSE)
