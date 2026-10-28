# Architecture

Tajwal 360 is four static files and a vendored copy of Three.js. There is no build step and
no server code: the editor, the tour viewer and both exports are the same `app.js`.

| File | Contents |
| --- | --- |
| `index.html` | Markup, icon sprite, content security policy |
| `boot.js` | Applies the stored theme and language before the first paint |
| `style.css` | Design tokens, light and dark themes, RTL and LTR layout |
| `app.js` | Editor, viewer, storage, export, and the Arabic and English dictionary |
| `vendor/three.min.js` | Three.js r128 |

The viewer runs when `window.__TOUR__` is set (an exported tour). Otherwise the editor runs.

## Storage

Projects live in IndexedDB, database `vrtour`, object store `k`. The project document holds
no image or audio bytes; each binary is a `Blob` under its own key, written only when it
changes. Autosave runs on every edit, so a keystroke rewrites a few kilobytes, not the
project.

| Key | Contents |
| --- | --- |
| `idx` | Library: title, scene count, time and thumbnail of each project |
| `last` | Id of the project opened last |
| `p:<id>` | Project document (see [file-format.md](file-format.md)), without binaries |
| `b:<id>:<scene>` | Panorama, JPEG, at most 4096 px wide |
| `h:<id>:<scene>` | High-resolution master, up to 8192 px wide |
| `t:<id>:<scene>` | Square thumbnail, 320 × 320 JPEG |
| `sa:<id>:<scene>` | Scene audio clip |
| `a:<id>` | Background music |
| `pl:<id>` | Floor plan |
| `cv:<id>` | Cover image |

Projects saved by older builds are migrated when opened, and the moved data is written on
the next save. `localStorage` holds interface preferences only (`vrt.*`).

Browser storage can be cleared, so the editor:

- asks for persistent storage when images are first added, and says once per session if it
  is refused;
- warns when usage passes 80% of the quota, and reports any failed write;
- reminds the author to save a `.json` copy after 40 edits, then every 80.

## Images

| Item | Stored as |
| --- | --- |
| Panorama | JPEG, at most 4096 px wide |
| High-resolution master | JPEG, up to 8192 px wide, only while the project's option is on and the source is wider than 4096 px |
| Square thumbnail | JPEG, 320 × 320, rendered from the start view (or a pinned view) at 75° |
| 2:1 thumbnail | JPEG, 160 × 80 |
| Cover | JPEG, 1280 × 720 |
| Floor plan | PNG at up to 4096 px, or JPEG when the PNG would pass 3 MB |
| Custom icon | PNG at up to 256 px, from a file of at most 2 MB |
| Logo | Up to 800 px, from a file of at most 5 MB |
| Nadir patch | PNG at up to 512 px |
| Audio (music or clip) | The file as given, at most 8 MB |

Exif capture time, GPS position and camera are read before the image is re-encoded.

## Viewer memory

A 4096 × 2048 panorama takes 32 MB of GPU memory, and Safari on iOS reloads a page that
holds much more than about 600 MB. Panoramas therefore stay resident within a pixel budget:
eight 4096 panoramas on a desktop, four on a touch device, with an 8192 master counting as
four. Older ones are released and decoded again on return. Decodes run one at a time on
touch devices and two elsewhere; the scene the visitor is waiting for goes first.

Touch devices, and GPUs whose maximum texture size is below 8192, never load the masters.

## Single-file export

`Export HTML` writes one page with the code, styles and every asset inlined as `data:` URLs,
and the 4096 px copies only. The fixed code is about 1 MB; base64 adds a third to each
asset. Past an estimated 100 MB the editor asks for a second click and suggests the folder
export.

## Folder export

`Export as folder (ZIP)` writes:

```
index.html              page and content security policy
README.txt              publishing instructions, English and Arabic
.nojekyll               stops GitHub Pages dropping files that start with _
tour/style.css
tour/three.min.js
tour/app.js
tour/data.js            window.__TOUR__ = { ... }
scenes/<id>.jpg         panoramas, 4096 px
scenes/<id>-hd.jpg      high-resolution masters, where present
thumbs/<id>-sq.jpg      square thumbnails
thumbs/<id>.jpg         2:1 thumbnails
audio/music.<ext>       background music
audio/<id>.<ext>        scene clips
icons/<id>.png          custom icons in use
plan.<ext>  cover.jpg  nadir.png  logo.<ext>
```

File names come from ids, reduced to letters, digits, `-` and `_`, at most 64 characters,
and unique regardless of case. Entries are stored uncompressed with CRC-32 and UTF-8 names.
Without ZIP64 an archive is limited to 65,535 files and 4 GB; a larger tour is refused
before any file is read.

The folder must be served over HTTP. Opened from disk, the page explains this in both
languages.

A `.json` backup is a single string, which browsers can't build much past 500 MB. When the
high-resolution masters would take it past 300 MB they are left out, and the editor says so.

## Security

| Context | Policy |
| --- | --- |
| Editor | Scripts, styles and connections from its own origin only; images and media also from `data:` and `blob:`. Nothing can be sent elsewhere. |
| Single-file tour | `default-src 'none'`: no network request of any kind. |
| Folder tour | Scripts, styles, images and media from its own origin only; no `fetch`, no inline scripts. |

An imported `.json` file is untrusted: only well-formed fields are kept (see
[file-format.md](file-format.md)), images must be `data:` URLs, and every value is escaped
before it reaches the page. The embed code accepts only `http` and `https` addresses.
