# Tajwal 360

A 360° virtual tour builder that runs entirely in the browser. Images stay on the
machine that opened the page, and a finished tour exports as one self-contained HTML
file you can put on any host.

**[Open the studio →](https://yousef-dev921.github.io/tajwal-360/)**

![The editor with a panorama loaded, a navigation hotspot, and the scene list](docs/screenshot.png)

The interface is available in Arabic (RTL) and English (LTR), with an auto, light or
dark theme. Both choices are remembered in `localStorage` and applied before the first
paint, so a return visit never flashes the wrong theme or direction.

## Trade-offs

Everything is served as static files, which keeps hosting free and removes CDN
dependencies — Three.js is vendored locally, so the editor works offline.

The cost is that a project lives in one browser profile. Clearing site data, private
browsing, or moving to another machine loses it. The editor is explicit about this: it
reports when storage is unavailable, warns before the quota fills, and periodically
prompts for a backup download.

## Features

### Editing
- Load several panoramas at once, by file picker or drag-and-drop. Anything wider than
  4096px is downscaled; anything that is not roughly 2:1 is placed as a flat panel
  instead of being stretched across the sphere.
- Link hotspots and info hotspots, in six shapes, with adjustable colour and size.
  Drag a hotspot in the panorama to move it.
- 60 steps of undo and redo.
- Scene thumbnails, drag-to-reorder, rename and delete.
- Nadir patch to cover the tripod, background audio, and a floor plan with one marker
  per scene.
- Per-scene start angle and north direction.
- Generated `<iframe>` embed code.

### Interface
- Arabic and English, switched from the panel header. Every string lives in one
  dictionary in `app.js`; static markup is translated through `data-i18n` attributes.
- Switching language sets `lang` and `dir` on the document and re-renders the scene
  list, the hotspot editor and the project library.
- A three-state theme control — auto, light, dark — sets `data-theme` on the document.
  Auto follows the operating system.
- An exported tour opens in the language its author was using, and carries no switcher.

### Viewing
- Walkthrough transitions: the camera turns toward the hotspot, pushes in, then
  cross-fades to the next scene while preserving heading.
- A start screen built from the first scene.
- Neighbouring scenes are preloaded.
- Pinch zoom on touch, wheel zoom on desktop, and full keyboard control.
- Device gyroscope, and WebXR VR mode with an in-headset info panel.

### Projects
- A project library with thumbnails and timestamps.
- Autosave that reports failures instead of hiding them.
- Export to a standalone HTML tour, or save and import projects as `.json`.

## Try it

[`samples/`](samples/) holds three CC0 panoramas. Drop them on the editor to build a
tour without needing your own 360° photos.

## How projects are stored

IndexedDB database `vrtour`, object store `k`:

| Key | Contents |
| --- | --- |
| `idx` | Project list: title, scene count, timestamp, thumbnail |
| `p:<id>` | Project document, **without image bytes** |
| `b:<id>:<sceneId>` | Panorama as a binary `Blob` |
| `a:<id>` | Audio track as a `Blob` |
| `last` | Most recently opened project |

Keeping images out of the document is what makes autosave cheap. Autosave runs on
every edit, including each keystroke in the title field. With images inline, the whole
project was rewritten each time — roughly 180 KB per keystroke for two scenes. The
document is now about 4 KB, and only images that actually changed are written. Storing
them as `Blob`s rather than base64 also drops the 33% encoding overhead.

Projects written by older builds are migrated on first load.

## Project file format

```json
{
  "v": 1,
  "lang": "ar",
  "title": "Tour title",
  "desc": "Short description",
  "nadir": { "img": "data:image/png;base64,...", "r": 25 },
  "audio": { "src": "data:audio/mpeg;base64,...", "name": "track.mp3", "vol": 0.6 },
  "plan":  { "img": "data:image/jpeg;base64,..." },
  "eurl": "https://...",
  "auto": false,
  "walk": true,
  "scenes": [{
    "id": "abc123",
    "name": "Entrance",
    "img": "data:image/jpeg;base64,...",
    "th":  "data:image/jpeg;base64,...",
    "u0": 0.8, "p0": 0, "n": 0.25,
    "pp": { "x": 0.4, "y": 0.6 },
    "hs": [{
      "id": "x1", "type": "link", "to": "<sceneId>",
      "label": "", "text": "", "shape": "arrow",
      "color": "#4f46e5", "size": 1, "u": 0.84, "v": 0.6
    }]
  }]
}
```

- Root `v` is the schema version. Inside a hotspot, `v` is a coordinate — the two are
  unrelated.
- `lang` is the interface language an exported tour opens in, `ar` or `en`. The editor
  ignores it on import and keeps its own choice.
- Hotspot `u` and `v` are equirectangular coordinates from 0 to 1: `u` horizontally
  from the left edge, `v` vertically from the top.
- `u0` and `p0` are the scene's starting yaw and pitch; `n` is its north offset.
- `pp` is the scene's position on the floor plan, also 0 to 1.

## Development

No build step. Serve the directory over HTTP:

```bash
python3 -m http.server 8000
```

Opening `index.html` directly shows the editor, but export will not work: it reads
`app.js`, `style.css` and `three.min.js` with `fetch`, which `file://` blocks.

```
index.html          markup, icon sprite, content security policy
boot.js             applies the stored theme and language before the first paint
style.css           design tokens, light and dark themes, RTL and LTR layout
app.js              editor, viewer, storage and the Arabic/English dictionary
vendor/three.min.js Three.js r128 (MIT)
samples/            CC0 panoramas for testing
```

After changing `app.js`, `boot.js` or `style.css`, bump the `?v=` query in
`index.html`. Without it, returning visitors keep the cached copy.

## Deployment

Static files at the root of any host. This repository deploys to GitHub Pages from
`main`. HTTPS is required — the gyroscope and WebXR will not start without it — and
GitHub Pages, Cloudflare Pages and Netlify all provide it on free tiers.

## Accessibility

Colour pairs are checked numerically: text at 4.5:1 or better (WCAG 1.4.3), control
borders and focus rings at 3:1 or better (WCAG 1.4.11). Touch targets are 44px on
coarse pointers (WCAG 2.5.5). The panorama is fully keyboard operable, status messages
are announced through `aria-live`, and `prefers-reduced-motion` is respected.

## Limitations

- An exported tour carries about 633 KB of fixed code, mostly Three.js, before any
  imagery, and embeds panoramas as base64. A 15-scene tour reaches tens of megabytes.
- Autosave does not work in private browsing. The editor says so rather than failing
  quietly.
- Safari may evict site storage after a period without visits. Keep `.json` backups.
- Renaming a scene or changing its north direction does not update tours you already
  exported. Export again.
- **VR mode and the gyroscope have not been tested on real hardware.** Verify both
  before relying on them.

## Roadmap

- ZIP export with binary images, to cut tour size.
- A trimmed viewer bundle that leaves out editor code.
- Direct-to-disk saving through the File System Access API.
- Per-scene audio and a view cone on the floor plan.
- More interface languages.

## Credits

Sample panoramas are by Greg Zaal, from [Poly Haven](https://polyhaven.com), released
under CC0. [Three.js](https://threejs.org) is bundled under the MIT licence,
copyright 2010-2021 Three.js Authors.

## Licence

[MIT](LICENSE)
