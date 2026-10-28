# Tajwal 360

A 360° virtual tour builder that runs entirely in the browser. Images stay on the
machine that opened the page, and a finished tour exports as one self-contained HTML
file, or as a folder of files for a large tour, that you can put on any host.

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
- Load several panoramas at once, by file picker or by dropping them on the panorama, which
  shows where they will land. Anything wider than 4096px is downscaled.
- Images are added one at a time through an import queue above the scene list (floating at
  the foot of the panorama on a phone). Each file has a row that shows where it is: waiting,
  reading, preparing the stored copies, added (with its thumbnail), or failed, which stays
  until the queue is closed. The header counts the files ("Adding images 3 of 12"), and so
  does the browser tab's title, so a long import can be watched from another tab. The first
  scene opens as soon as it is ready, Stop (or Escape) finishes the file in hand and drops
  the rest, and the whole import is one step of undo (undo waits while files are being
  read). Files are read one at a time, taking
  turns with the panoramas being shown, so a phone holds one decoded original at once.
- A file already in the project is caught before it becomes a second scene: the row offers
  Skip, already focused, or Add anyway, and with two or more there is Skip all duplicates.
  Files are compared by a SHA-256 hash of their first 4 MB and their size, so a renamed
  copy is caught too. Where the browser has no `crypto.subtle` (a page that is neither
  https nor localhost), the same name and byte size count as the same file. Scenes added
  before this change have no hash; for them a file with the scene's name whose stored copy
  would be the same size is flagged as possibly a duplicate.
- An image that is not roughly 2:1 is not placed until you choose: as a flat photo on a
  dark panorama, or skipped. Between 1.7:1 and 2.4:1, the ratio of a cropped panorama, it
  can also be stretched to fill the sphere, and that is the default. The other files keep
  going meanwhile.
- An exported tour, and the editor's Preview, refuse dropped files with a no-drop pointer,
  so a stray drop can't replace the tour with the image.
- High-resolution panoramas, a project option under Viewing options. While it is on, a
  panorama wider than 4096 px also keeps a master of up to 8192 px, and the 4096 px copy is
  drawn from that master. Desktops show the master; phones, tablets and any GPU that can't
  hold an 8192 texture show the 4096 px copy and never download or decode the master. It is
  a project setting rather than a choice per import because it describes the tour being
  made, and it applies to images added after it is turned on: an image already reduced to
  4096 px can't be enlarged again. The folder export carries both sizes; the single HTML
  file carries the 4096 px copies only, and says so.
- Link hotspots and info hotspots, in seven shapes (including a floor spot, a marker lying
  on the floor with a soft beam of light), as text only, or with an icon of your own.
  Colour and size are adjustable. Drag a hotspot in the panorama to move it.
- Your own icons: PNG, WebP, GIF, JPEG or SVG, up to 2 MB, kept in the project as PNG at
  up to 256px with their transparency. SVG is drawn into a PNG on upload too, because a
  vector image drawn onto a canvas can stop that canvas being uploaded to the GPU in some
  browsers. A saved or exported file carries only the icons in use.
- Labels run over several lines and have their own text size, on a dark box or with an
  outline only. A text-only info hotspot with no further text is a plain note on the
  scene, for naming a wall, a material or a defect; in the tour it doesn't react to
  clicks, since a popup would only repeat it.
- An arrow or a custom icon can point in any direction, in 5° steps.
- A hotspot can lie flat on the floor, as a decal seen in perspective rather than a marker
  that always faces the camera; an arrow on the floor then points along it. It follows the
  level correction, so it stays on the real floor of a straightened photo. It stays at least
  5° below the horizon, where it would flatten to a line: placing, dragging or pasting it
  higher stops it there. A level correction made afterwards doesn't move it. Choosing the floor spot lays a hotspot down, unless it is above
  that limit. Text-only hotspots stand.
- A hotspot can instead hang flat on a wall, for a sign or a defect marker on a wall: a decal
  standing upright (after level correction) and facing the viewer across the room, so it
  shortens when it is high or low and leans in perspective toward the edges of the view,
  where a marker that always faces the camera would not. At the horizon it is the same size
  as the standing marker. It stays within 60° of the horizon: placing, dragging or pasting
  it further up or down stops it there. Floor and wall exclude each other; its label stands
  beside it as a floor hotspot's does.
