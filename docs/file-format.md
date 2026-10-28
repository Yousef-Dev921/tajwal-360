# Project file format

A project travels as one JSON document. The same document appears in three places:

| Where | Images and audio |
| --- | --- |
| `.json` backup (Save a copy) | `data:` URLs |
| Single-file tour (Export HTML) | `data:` URLs, inside `window.__TOUR__` |
| Folder tour (Export as folder) | Relative paths, inside `tour/data.js` |

An imported `.json` file is untrusted. Every field is checked as described below, and a
field that fails is dropped or replaced by its default. A file whose `v` is newer than the
editor's schema is refused.

Optional fields are left out at their default, so older files and older builds stay
compatible. A build that predates a field ignores it.

## Example

```json
{
  "v": 1,
  "lang": "en",
  "title": "Al-Sabbagh House",
  "desc": "Condition survey, August 2024",
  "auto": false,
  "walk": true,
  "tr": "fade",
  "meta": true,
  "bar": "names",
  "icons": [{ "id": "k3", "name": "crack", "img": "data:image/png;base64,...", "ar": 1 }],
  "logo": { "img": "data:image/png;base64,...", "pos": "tr", "size": 14, "op": 1, "ar": 4 },
  "scenes": [
    {
      "id": "abc123",
      "name": "East iwan",
      "note": "Timber decay in the roof",
      "img": "data:image/jpeg;base64,...",
      "th": "data:image/jpeg;base64,...",
      "sq": "data:image/jpeg;base64,...",
      "u0": 0.8, "p0": 0, "n": 0.25, "f0": 60,
      "lq": [0.0262, 0, 0, 0.9997],
      "taken": "2024-08-20T09:14:37",
      "gps": { "lat": 24.7136111, "lon": 46.6752778 },
      "hs": [
        { "id": "x1", "type": "link", "to": "def456", "label": "Courtyard",
          "shape": "arrow", "color": "#22c55e", "size": 1.5, "u": 0.84, "v": 0.6, "fl": true },
        { "id": "x2", "type": "info", "label": "Crack", "text": "", "shape": "img",
          "icon": "k3", "color": "#f59e0b", "size": 1, "u": 0.3, "v": 0.45, "wl": true }
      ]
    }
  ]
}
```

