# Tajwal 360

A 360° virtual tour builder that runs entirely in the browser. Images stay on the
machine that opened the page, and a finished tour exports as one self-contained HTML
file you can put on any host.

**[Open the studio →](https://yousef-dev921.github.io/tajwal-360/)**

![The editor in English, with a panorama open, two hotspots and the scene list](docs/screenshot.jpg)

The interface comes in Arabic (RTL) and English (LTR), with an auto/light/dark theme
switch. Both choices persist in `localStorage` and are applied before the first paint,
so a return visit never flashes the wrong theme or direction.

<p dir="rtl" lang="ar">
<b>بالعربية:</b> Tajwal 360 استوديو لبناء جولات افتراضية بصور &#x2066;360°&#x2069; يعمل بالكامل
داخل المتصفح. تبقى الصور على جهازك ولا تُرفع إلى أي خادم، وتُصدَّر الجولة في ملف HTML واحد
يمكن نشره على أي استضافة. الواجهة متاحة بالعربية والإنجليزية، مع مظهر فاتح وداكن.
</p>

## Trade-offs

Everything is served as static files, which keeps hosting free and removes CDN
dependencies. Three.js is vendored locally, so the editor works offline.

The cost is that a project lives in one browser profile. Clearing site data, private
browsing, or moving to another machine loses it, and Safari deletes a site's storage after
seven days of browsing without a visit. The editor is explicit about this: it reports when
storage is unavailable, warns before the quota fills, and periodically prompts for a backup
download. When images are first added it asks the browser for persistent storage, and if
that isn't granted it says once per session that the browser may clear the work.

## Features

### Editing
- Load several panoramas at once, by file picker or drag-and-drop. Anything wider than
  4096px is downscaled; anything that is not roughly 2:1 is placed as a flat panel
  instead of being stretched across the sphere.
- Link hotspots and info hotspots, in six shapes, with adjustable colour and size.
  Drag a hotspot in the panorama to move it.
- 60 steps of undo and redo.
- Scene thumbnails, drag-to-reorder, rename and delete.
- A company logo in any corner of the tour, over every scene, with adjustable size and
  opacity. Drag it on the panorama and it snaps to the nearest corner; it moves the title
  row, the compass and the scene bar out of its way. PNG, WebP and SVG keep their
  transparency, and a logo with a solid background gets a warning.
- Nadir patch to cover the tripod, background audio, and a floor plan with one marker
  per scene. The plan is kept at up to 4096px, as PNG so thin lines and small text stay
  sharp (a scanned or photographic plan whose PNG would pass 3 MB is stored as JPEG). It
  opens full-stage with wheel, pinch and button zoom, and scenes are placed on the
  enlarged plan.
- The capture date and GPS position are read from each JPEG's Exif block before the image
  is re-encoded. The editor shows them in the scene settings; the tour shows them, with a
  map link, only when "Show capture date and location" is on, and an exported tour leaves
  them out entirely while it is off. Altitude is not read: camera GPS heights are too rough
  to put next to survey levels.
- Per-scene start angle and north direction.
- Generated `<iframe>` embed code.

### Interface
- Arabic and English, switched from the panel header. Every string lives in one
  dictionary in `app.js`; static markup is translated through `data-i18n` attributes.
- Counts go through `Intl.PluralRules`, so Arabic gets its singular, dual and plural
  forms right ("مشهد واحد", "مشهدان", "5 مشاهد", "12 مشهداً").
- User content such as scene names and hotspot labels uses `dir="auto"`, so a Latin
  file name reads correctly inside the Arabic interface and the other way round.
- Switching language sets `lang` and `dir` on the document and re-renders the dynamic
  parts.
- A three-state theme control: auto (follows the operating system), light, dark.
- An exported tour opens in the language its author used, and carries no switcher.

### Viewing
- Walkthrough transitions: the camera turns toward the hotspot, pushes in, then
  cross-fades to the next scene while preserving heading.
- A start screen built from the first scene.
- Neighbouring scenes are preloaded.
- At most 8 panoramas (4 on touch devices) stay in GPU memory; older ones are released and
  decoded again when revisited. Each one is 32 MB at 4096 × 2048, and Safari on iOS reloads
  a page that holds much more than about 600 MB, so without the limit a long tour would
  crash on an iPhone.
- An exported tour shows its title and a loading indicator while the file downloads.
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
| `pl:<id>` | Floor plan image as a `Blob` |
| `last` | Most recently opened project |

Keeping images out of the document is what makes autosave cheap. Autosave runs on
every edit, including each keystroke in the title field. With images inline, the whole
project was rewritten each time, roughly 180 KB per keystroke for two scenes. The
document is now about 4 KB, and only images that actually changed are written. Storing
them as `Blob`s rather than base64 also drops the 33% encoding overhead.

Projects written by older builds are migrated on first load, including plans that were
stored inside the document. What a migration moves out is written on the next save,
whichever way the project was opened.

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
  "logo":  { "img": "data:image/png;base64,...", "pos": "tr", "size": 14, "op": 1, "ar": 4 },
  "eurl": "https://...",
  "auto": false,
  "walk": true,
  "meta": false,
  "scenes": [{
    "id": "abc123",
    "name": "Entrance",
    "img": "data:image/jpeg;base64,...",
    "th":  "data:image/jpeg;base64,...",
    "u0": 0.8, "p0": 0, "n": 0.25,
    "pp": { "x": 0.4, "y": 0.6 },
    "taken": "2026-10-20T09:14:37",
    "gps": { "lat": 24.7136111, "lon": 46.6752778 },
    "hs": [{
      "id": "x1", "type": "link", "to": "<sceneId>",
      "label": "", "text": "", "shape": "arrow",
      "color": "#4f46e5", "size": 1, "u": 0.84, "v": 0.6
    }]
  }]
}
```

- Root `v` is the schema version. Inside a hotspot, `v` is a coordinate; the two are
  unrelated.
- `lang` is the language an exported tour opens in (`ar` or `en`). The editor ignores it
  on import and keeps its own setting.
- Hotspot `u` and `v` are equirectangular coordinates from 0 to 1: `u` horizontally
  from the left edge, `v` vertically from the top.
- `u0` and `p0` are the scene's starting yaw and pitch; `n` is its north offset.
- `pp` is the scene's position on the floor plan, also 0 to 1.
- `taken` is the camera's local capture time, with no time zone, and `gps` the position in
  decimal degrees. Both are optional. `meta` decides whether the tour shows them; an
  exported tour carries them only when it is `true`.
- `logo.pos` is a physical corner (`tl`, `tr`, `bl` or `br`), so the logo stays put when
  the language changes. `size` runs from 5 to 40 and scales the logo's area against the
  screen, `op` is its opacity, and `ar` its width-to-height ratio.

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

When changing `app.js`, `boot.js` or `style.css`, bump the `?v=` query in `index.html`.
Without it, returning visitors keep the cached copy.

JavaScript and CSS are formatted with [Prettier](https://prettier.io), configured in
`.prettierrc.json`:

```bash
npx prettier --write app.js boot.js style.css
```

## Deployment

Static files at the root of any host. This repository deploys to GitHub Pages from
`main`. HTTPS is required, since the gyroscope and WebXR will not start without it, and
GitHub Pages, Cloudflare Pages and Netlify all provide it on free tiers.

## Security

- The editor page carries a strict content security policy: scripts load only from the
  site itself, and nothing can be sent to another server.
- An exported tour gets its own policy that blocks every network request. It works
  offline and cannot report anything back to anyone.
- An imported `.json` file is treated as untrusted. Only well-formed fields are kept,
  images must be `data:` URLs, and every value is escaped before it reaches the page.
- The embed code generator accepts only `http` and `https` addresses.

## Accessibility

Colour pairs are checked numerically: text at 4.5:1 or better (WCAG 1.4.3), control
borders and focus rings at 3:1 or better (WCAG 1.4.11). Touch targets are 44px on
coarse pointers (WCAG 2.5.5). The panorama is fully keyboard operable, status messages
are announced through `aria-live`, and `prefers-reduced-motion` is respected.

## Limitations

- An exported tour carries about 750 KB of fixed code, mostly Three.js, before any
  imagery, and embeds panoramas as base64. A 15-scene tour reaches tens of megabytes.
- Autosave does not work in private browsing. The editor says so rather than failing
  quietly.
- Safari may evict site storage after a period without visits. Keep `.json` backups.
- Renaming a scene or changing its north direction does not update tours you already
  exported. Export again.
- The logo is a screen overlay, so it does not appear inside a VR headset.
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