- A label sits below, above, left or right of its icon. The sides are those of the photo,
  not of the reading direction, so a label set to clear a door frame stays clear of it in
  either language.
- A label can show only while the visitor points at its hotspot, so a busy scene stays
  clean. On a touch screen the first tap shows the label and a second tap within four
  seconds opens the hotspot; in a headset, looking at the hotspot shows it. With click
  anywhere on, the link a click would take shows its label too, and a tap that misses every
  hotspot walks at once. The editor always shows labels. A text-only hotspot is its own label, so it is always shown.
- A hotspot can keep its size on screen when the view zooms, instead of growing with the
  panorama.
- Copy a hotspot (Ctrl+C) and paste it into any scene (Ctrl+V), where it appears in the
  middle of the view; duplicate it beside itself (Ctrl+D); remove it with Delete. A link
  pasted into its own destination turns into a link back to the scene it came from, which
  is what a return arrow needs.
- A new hotspot takes the look of the last one of its kind that was edited, so a tour of
  many scenes needs its arrows styled once. The project remembers that look, so it carries
  over to the next session and into a saved copy.
- Apply look to… gives the selected hotspot's look (shape or icon, colour, size, text size
  and box, keep size, label side, label on hover, floor or wall) to every link hotspot (or
  every info hotspot) in the scene or in the whole tour, or to every hotspot with the same
  custom icon. Labels, text, destinations, positions and directions stay as they are; a
  hotspot that has to lie on the floor or hang on a wall is moved only as far as that needs.
  It asks first with the number of hotspots it will change, is one step of undo, and its
  message offers Undo too. On a 150-scene tour with 450 hotspots it takes about 30 ms.
- Glyphs on light icon colours, such as white, are drawn dark so they stay visible.
- 60 steps of undo and redo.
- Scene thumbnails, drag-to-reorder, rename and delete.
- Square scene thumbnails that look like the place: a 320 × 320 picture of a real view,
  without hotspots, for the scene list, the tour's scene grid and the library (for a
  project without a cover). It is taken from the start view at a fixed 75°, wider than most
  start views so a room reads, with the level correction applied, and follows the start view
  and the level a second after they change. "Use the current view" pins it to the view on
  screen, zoom included, and "From the start view" lets it follow again. It is made when an
  image is added or replaced, and a project from before it gets its thumbnails while the
  editor is idle, one scene at a time and never during a walk. Each is rendered off-screen
  from a 2048 px copy that the browser decodes and scales off the main thread, so it never
  touches the panoramas on show or their memory budget. Measured on a 60-scene project: about
  8 ms of main-thread work per thumbnail on a desktop and 12 ms with the CPU slowed fourfold
  as for a phone, with no task long enough to delay input. The squeezed
  2:1 thumbnail is kept for older builds and the import queue.
- Deleting a scene or a hotspot leaves a message with an Undo button for 10 seconds. Undo
  puts a scene back at its place in the tour with its images, clip, thumbnail and every link
  that led to it, at its place in each scene's list, even after autosave has removed its
  files from storage; a hotspot comes back at its place in its scene, selected. Several
  scenes deleted one after another can be brought back in any order: each returns to its
  place, and a link between two of them returns once both are back, so undo never leaves a
  link to a scene that isn't there.
- Messages stack, up to three at a time with the newest at the bottom, each with a close
  button. They wait while the pointer is over them or focus is in them, sit over the
  panorama clear of the scene bar (on a phone, clear of the bottom sheet too), and are read
  to screen readers once each, without their buttons. Progress of an export or import stays
  one message that updates in place.
- Tours of more than 12 scenes get a search field over the scene list and over a link's
  list of destinations. Search ignores case, accents and Arabic diacritics, treats the alef
  forms (أ إ آ ا) as one, and finds a scene by its number in the tour as well as by name.
  The scene list and the tour's scene grid also search the scene notes; the grid lists
  scenes found by name first and those found only in their notes after them.
  Scenes can still be dragged to a new place while the list is filtered; on Enter, the
  destination search takes its first match.