## Root

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `v` | number | `1` | Schema version. A file with a higher value is refused. |
| `lang` | `"ar"` \| `"en"` | | Language an exported tour opens in. Written on save and export; ignored on import. |
| `title`, `desc` | string | `""` | Tour title and description, shown on the start screen. |
| `scenes` | array | | Required. A scene without a `data:image/` `img` is dropped; a file with no scenes left is refused. |
| `auto` | boolean | `false` | Auto-rotate. |
| `autoSpd` | `0.5` \| `2` | normal | Auto-rotate speed: slow or fast. Any other value is dropped. |
| `walk` | boolean | `true` | `false` means no transition between scenes (None). |
| `tr` | `"fade"` | walk | Fade transition. Kept only while `walk` is not `false`. |
| `meta` | boolean | `false` | Show capture date and location in the tour. |
| `click` | `true` | off | Click anywhere walks to the nearest link. |
| `snap` | `true` | off | Exported tour offers Save view as image. |
| `bar` | `"names"` \| `"none"` | thumbnails | Scene bar form. |
| `hd` | `true` | off | Keep 8192 px masters for images added later. Left out of exported tours. |
| `eurl` | string | `""` | Published address used for the embed code. The embed code accepts only `http` and `https`. |
| `look` | object | | Starting look for new hotspots; see [Look](#look). Left out of exported tours. |
| `icons` | array | | Custom icons; see [Icons](#icons). |
| `logo` | object | | See [Logo](#logo). |
| `nadir` | object | | `img` (`data:image/`) and `r`, the patch's angular radius in degrees, 8 to 50 (25). |
| `audio` | object | | Background music: `src` (`data:` URL), `name`, `vol` 0 to 1 (0.6). |
| `plan` | object | | Floor plan: `img` (`data:image/`). |
| `cover` | object | | Start-screen image: `img` (`data:image/`). |

## Scene

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Unique within the project. |
| `name` | string | |
| `img` | string | Panorama, at most 4096 px wide. Required. |
| `hd` | string | High-resolution master, up to 8192 px wide. Viewers that can't use it show `img`. |
| `th` | string | 2:1 thumbnail, 160 × 80. |
| `sq` | string | Square thumbnail, a JPEG of 320 × 320. On import, kept only as a base64 JPEG `data:` URL of at most 200,000 characters; otherwise it is made again. |
| `sqv` | object | View the square thumbnail is pinned to: `y` turn 0 to 1, `p` pitch in radians (±π/2), `f` field of view 40 to 95. Without it the thumbnail follows the start view. Left out of exported tours. |
| `u0` | number | Start view's turn, 0 to 1. |
| `p0` | number | Start view's pitch, in radians. |
| `f0` | number | Start zoom, as a vertical field of view of 40 to 95 degrees. Default 75. |
| `n` | number | North, as a turn of 0 to 1. Without it the scene has no compass. |
| `lq` | array | Level correction, a unit quaternion `[x, y, z, w]`. Any other value is dropped. |
| `pp` | object | Position on the floor plan: `x` and `y`, 0 to 1. |
| `hide` | `true` | Left out of the scene bar, scene grid and previous / next. Hotspots and the plan still reach it. |
| `note` | string | Notes for visitors. Plain text, `\n` line breaks, at most 2000 characters; trimmed on import. |
| `taken` | string | Capture time from Exif, `YYYY-MM-DDThh:mm:ss`, camera local time, no zone. |
| `gps` | object | `lat` (±90) and `lon` (±180), decimal degrees. |
| `cam` | string | Camera make, model and focal length, at most 80 characters, control and bidi characters removed. Left out of exported tours. |
| `snd` | object | Scene audio: `src` (`data:audio/` URL), `name`, `loop: true`, `delay` in whole seconds 0 to 30. |
| `src` | object | The original file; see [Source file](#source-file). |
| `hs` | array | Hotspots. |

Exported tours leave out `taken` and `gps` unless `meta` is `true`.

## Hotspot

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | | |
| `type` | `"link"` \| `"info"` | `link` | |
| `to` | string | | Destination scene id, for a link. |
| `label` | string | `""` | May contain line breaks. |
| `text` | string | `""` | Popup text, for an info hotspot. |
| `shape` | string | `arrow` | `arrow`, `spot`, `ring`, `dot`, `pin`, `star`, `info`, `none` (text only) or `img`. |
| `icon` | string | | Icon id, with `shape: "img"`. A hotspot whose icon is missing becomes an arrow. |
| `color` | string | `#f59e0b` | `#rrggbb`. |
| `size` | number | `1` | 0.5 to 2.5. |
| `u`, `v` | number | `0.5` | Equirectangular position, 0 to 1: `u` from the left edge, `v` from the top. |
| `rot` | integer | `0` | Direction in degrees, -180 to 179, clockwise (seen from above on the floor). |
| `ts` | number | `1` | Label text size, 0.6 to 2. |
| `box` | `false` | dark box | Outlined label instead of a dark box. |
| `fix` | `true` | | Keep the hotspot's size on screen while zooming. |
| `lp` | `"t"` \| `"l"` \| `"r"` | below | Label above, left or right of the icon, on the photo's sides in either language. |
| `hov` | `true` | | Show the label only on hover. |
| `fl` | `true` | | Lie flat on the floor. Kept at least 5° below the levelled horizon. |
| `wl` | `true` | | Hang flat on a wall. Kept within 60° of the levelled horizon. |

`fl` and `wl` are dropped from a text-only hotspot, and `fl` wins when both are set. Import
moves a floor or wall hotspot outside its range straight back to the limit.

## Source file

`src` records the file a scene was made from. Each part is checked and dropped if it
doesn't fit.

| Field | Notes |
| --- | --- |
| `h` | SHA-256 of the first 4 MB and the size, 64 lowercase hex digits. Used to catch duplicate imports. Left out of exported tours. |
| `name` | File name, at most 120 characters. |
| `w`, `h0` | Pixel size before scaling, 1 to 65535. |
| `bytes` | File size. |
| `type` | MIME type, at most 40 characters. |

## Icons

| Field | Notes |
| --- | --- |
| `id` | Referenced by a hotspot's `icon`. |
| `name` | At most 60 characters. |
| `img` | PNG `data:` URL of at most 600,000 characters (the editor stores icons at up to 256 px). |
| `ar` | Width to height, 0.1 to 10. |

Only icons that a hotspot uses are written. Import keeps at most 200.

## Logo

| Field | Default | Notes |
| --- | --- | --- |
| `img` | | `data:image/` URL. |
| `pos` | `tl` | Corner: `tl`, `tr`, `bl` or `br`. Physical, so it stays put when the language changes. |
| `size` | `14` | 5 to 40. Scales the logo's area against the screen. |
| `op` | `1` | Opacity, 0.2 to 1. |
| `ar` | `1` | Width to height, 0.1 to 10. |

## Look

`look.link` and `look.info` hold the look a new hotspot of that type starts from. Each may
carry `shape`, `icon`, `color`, `size`, `ts`, `box`, `fix`, `lp`, `hov`, `fl` and `wl`,
checked as on a hotspot. A field that fails, or an icon the file doesn't carry, is dropped.

## Folder tours

In `tour/data.js` the document is assigned to `window.__TOUR__`, and every image and audio
field holds a path relative to `index.html` instead of a `data:` URL. See
[architecture.md](architecture.md#folder-export) for the layout.