- A company logo in any corner of the tour, over every scene, with adjustable size and
  opacity. Drag it on the panorama and it snaps to the nearest corner; it moves the title
  row, the compass and the scene bar out of its way. PNG, WebP and SVG keep their
  transparency, and a logo with a solid background gets a warning.
- Scene audio: each scene can have its own clip, such as a narration of the room, up to
  8 MB, with a loop option and a delay of 0 to 30 seconds. The editor plays it on demand
  with a Listen button.
- Nadir patch to cover the tripod, background audio, and a floor plan with one marker
  per scene. The plan is kept at up to 4096px, as PNG so thin lines and small text stay
  sharp (a scanned or photographic plan whose PNG would pass 3 MB is stored as JPEG). It
  opens full-stage with wheel, pinch and button zoom, and scenes are placed on the
  enlarged plan.
- The capture date and GPS position are read from each JPEG's Exif block before the image
  is re-encoded, and so is the camera: make, model and focal length, as "RICOH THETA Z1,
  2.6 mm". The editor shows them in the scene settings; the tour shows the date and position,
  with a map link, only when "Show capture date and location" is on, and an exported tour
  leaves them out entirely while it is off. The camera is the author's record and never
  goes into a tour. Altitude is not read: camera GPS heights are too rough to put next to
  survey levels.
- Image information in the scene settings, folded to one line ("8192 × 4096 · 3.8 MB ·
  14 Mar 2025") and opened for the rest: the original file (name, pixel size, size, type),
  the stored copy and the high-resolution copy (pixel size and size, or none), when and
  where it was taken, and the camera. A panorama whose original was under 6000 px wide gets
  a warning that details may look soft when zoomed in, since a condition survey is read up
  close. Scenes added before files were recorded show "Unknown" for what isn't known.
- Replace image, for a room photographed or stitched again. The scene keeps its id, name,
  hotspots, start view, north, level correction, plan position, clip and notes; the new file
  is prepared exactly as an added image is (same copies, same high-resolution rule, same
  Exif read), and brings its own capture date, position, camera and file record. An image
  that isn't 2:1 asks first, inside the scene settings, with the same choices as the import.
  The new panorama replaces the old one where the camera is, the level guides show for a
  moment so the photo can be checked against them, and undo brings the old image back.
  It is also how a scene added before high resolution was turned on gets its 8192 px copy.
- Download image saves the best copy kept, the 8192 px master when there is one, as a JPEG
  named after the scene; its button gives the pixel size and the size. The original file
  isn't kept by the editor, and the button's hint says so.
- Scene notes: plain text of up to 2000 characters per scene, line breaks kept, such as
  "East iwan, timber decay in the roof, visit of August 2024". Visitors read them in the
  tour (see Viewing).
- Per-scene start view and north direction. The start view keeps the zoom too, and it
  comes back exactly as it was set, level correction or not.
- Level correction for a photo shot off level. Each press of the rotate buttons turns the
  scene by a quarter of a degree about the direction you face, laid flat on the horizon,
  so it tilts without spinning; holding a button keeps turning, and guide lines show
  over the panorama. Straighten a vertical edge in front, then one a quarter turn away.
  The hotspots and the tripod patch turn with the photo, so they stay on what they mark.
- A cover image: the current view, taken at 1280 × 720 without hotspots. It is the
  background of the exported tour's start screen and the project's picture in the
  library, which otherwise show the first panorama squeezed flat.
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
- Transition between scenes, a project option under Viewing options: Walk (the default),
  Fade or None.
  - Walk: the camera turns toward the hotspot, pushes in, then cross-fades to the next
    scene while preserving heading. When both scenes have a north direction, the compass
    heading carries over. Otherwise, when the next scene has a link back, the visitor
    arrives facing away from it, turned by as much as they were looking away from the
    hotspot they took; so return links keep the sense of direction with no setup. Failing
    both, the next scene opens at its start angle.
  - Fade: a 500 ms cross-fade without the turn, arriving with the same heading rules. The
    zoom eases to the next scene's start zoom meanwhile.
  - None: an instant cut to the next scene's start view. A project saved with the old
    "smooth transitions" box unticked opens as None.
- Jumps (the scene bar, previous and next, the scene grid and the floor plan) cross-fade
  over 350 ms: the frame on screen stays where it is and fades out over the new scene,
  whose hotspots fade in. A scene is never shown before its panorama is ready, so clicking
  quickly through scenes never shows a blank frame. With None they cut. The editor's own
  scene list switches instantly, for speed while authoring.
- In a VR headset links and jumps always cut, since a fade or a walk would move the
  visitor's whole field of view.
- When the system asks for reduced motion, a link becomes a 250 ms cross-fade with no turn
  and no animated zoom, whatever the transition, a jump fades in 150 ms, a hovered hotspot
  grows at once, and auto-rotate stays off, which the option's hint says in the editor. A
  change to the system setting takes effect at once, without a reload.
- Auto-rotate, slow, normal or fast. It stops for any click, touch, key, wheel or mouse
  movement over the panorama, and comes back 4 seconds after the last of them, easing up to
  speed over a second. It never turns behind the start screen, an info popup, the scene
  grid or the enlarged plan.
- A hotspot under the pointer, aimed at by click anywhere, or showing its label after a tap
  grows smoothly to 1.2 times its size, at the same pace at any frame rate.
- A start screen built from the first scene.
- A scene with notes gets an "i" button in the title row. It opens a card at the end of the
  reading direction, 320 px wide, with the scene's number and name, its capture date when the
  tour shows it, and the notes. Each line of the notes takes its own direction, so an Arabic
  line reads right to left in an English tour. The card stays open from scene to scene, for
  someone reading a survey room by room: a scene without notes hides it until the next one
  that has some. Escape or its close button closes it and puts focus back on the button.
  Below 760 px it is a sheet over at most the lower half of the stage, kept above the scene
  bar so the bar stays usable. It is in the editor's Preview and in exported tours; the editor
  itself has the notes in the panel.
- Save view as image, a camera button in the title row, renders the current view again at
  2400 px on its long side, in the stage's own proportions, so the picture is framed exactly as
  the screen. It is saved as a JPEG named "tour - scene - yyyy-mm-dd.jpg", with characters
  that file systems refuse replaced. "Include hotspots", on by default and remembered by the
  browser, keeps the hotspots, floor decals and the labels on show; a label shown only on
  hover is left out unless it is showing. In the editor the selection ring is left out. The
  editor and Preview always have the button; an exported tour has it only when "Let visitors
  save the view as an image" is on under Viewing options. The logo and the other screen
  overlays are not part of the picture.
- A scene bar along the foot of the tour, in one of three forms chosen under Viewing options.
  - Thumbnails, the default: a strip of square scene thumbnails, 64 px (52 px on a touch
    screen), led by a grid button with a counter (48/143). The current scene has a white ring
    and is kept in the middle of the strip, which scrolls sideways by wheel, trackpad or
    finger. With a mouse, a scene's name shows above its thumbnail after 300 ms; from the
    keyboard it shows at once. The strip is one tab stop: the arrow keys move along it in the
    reading direction (right to left in Arabic), Home and End go to its ends and Enter opens a
    scene. Each thumbnail is named "12. East iwan" for screen readers. A button at its end
    folds it down to previous, the grid and next, and the tour remembers that for the rest of
    the visit, in that tab.
    The band is a solid tint, not glass: a blur under a scrolling row of pictures would be
    redrawn on every frame. Only thumbnails within about a strip's width either side of the
    view hold an image, and those further away let theirs go, so a 143-scene tour keeps about
    30 decoded at a time rather than 143, which matters on an iPhone. A scene without a square
    thumbnail yet shows its 2:1 thumbnail, cropped.
  - Names: up to 12 scenes, the bar names every scene, so each is one tap away. A longer tour
    shows previous and next instead, since a row of 143 names would have to be scrolled to
    find where you are.
  - Hidden: no bar; visitors move through the hotspots and the floor plan.

  Previous and next follow the tour's order, which in a survey is usually the route walked
  on site. With the grid, they are also how a keyboard reaches every scene, since the hotspots
  on the panorama can't take focus. The grid shows every scene, with thumbnails and the same
  search as the editor. It is a dialog: arrow keys move through it, Enter opens a scene,
  Escape closes it, and focus goes back to the button that opened it. A scene chosen from the
  bar or the grid opens with a cross-fade rather than the walk, since it is a jump rather than
  a step. The floor plan, the logo, the notes card and the messages all sit above the bar,
  whichever form it takes.
- Click anywhere, an option under Viewing options, off by default. A click in the tour that
  misses every hotspot takes the link hotspot that lies most nearly in its direction, and
  walks there. Directions are compared after level correction, with heights counting half
  as much as bearings: how far below the horizon a floor arrow sits mostly says how far
  away it is, while its bearing is where the visitor wants to go. A link more than 60° from
  the click is never taken. That is about the edge of a 16:9 screen at the default zoom,
  so the walk always turns toward something the visitor can see. Before the click, the
  hotspot it would take grows under the pointer, as on hover. A drag, a pinch, a click on
  a plain text note and a click with any button but the main one never trigger it.
- Neighbouring scenes are preloaded.
- Panoramas in GPU memory stay within a budget of pixels: eight 4096 × 2048 panoramas, or
  four on touch devices, with an 8192 × 4096 one counting as four. Older ones are released
  and decoded again when revisited; the current scene and a walk in progress never are.
  Each 4096 panorama is 32 MB, and Safari on iOS reloads a page that holds much more than
  about 600 MB, so without the limit a long tour would crash on an iPhone. Preloading fills
  only what the budget leaves beside the current scene.
- Decodes take turns, one at a time on touch devices and two elsewhere, and the scene the
  visitor is waiting for jumps ahead of preloads.
- An exported tour shows its title and a loading indicator while the file downloads.
- A scene's clip starts when the visitor enters the scene, after its delay, and stops when
  they leave. The background music fades down to a quarter of its volume while the clip
  plays and back up when it ends. Nothing plays before the visitor's first tap or click,
  as browsers require, nor behind the start screen. The mute button silences both, and a
  clip resumes where it was when sound comes back on. This works in Preview, in both
  exports and in VR mode.
- Pinch zoom on touch, wheel zoom on desktop, and full keyboard control.
- Device gyroscope, and WebXR VR mode with an in-headset info panel.

### Projects
- A project library with thumbnails and timestamps.
- Autosave that reports failures instead of hiding them.
- Export to a standalone HTML tour or to a folder (ZIP) for a web host, and save and
  import projects as `.json`. See [Exporting a tour](#exporting-a-tour).

## Try it

[`samples/`](samples/) holds three CC0 panoramas. Drop them on the editor to build a
tour without needing your own 360° photos.

## Exporting a tour

There are two exports, side by side in the panel.

**Export HTML** writes one file with everything inside it: code, styles and every image as
base64. It opens anywhere, straight from disk included, which suits a small tour sent by
email. Base64 adds a third to every image and the browser has to read the whole file before
the first scene shows, so the editor estimates the size first. Past 100 MB it says how large
the file would be and suggests the folder export; a second click exports it anyway.

**Export as folder (ZIP)** writes a ZIP that unpacks to:

```
index.html          the page, with its own content security policy
README.txt          how to publish and preview it, in English and Arabic
.nojekyll           stops GitHub Pages running Jekyll, which drops files starting with _
tour/style.css      the same code as the editor, cached by the browser between visits
tour/three.min.js
tour/app.js
tour/data.js        the tour document; it sets window.__TOUR__ as the single file does
scenes/<id>.jpg     one file per panorama
audio/music.<ext>   background music
audio/<id>.<ext>    each scene's audio clip
icons/<id>.png      custom icons, only those in use
thumbs/<id>-sq.jpg  square scene thumbnails for the scene grid, loaded when it opens
thumbs/<id>.jpg     the 2:1 thumbnails, for builds that predate the square ones
plan.<ext>, cover.jpg, nadir.png, logo.<ext>
```

Images stay binary, so the folder is about a quarter smaller than the single file, and a
visitor downloads only the scenes they visit, plus the neighbours the viewer preloads. The
viewer is the same `app.js` with the same code path: in the folder, a scene's `img` is a
relative path instead of a `data:` URL. `data.js` is a script rather than JSON so the page
needs no `fetch()`, and the page's policy allows scripts, styles, images and media from the
folder's own origin only. File names come from scene and icon ids, cleaned to letters,
digits, `-` and `_`, cut to 64 characters, and kept unique without regard to case.

The ZIP is written by the editor itself, without a library: each file is stored
uncompressed (JPEG and compressed audio don't shrink), with its CRC-32 and a UTF-8 name.
It is assembled from the images' own `Blob`s, so a 150-scene export holds about 60 MB of
JavaScript memory at its peak rather than the whole archive. Without ZIP64 a ZIP holds at most
65,535 files and 4 GB; a tour past either limit is refused with a message before anything
is read. 143 scenes at 4096 px come to roughly 300 MB as a folder, against about 400 MB as
one HTML file; with an 8192 px master each, about 2 GB.

**The folder must be served over HTTP.** Opened straight from disk, browsers such as Chrome
refuse to hand `file://` images to WebGL, so the page says so, in both languages, instead of
failing silently. Upload the unpacked folder as it is to GitHub Pages, Netlify, Cloudflare
Pages or any static host. To preview it on your own machine, run this inside the folder and
open http://localhost:8000:

```bash
python3 -m http.server 8000
```

## How projects are stored

IndexedDB database `vrtour`, object store `k`:

| Key | Contents |
| --- | --- |
| `idx` | Project list: title, scene count, timestamp, thumbnail |
| `p:<id>` | Project document, **without image bytes** |
| `b:<id>:<sceneId>` | Panorama as a binary `Blob`, at most 4096 px wide |
| `h:<id>:<sceneId>` | High-resolution master of up to 8192 px, for scenes that have one |
| `a:<id>` | Audio track as a `Blob` |
| `pl:<id>` | Floor plan image as a `Blob` |
| `cv:<id>` | Cover image as a `Blob` |
| `sa:<id>:<sceneId>` | A scene's audio clip as a `Blob` |
| `t:<id>:<sceneId>` | A scene's square thumbnail, a 320 × 320 JPEG `Blob` |
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
  "cover": { "img": "data:image/jpeg;base64,..." },
  "icons": [{ "id": "k3", "name": "door", "img": "data:image/png;base64,...", "ar": 1 }],
  "logo":  { "img": "data:image/png;base64,...", "pos": "tr", "size": 14, "op": 1, "ar": 4 },
  "eurl": "https://...",
  "auto": false,
  "autoSpd": 2,
  "walk": true,
  "tr": "fade",
  "meta": false,
  "hd": true,
  "click": true,
  "snap": true,
  "bar": "names",
  "look": { "link": { "shape": "arrow", "color": "#22c55e", "size": 1.5, "fl": true } },
  "scenes": [{
    "id": "abc123",
    "name": "Entrance",
    "note": "East iwan\nTimber decay in the roof",
    "img": "data:image/jpeg;base64,...",
    "th":  "data:image/jpeg;base64,...",
    "sq":  "data:image/jpeg;base64,...",
    "sqv": { "y": 0.42, "p": -0.1, "f": 60 },
    "hd":  "data:image/jpeg;base64,...",
    "u0": 0.8, "p0": 0, "n": 0.25, "f0": 60,
    "lq": [0.0262, 0, 0, 0.9997],
    "pp": { "x": 0.4, "y": 0.6 },
    "taken": "2026-10-20T09:14:37",
    "gps": { "lat": 24.7136111, "lon": 46.6752778 },
    "cam": "RICOH THETA Z1, 2.6 mm",
    "snd": { "src": "data:audio/mpeg;base64,...", "name": "guide.mp3", "loop": true, "delay": 2 },
    "src": { "h": "9f86d0…(64 hex)", "name": "IMG_0042.jpg", "w": 8192, "h0": 4096,
             "bytes": 23514112, "type": "image/jpeg" },
    "hs": [{
      "id": "x1", "type": "link", "to": "<sceneId>",
      "label": "", "text": "", "shape": "arrow",
      "color": "#4f46e5", "size": 1, "u": 0.84, "v": 0.6,
      "rot": 90, "ts": 1.2, "box": false, "fix": true,
      "lp": "t", "hov": true, "fl": true
    }, {
      "id": "x2", "type": "info", "label": "Crack", "text": "", "shape": "pin",
      "color": "#f59e0b", "size": 1, "u": 0.3, "v": 0.45, "wl": true
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
- A hotspot `label` may contain line breaks. `shape` is one of `arrow`, `spot`, `ring`,
  `dot`, `pin`, `star`, `info`, `none` (text only) or `img`, which names one of the root
  `icons` in an `icon` field; on import, a hotspot whose icon is missing becomes an arrow.
  The last eight hotspot fields are optional
  and left out at their defaults: `rot` turns an arrow by -180 to 179 degrees, clockwise
  (on the floor, clockwise as seen from above); `ts` scales the label text, 0.6 to 2;
  `box: false` draws the label with an outline instead of a dark box; `fix: true` keeps the
  hotspot's size on screen when zooming; `lp` puts the label above (`t`), left (`l`) or
  right (`r`) of the icon instead of below it, on the photo's sides whatever the language;
  `hov: true` shows the label only on hover; `fl: true` lays the hotspot on the floor, and
  is dropped on import from a text-only hotspot. A floor hotspot sits at least 5° below the
  horizon as levelled by the scene's `lq`; import moves a higher one straight down to that.
  `wl: true` hangs the hotspot flat on a wall; it is dropped on import from a text-only
  hotspot and from one that also has `fl`, which wins, and import moves a wall hotspot more
  than 60° from the levelled horizon straight back to 60°. A build that
  predates these fields ignores them, shows a text-only hotspot as an arrow, and draws a
  floor or wall hotspot standing, with its label below.
- `u0` and `p0` are the scene's starting yaw and pitch; `n` is its north offset. `f0`,
  optional, is its starting zoom as a vertical field of view from 40 to 95 degrees
  (75 when absent). `lq`, optional, is its level correction as a quaternion `[x, y, z, w]`.
- `pp` is the scene's position on the floor plan, also 0 to 1.
- Scene `hd`, optional, is the high-resolution master of up to 8192 px, beside `img` at
  4096 px. Root `hd: true` keeps high resolution on for images added later. A build that
  predates them ignores both and keeps `img`. In a folder tour's `data.js`, `img` and `hd`
  are relative paths, and the viewer picks one per device.
- `walk: false` means no transition between scenes (None). `tr`, optional, is `"fade"` for
  the Fade transition, and is written with `walk: true`, so a build that predates it walks.
  On import, `walk: false` gives None whatever `tr` says, `tr: "fade"` gives Fade, and
  anything else gives Walk.
- `autoSpd`, optional, multiplies the auto-rotate speed: `0.5` slow, `2` fast. It is left
  out at normal speed, and any other value is dropped on import.
- `click`, optional, turns on click anywhere. It is left out while off, and only `true`
  is accepted on import.
- `look`, optional, is the look a new hotspot starts from: `link` and `info`, each with
  any of the hotspot fields `shape`, `icon`, `color`, `size`, `ts`, `box`, `fix`, `lp`,
  `hov`, `fl` and `wl`, checked as on a hotspot. Import drops a field that doesn't check
  out and an icon the file doesn't carry. Exported tours leave it out.
- `bar`, optional, is the tour's scene bar: `"names"` for the names (or previous and next past
  12 scenes) or `"none"` for no bar. It is left out for the thumbnail strip, the default, and
  import drops any other value. A build that predates it shows its own bar.
- `snap`, optional, puts Save view as image in an exported tour. Like `click`, it is left
  out while off and only `true` is accepted on import.
- Scene `note`, optional, is the scene's notes for visitors: plain text with `\n` line
  breaks. Import trims it, turns `\r\n` into `\n` and keeps at most 2000 characters; an
  empty note is left out. An exported tour always carries it.
- `taken` is the camera's local capture time, with no time zone, and `gps` the position in
  decimal degrees. Both are optional. `meta` decides whether the tour shows them; an
  exported tour carries them only when it is `true`.
- Scene `sq`, optional, is the square thumbnail: in a `.json` file and the single-file tour
  a `data:image/jpeg` URL of at most 200,000 characters, in a folder tour's `data.js` the
  path of a file under `thumbs/`. Import keeps only a base64 JPEG within that length, and a
  scene without one gets a new thumbnail. The name is `sq` (square) rather than `cv`, so it
  isn't mistaken for the project's cover. Scene `sqv`, optional, is the view the author
  pinned it to: `y` the turn of the scene from 0 to 1, as `u0`, `p` the pitch in radians
  (±π/2) and `f` the vertical field of view, 40 to 95. Without it the thumbnail follows the
  start view. An exported tour leaves `sqv` out.
- Scene `cam`, optional, is the camera that took the photo: Exif make and model, then the
  focal length, at most 80 characters. Import keeps it as a trimmed string without control
  or bidi formatting characters. It is the author's record: an exported tour leaves it out,
  and a `.json` backup keeps it.
- Scene `snd`, optional, is the scene's audio clip. `loop: true` repeats it while the
  visitor stays, and `delay` is the wait in whole seconds before it starts, 0 to 30; both
  are left out at their defaults. On import the clip must be a `data:audio/` URL of at most
  8 MB.
- Scene `src`, optional, describes the file the scene was made from: `h` the SHA-256 hash
  of its first 4 MB and its size (64 lowercase hex digits, used to find duplicates), `name`
  the file name (at most 120 characters), `w` and `h0` its pixel size before any scaling
  (1 to 65535), `bytes` its size and `type` its MIME type (at most 40 characters). Each part
  is checked on import and left out if it doesn't fit. An exported tour leaves out `h`; a
  `.json` backup keeps it, so duplicates are still found after the backup is imported.
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
  offline and cannot report anything back to anyone. A folder tour may load files from its
  own origin only: no other site, no `fetch()`, no inline scripts.
- An imported `.json` file is treated as untrusted. Only well-formed fields are kept,
  images must be `data:` URLs, and every value is escaped before it reaches the page.
- The embed code generator accepts only `http` and `https` addresses.

## Accessibility

Colour pairs are checked numerically: text at 4.5:1 or better (WCAG 1.4.3), control
borders and focus rings at 3:1 or better (WCAG 1.4.11). Touch targets are 44px on
coarse pointers (WCAG 2.5.5). The panorama is fully keyboard operable, every scene of a tour
can be reached from the keyboard through the scene bar and the scene grid, status messages
are announced through `aria-live`, and `prefers-reduced-motion` is respected: in the
interface, and in the tour, where it turns the walk into a short cross-fade, keeps
auto-rotate off and makes hotspots grow at once (see Viewing).

## Limitations

- A single-file export carries about 750 KB of fixed code, mostly Three.js, before any
  imagery, and embeds panoramas as base64. A 15-scene tour reaches tens of megabytes; use
  the folder export for anything larger.
- A folder tour doesn't open from disk; it needs a web server, even a local one.
- A `.json` backup is a single string, which browsers can't build or read much past 500 MB.
  When the high-resolution masters would push the file past 300 MB, they are left out of it
  (the editor says so) and stay in the browser; the folder export still carries them.
- High resolution can't be added to images already in a project, since they were stored at
  4096 px; replace each image (Replace image in the scene settings) with the option on. Safari on iPhone and iPad refuses a canvas of
  8192 × 4096, so images added there keep the 4096 px copy only.
- A touch-screen laptop counts as a touch device and gets the 4096 px copies.
- Autosave does not work in private browsing. The editor says so rather than failing
  quietly.
- Safari may evict site storage after a period without visits. Keep `.json` backups.
- Renaming a scene or changing its north direction does not update tours you already
  exported. Export again.
- The logo is a screen overlay, so it does not appear inside a VR headset. Nor do the
  scene bar and the scene grid.
- Click anywhere stays off in a VR headset: a trigger pulled at empty space does nothing.
  Nothing in the headset would show which link it was about to take, the visitor would be
  moved without a walk, and the controller's ray already makes a hotspot easy to aim at.
- Safari on iPhone and iPad doesn't let a page set an audio volume, so there the music
  pauses while a scene's clip plays instead of fading down, and resumes afterwards.
- **VR mode and the gyroscope have not been tested on real hardware.** Verify both
  before relying on them.

## Roadmap

- A trimmed viewer bundle that leaves out editor code.
- Direct-to-disk saving through the File System Access API.
- A view cone on the floor plan.
- More interface languages.

## Credits

Sample panoramas are by Greg Zaal, from [Poly Haven](https://polyhaven.com), released
under CC0. [Three.js](https://threejs.org) is bundled under the MIT licence,
copyright 2010-2021 Three.js Authors.

## Licence

[MIT](LICENSE)
