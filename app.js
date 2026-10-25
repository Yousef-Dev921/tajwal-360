const $ = id => document.getElementById(id),
  PI = Math.PI,
  SPHERE_R = 500,
  SHELL = $('root').innerHTML;
const esc = s =>
  String(s ?? '').replace(
    /[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );
const uid = () => Math.random().toString(36).slice(2, 9),
  EMBED = window.__TOUR__,
  textures = {};
// ───────────── theme, language, strings ─────────────
// localStorage throws outright in some private-browsing modes, so every access is guarded.
const lsGet = k => {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  },
  lsSet = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch (e) {}
  };
// Every interface string, in Arabic and English. Static markup refers to these keys through
// data-i18n attributes; a value can be an object of plural forms (see t() below).
// In Arabic, "360°" sits between U+2066 and U+2069 (left-to-right isolate). Without them the
// bidi algorithm puts the degree sign on the wrong side of the number; percentages get the
// same treatment, and file names sit in a first-strong isolate (U+2068) so Latin names keep
// their own order.
const I18N = {
  ar: {
    'doc.title': 'Tajwal 360 — استوديو الجولات الافتراضية',
    'nav.library': 'المكتبة',
    'theme.auto': 'المظهر: تلقائي',
    'theme.light': 'المظهر: فاتح',
    'theme.dark': 'المظهر: داكن',
    'lang.to.ar': 'التبديل إلى العربية',
    'lang.to.en': 'التبديل إلى الإنجليزية',
    'f.tourTitle': 'عنوان الجولة',
    'f.shortDesc': 'وصف قصير',
    'f.tourDesc': 'وصف الجولة',
    'f.descPh': 'يظهر في شاشة البداية',
    'f.sceneName': 'اسم المشهد',
    'f.size': 'الحجم',
    'f.tourUrl': 'رابط الجولة بعد نشرها',
    'f.embedPh': 'أدخل رابط الجولة ليظهر كود التضمين',
    'f.label': 'العنوان',
    'f.target': 'الوجهة',
    'f.text': 'النص',
    'f.shape': 'الشكل',
    'f.color': 'اللون',
    'act.addImages': 'إضافة صور \u2066360°\u2069',
    'act.undo': 'تراجع',
    'act.undoTitle': 'تراجع (Ctrl+Z)',
    'act.redo': 'إعادة',
    'act.redoTitle': 'إعادة (Ctrl+Shift+Z)',
    'act.preview': 'معاينة',
    'act.export': 'تصدير الجولة',
    'act.saveCopy': 'حفظ نسخة',
    'act.import': 'استيراد',
    'act.startAngle': 'زاوية البداية',
    'act.startAngleTitle': 'اجعل الزاوية الحالية نقطة بداية هذا المشهد',
    'act.north': 'اتجاه الشمال',
    'act.northTitle':
      'اجعل الاتجاه الحالي هو الشمال، ليبقى الاتجاه ثابتاً عند الانتقال بين المشاهد',
    'act.moveFwd': 'تقديم',
    'act.moveBack': 'تأخير',
    'act.delScene': 'حذف المشهد',
    'act.confirmDel': 'اضغط مجدداً للتأكيد',
    'act.upImage': 'رفع صورة',
    'act.upAudio': 'رفع ملف صوتي',
    'act.upPlan': 'رفع مخطط',
    'act.remove': 'إزالة',
    'act.placeScene': 'حدّد موقع المشهد على المخطط',
    'act.copyCode': 'نسخ الكود',
    'act.vr': 'وضع VR',
    'act.gyro': 'جيروسكوب',
    'act.backEdit': 'العودة إلى التحرير',
    'act.muteAria': 'كتم الصوت',
    'act.unmuteAria': 'تشغيل الصوت',
    'act.planBtn': 'المخطط',
    'act.close': 'إغلاق',
    'act.delete': 'حذف',
    'act.delHs': 'حذف النقطة',
    'sec.scenes': 'المشاهد',
    'sec.sceneSet': 'إعدادات المشهد',
    'sec.hotspots': 'النقاط التفاعلية',
    'sec.view': 'خيارات العرض',
    'sec.logo': 'الشعار',
    'hint.logo':
      'ارفع شعاراً بخلفية شفافة (PNG أو SVG أو WebP). يظهر في زاوية الجولة فوق كل المشاهد، ويمكنك سحبه داخل البانوراما إلى أي زاوية.',
    'act.upLogo': 'رفع شعار',
    'act.replaceLogo': 'تغيير الشعار',
    'f.position': 'الموضع',
    'f.opacity': 'درجة الظهور',
    'logo.tl': 'أعلى اليسار',
    'logo.tr': 'أعلى اليمين',
    'logo.bl': 'أسفل اليسار',
    'logo.br': 'أسفل اليمين',
    'logo.dragTitle': 'اسحب الشعار إلى أي زاوية',
    'sec.nadir': 'غطاء الحامل',
    'sec.audio': 'موسيقى خلفية',
    'sec.plan': 'مخطط الموقع',
    'sec.embed': 'كود التضمين',
    'opt.autorotate': 'دوران تلقائي',
    'opt.walk': 'انتقال سلس بين المشاهد',
    'hint.reorder': 'اسحب المشهد لتغيير ترتيبه.',
    'hint.nadir': 'صورة تغطّي الحامل الثلاثي في أسفل البانوراما.',
    'hint.audio': 'يبدأ التشغيل بعد أول لمسة من الزائر. الحد الأقصى 8 ميجابايت.',
    'hint.plan': 'ارفع صورة المخطط، ثم حدّد موقع كل مشهد عليه.',
    'hint.clickPano': 'اضغط على البانوراما لتحديد مكان النقطة.',
    'hint.dragHs': 'اسحب النقطة داخل البانوراما لتغيير مكانها.',
    'hs.link': 'انتقال',
    'hs.info': 'معلومات',
    'shape.arrow': 'سهم',
    'shape.ring': 'حلقة',
    'shape.dot': 'نقطة',
    'shape.pin': 'دبوس',
    'shape.star': 'نجمة',
    'shape.info': 'معلومات',
    'lib.title': 'مكتبة المشاريع',
    'lib.new': 'مشروع جديد',
    'lib.open': 'فتح',
    'lib.current': 'مفتوح الآن',
    'lib.dup': 'تكرار',
    'lib.empty': 'لا توجد مشاريع بعد.',
    'lib.scenes': {
      zero: 'بلا مشاهد',
      one: 'مشهد واحد',
      two: 'مشهدان',
      few: '{n} مشاهد',
      many: '{n} مشهداً',
      other: '{n} مشهد',
    },
    'def.title': 'جولتي الافتراضية',
    'def.newProj': 'مشروع جديد',
    'def.imported': 'مشروع مستورد',
    'def.untitled': 'بلا عنوان',
    'def.copySuffix': ' (نسخة)',
    'view.start': 'ابدأ الجولة',
    'view.loading': 'جارٍ التحميل…',
    'empty': 'أضف صورة بانوراما \u2066360°\u2069 للبدء، أو اسحب الصور وأفلتها هنا.',
    'aria.loading': 'جارٍ التحميل',
    'aria.canvas': 'بانوراما \u2066360°\u2069. استخدم الأسهم للتلفّت، و+ أو − للتكبير والتصغير.',
    'cmp.title': 'اضغط للتوجّه نحو الشمال',
    'cmp.aria': 'البوصلة: اضغط للتوجّه نحو الشمال',
    'msg.quotaFull':
      'امتلأت مساحة التخزين في المتصفح ولم يُحفظ عملك. اضغط «حفظ نسخة» الآن لتنزيله على جهازك قبل إغلاق الصفحة.',
    'msg.noAutosave':
      'تعذّر الحفظ التلقائي في هذا المتصفح، وقد يكون السبب وضع التصفّح الخاص. اضغط «حفظ نسخة» لتنزيل عملك.',
    'msg.quotaWarn':
      'استُهلك \u2066{p}%\u2069 من مساحة التخزين في المتصفح. احفظ نسخاً من مشاريعك المهمة على جهازك.',
    'msg.autosaveBack': 'عاد الحفظ التلقائي إلى العمل.',
    'msg.notPano': {
      one: '«\u2068{name}\u2069» ليست بانوراما \u2066360°\u2069، فوُضعت كلوحة مسطّحة داخل المشهد.',
      two: 'صورتان ليستا بانوراما \u2066360°\u2069، فوُضعتا كلوحتين مسطّحتين داخل مشهديهما.',
      other: '{n} من الصور ليست بانوراما \u2066360°\u2069، فوُضعت كلوحات مسطّحة داخل مشاهدها.',
    },
    'msg.readFail': {
      one: 'تعذّرت قراءة «\u2068{name}\u2069».',
      two: 'تعذّرت قراءة ملفين.',
      other: 'تعذّرت قراءة {n} من الملفات.',
    },
    'msg.imgFail': 'تعذّرت قراءة الصورة.',
    'msg.sceneFail': 'تعذّر تحميل هذا المشهد.',
    'msg.startSaved': 'حُفظت زاوية البداية لهذا المشهد.',
    'msg.needTwoScenes': 'أضف مشهداً ثانياً قبل إنشاء نقطة انتقال.',
    'msg.needOneScene': 'أضف مشهداً واحداً على الأقل قبل التصدير.',
    'msg.preparing': 'جارٍ تجهيز الملف…',
    'msg.exported': 'نُزّلت الجولة كملف مستقل ({mb} ميجابايت).',
    'msg.exportFail':
      'تعذّر التصدير. افتح الموقع عبر https (مثل GitHub Pages) أو من خادم محلي، فالتصدير لا يعمل عند فتح الملف مباشرةً من الجهاز.',
    'msg.northSet': 'حُدّد اتجاه الشمال لهذا المشهد، وظهرت البوصلة في الزاوية.',
    'msg.nothingToSave': 'لا يوجد ما يُحفظ بعد.',
    'msg.preparingProj': 'جارٍ تجهيز ملف المشروع…',
    'msg.projSaved': 'نُزّل ملف المشروع على جهازك. احتفظ به نسخةً احتياطية.',
    'msg.projSaveFail': 'تعذّر تجهيز ملف المشروع.',
    'msg.importing': 'جارٍ الاستيراد…',
    'msg.imported': 'أُضيف المشروع إلى المكتبة وفُتح.',
    'msg.newerFile': 'هذا الملف من إصدار أحدث من التطبيق. حدّث الصفحة ثم أعد المحاولة.',
    'msg.badFile': 'ملف المشروع غير صالح أو لا يحتوي على أي مشهد.',
    'msg.openFail': 'تعذّر فتح المشروع.',
    'msg.openFailStore': 'تعذّرت قراءة المشروع من التخزين.',
    'msg.duplicated': 'أُنشئت نسخة من المشروع.',
    'msg.projFileSaved': 'نُزّل ملف المشروع على جهازك.',
    'msg.projExpFail': 'تعذّر حفظ نسخة من هذا المشروع.',
    'msg.gyroDenied': 'لم يُمنح الإذن',
    'msg.gyroNA': 'المستشعر غير متاح',
    'msg.vrFail': 'تعذّر تشغيل وضع VR.',
    'msg.remind': 'عملك محفوظ في هذا المتصفح فقط. اضغط «حفظ نسخة» لتنزيل نسخة على جهازك.',
    'msg.planSet': 'حُدّد موقع المشهد على المخطط.',
    'msg.planFirst': 'ارفع صورة المخطط أولاً.',
    'msg.planClick': 'اضغط على المخطط لتحديد موقع هذا المشهد.',
    'msg.audioBig': 'حجم الملف الصوتي أكبر من 8 ميجابايت. اختر ملفاً أصغر.',
    'msg.audioAdded': 'أُضيفت الموسيقى.',
    'msg.logoAdded': 'أُضيف الشعار. اسحبه داخل البانوراما إلى الزاوية التي تريدها.',
    'msg.logoOpaque':
      'أُضيف الشعار، لكن خلفيته غير شفافة فسيظهر داخل مستطيل. ملف PNG بخلفية شفافة يعطي نتيجة أنظف.',
    'msg.logoBig': 'حجم ملف الشعار أكبر من 5 ميجابايت. اختر ملفاً أصغر.',
    'msg.urlFirst': 'أدخل رابط الجولة أولاً.',
    'msg.badUrl': 'أدخل رابطاً كاملاً يبدأ بـ https:// أو http://',
    'msg.copied': 'نُسخ كود التضمين.',
    'msg.noStorage':
      'تعذّر الوصول إلى تخزين المتصفح، وقد يكون السبب وضع التصفّح الخاص. لن يُحفظ عملك تلقائياً، فاستخدم «حفظ نسخة» بانتظام.',
  },
  en: {
    'doc.title': 'Tajwal 360 — Virtual Tour Studio',
    'nav.library': 'Library',
    'theme.auto': 'Theme: auto',
    'theme.light': 'Theme: light',
    'theme.dark': 'Theme: dark',
    'lang.to.ar': 'Switch to Arabic',
    'lang.to.en': 'Switch to English',
    'f.tourTitle': 'Tour title',
    'f.shortDesc': 'Short description',
    'f.tourDesc': 'Tour description',
    'f.descPh': 'Shown on the start screen',
    'f.sceneName': 'Scene name',
    'f.size': 'Size',
    'f.tourUrl': 'Tour URL after publishing',
    'f.embedPh': 'Enter the tour URL to get the embed code',
    'f.label': 'Label',
    'f.target': 'Destination',
    'f.text': 'Text',
    'f.shape': 'Shape',
    'f.color': 'Colour',
    'act.addImages': 'Add 360° images',
    'act.undo': 'Undo',
    'act.undoTitle': 'Undo (Ctrl+Z)',
    'act.redo': 'Redo',
    'act.redoTitle': 'Redo (Ctrl+Shift+Z)',
    'act.preview': 'Preview',
    'act.export': 'Export tour',
    'act.saveCopy': 'Save a copy',
    'act.import': 'Import',
    'act.startAngle': 'Start angle',
    'act.startAngleTitle': 'Use the current view as this scene’s starting view',
    'act.north': 'North direction',
    'act.northTitle':
      'Mark the current direction as north, so the heading carries over between scenes',
    'act.moveFwd': 'Move earlier',
    'act.moveBack': 'Move later',
    'act.delScene': 'Delete scene',
    'act.confirmDel': 'Click again to confirm',
    'act.upImage': 'Upload image',
    'act.upAudio': 'Upload audio',
    'act.upPlan': 'Upload plan',
    'act.remove': 'Remove',
    'act.placeScene': 'Place this scene on the plan',
    'act.copyCode': 'Copy code',
    'act.vr': 'VR mode',
    'act.gyro': 'Gyroscope',
    'act.backEdit': 'Back to editor',
    'act.muteAria': 'Mute audio',
    'act.unmuteAria': 'Unmute audio',
    'act.planBtn': 'Floor plan',
    'act.close': 'Close',
    'act.delete': 'Delete',
    'act.delHs': 'Delete hotspot',
    'sec.scenes': 'Scenes',
    'sec.sceneSet': 'Scene settings',
    'sec.hotspots': 'Hotspots',
    'sec.view': 'Viewing options',
    'sec.logo': 'Logo',
    'hint.logo':
      'Upload a logo with a transparent background (PNG, SVG or WebP). It shows in a corner of the tour, over every scene, and you can drag it to any corner on the panorama.',
    'act.upLogo': 'Upload logo',
    'act.replaceLogo': 'Replace logo',
    'f.position': 'Position',
    'f.opacity': 'Opacity',
    'logo.tl': 'Top left',
    'logo.tr': 'Top right',
    'logo.bl': 'Bottom left',
    'logo.br': 'Bottom right',
    'logo.dragTitle': 'Drag the logo to any corner',
    'sec.nadir': 'Nadir patch',
    'sec.audio': 'Background music',
    'sec.plan': 'Floor plan',
    'sec.embed': 'Embed code',
    'opt.autorotate': 'Auto-rotate',
    'opt.walk': 'Smooth transitions between scenes',
    'hint.reorder': 'Drag a scene to reorder it.',
    'hint.nadir': 'An image that covers the tripod at the bottom of the panorama.',
    'hint.audio': 'Starts playing after the visitor’s first tap. 8 MB maximum.',
    'hint.plan': 'Upload a floor plan, then place each scene on it.',
    'hint.clickPano': 'Click the panorama to place the hotspot.',
    'hint.dragHs': 'Drag the hotspot in the panorama to move it.',
    'hs.link': 'Link',
    'hs.info': 'Info',
    'shape.arrow': 'Arrow',
    'shape.ring': 'Ring',
    'shape.dot': 'Dot',
    'shape.pin': 'Pin',
    'shape.star': 'Star',
    'shape.info': 'Info',
    'lib.title': 'Project library',
    'lib.new': 'New project',
    'lib.open': 'Open',
    'lib.current': 'Open now',
    'lib.dup': 'Duplicate',
    'lib.empty': 'No projects yet.',
    'lib.scenes': { one: '1 scene', other: '{n} scenes' },
    'def.title': 'My virtual tour',
    'def.newProj': 'New project',
    'def.imported': 'Imported project',
    'def.untitled': 'Untitled',
    'def.copySuffix': ' (copy)',
    'view.start': 'Start tour',
    'view.loading': 'Loading…',
    'empty': 'Add a 360° panorama to start, or drag and drop images here.',
    'aria.loading': 'Loading',
    'aria.canvas': '360° panorama. Use the arrow keys to look around, and + or − to zoom.',
    'cmp.title': 'Click to face north',
    'cmp.aria': 'Compass: click to face north',
    'msg.quotaFull':
      'Browser storage is full, so your work was not saved. Use “Save a copy” now to download it before you close the page.',
    'msg.noAutosave':
      'Autosave isn’t working in this browser, possibly because of private browsing. Use “Save a copy” to download your work.',
    'msg.quotaWarn':
      '{p}% of this browser’s storage is in use. Save copies of the projects that matter to your device.',
    'msg.autosaveBack': 'Autosave is working again.',
    'msg.notPano': {
      one: '“{name}” isn’t a 360° panorama, so it was placed as a flat panel in its scene.',
      other: '{n} images aren’t 360° panoramas, so they were placed as flat panels.',
    },
    'msg.readFail': { one: '“{name}” could not be read.', other: '{n} files could not be read.' },
    'msg.imgFail': 'The image could not be read.',
    'msg.sceneFail': 'This scene could not be loaded.',
    'msg.startSaved': 'Start angle saved for this scene.',
    'msg.needTwoScenes': 'Add a second scene before creating a link hotspot.',
    'msg.needOneScene': 'Add at least one scene before exporting.',
    'msg.preparing': 'Preparing the file…',
    'msg.exported': 'Tour downloaded as a single file ({mb} MB).',
    'msg.exportFail':
      'Export failed. Open the site over https (GitHub Pages, for example) or from a local server. Export doesn’t work when the page is opened straight from disk.',
    'msg.northSet': 'North set for this scene. The compass now shows in the corner.',
    'msg.nothingToSave': 'There’s nothing to save yet.',
    'msg.preparingProj': 'Preparing the project file…',
    'msg.projSaved': 'Project file downloaded. Keep it as a backup.',
    'msg.projSaveFail': 'The project file could not be prepared.',
    'msg.importing': 'Importing…',
    'msg.imported': 'Project added to the library and opened.',
    'msg.newerFile':
      'This file was made with a newer version of the app. Reload the page and try again.',
    'msg.badFile': 'This project file is invalid or has no scenes.',
    'msg.openFail': 'The project could not be opened.',
    'msg.openFailStore': 'The project could not be read from storage.',
    'msg.duplicated': 'Project duplicated.',
    'msg.projFileSaved': 'Project file downloaded.',
    'msg.projExpFail': 'A copy of this project could not be saved.',
    'msg.gyroDenied': 'Permission denied',
    'msg.gyroNA': 'Sensor unavailable',
    'msg.vrFail': 'VR mode could not be started.',
    'msg.remind':
      'Your work is only stored in this browser. Use “Save a copy” to keep a copy on your device.',
    'msg.planSet': 'Scene placed on the plan.',
    'msg.planFirst': 'Upload a floor plan first.',
    'msg.planClick': 'Click the plan to place this scene.',
    'msg.audioBig': 'The audio file is over 8 MB. Choose a smaller one.',
    'msg.audioAdded': 'Music added.',
    'msg.logoAdded': 'Logo added. Drag it on the panorama to the corner you want.',
    'msg.logoOpaque':
      'Logo added, but its background isn’t transparent, so it will show as a rectangle. A PNG with a transparent background looks cleaner.',
    'msg.logoBig': 'The logo file is over 5 MB. Choose a smaller one.',
    'msg.urlFirst': 'Enter the tour URL first.',
    'msg.badUrl': 'Enter a full URL that starts with https:// or http://',
    'msg.copied': 'Embed code copied.',
    'msg.noStorage':
      'Browser storage isn’t available, possibly because of private browsing. Your work won’t be saved automatically, so use “Save a copy” regularly.',
  },
};
// An exported tour carries the language its author used; the editor remembers its own.
let LANG = (EMBED && EMBED.lang) || lsGet('vrt.lang') || 'ar';
if (!I18N[LANG]) LANG = 'ar';
const isRTL = () => LANG == 'ar';
// Looks up a string and fills its {placeholders} from o. When the entry is a set of plural
// forms, o.n picks the form through Intl.PluralRules, which knows Arabic's six categories.
const t = (k, o) => {
  let s = I18N[LANG][k] ?? I18N.ar[k] ?? k;
  if (typeof s == 'object') s = s[new Intl.PluralRules(LANG).select(o?.n ?? 0)] ?? s.other;
  return o ? s.replace(/\{(\w+)\}/g, (m, p) => (p in o ? o[p] : m)) : s;
};
// Replaces an element's own text and leaves child elements (the icon <svg>) alone.
function setText(e, s) {
  const n = [...e.childNodes].filter(c => c.nodeType == 3);
  if (!n.length) {
    e.appendChild(document.createTextNode(s));
    return;
  }
  n[0].data = s;
  for (let i = 1; i < n.length; i++) n[i].data = '';
}
const I18N_ATTRS = [
  ['title', 'data-i18n-title'],
  ['placeholder', 'data-i18n-placeholder'],
  ['aria-label', 'data-i18n-aria'],
  ['alt', 'data-i18n-alt'],
];
function applyI18N() {
  document.querySelectorAll('[data-i18n]').forEach(e => setText(e, t(e.getAttribute('data-i18n'))));
  for (const [a, d] of I18N_ATTRS)
    document.querySelectorAll('[' + d + ']').forEach(e => e.setAttribute(a, t(e.getAttribute(d))));
}
function setLang(l) {
  if (!I18N[l] || l == LANG) return;
  LANG = l;
  lsSet('vrt.lang', l);
  document.documentElement.lang = l;
  document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
  applyI18N();
  delConfirm = 0;
  syncToggles();
  glCanvas.setAttribute('aria-label', t('aria.canvas'));
  ui();
  if (!$('libm').hidden) renderLibrary();
}
const THEMES = ['auto', 'light', 'dark'];
let THEME = lsGet('vrt.theme');
if (THEMES.indexOf(THEME) < 0) THEME = 'auto';
// boot.js has already applied the stored value; this keeps it in step afterwards.
function setTheme(v) {
  THEME = v;
  lsSet('vrt.theme', v);
  const H = document.documentElement;
  if (v == 'auto') H.removeAttribute('data-theme');
  else H.setAttribute('data-theme', v);
  syncToggles();
}
function syncToggles() {
  const b = $('theme');
  if (!b) return;
  const l = t('theme.' + THEME);
  b.title = l;
  b.setAttribute('aria-label', l);
  $('themei').setAttribute(
    'href',
    THEME == 'light' ? '#i-sun' : THEME == 'dark' ? '#i-moon' : '#i-auto'
  );
  const g = $('lang'),
    o = isRTL() ? 'en' : 'ar',
    gl = t('lang.to.' + o);
  g.title = gl;
  g.setAttribute('aria-label', gl);
  $('langt').textContent = o == 'en' ? 'EN' : 'ع';
}
document.documentElement.lang = LANG;
document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
if (EMBED) $('tgs').hidden = true;
else {
  $('theme').onclick = () => setTheme(THEMES[(THEMES.indexOf(THEME) + 1) % THEMES.length]);
  $('lang').onclick = () => setLang(isRTL() ? 'en' : 'ar');
}
applyI18N();
syncToggles();
// Status toast. Defined early because the storage layer calls it on failure.
let toastTimer,
  toastMs = 5200;
function toast(text, ms) {
  toastMs = ms || 5200;
  const m = $('msg');
  if (m) m.textContent = text;
}
let project = EMBED || { title: t('def.title'), scenes: [] },
  scenes = project.scenes,
  current = -1,
  selId = null,
  placing = null,
  mode = EMBED ? 'view' : 'edit',
  yaw = 0,
  pitch = 0,
  fov = 75,
  drag = null,
  hovered = null,
  gazeTarget = null,
  gazeTime = 0,
  lastFrame = 0,
  saveTimer;
const SCHEMA = 1;
const openDb = () =>
  new Promise((r, j) => {
    const q = indexedDB.open('vrtour', 1);
    q.onupgradeneeded = () => {
      if (!q.result.objectStoreNames.contains('k')) q.result.createObjectStore('k');
    };
    q.onsuccess = () => r(q.result);
    q.onerror = () => j(q.error || new Error('idb'));
  });
// Rejects on failure so the caller can tell the user. Resolving on error would let a
// full disk throw work away without a word.
const dbOp = (m, k, v) =>
  openDb().then(
    d =>
      new Promise((res, rej) => {
        let tx;
        try {
          tx = d.transaction('k', m == 'get' ? 'readonly' : 'readwrite');
        } catch (e) {
          return rej(e);
        }
        const o = tx.objectStore('k'),
          q = m == 'get' ? o.get(k) : m == 'put' ? o.put(v, k) : o.delete(k);
        q.onsuccess = () => res(q.result);
        q.onerror = ev => {
          ev.preventDefault && ev.preventDefault();
          rej(q.error || tx.error || new Error('db:' + m));
        };
        tx.onabort = () => rej(tx.error || new Error('db-abort:' + m));
      })
  );
// Images: blob: URLs in memory, binary Blobs on disk (no base64 33% overhead).
function dataToBlob(u) {
  const i = u.indexOf(','),
    h = u.slice(0, i),
    bin = atob(u.slice(i + 1)),
    n = bin.length,
    a = new Uint8Array(n);
  for (let x = 0; x < n; x++) a[x] = bin.charCodeAt(x);
  return new Blob([a], { type: (h.match(/:(.*?);/) || [, 'application/octet-stream'])[1] });
}
const toDataURL = b =>
  new Promise((res, rej) => {
    const f = new FileReader();
    f.onload = () => res(f.result);
    f.onerror = () => rej(f.error);
    f.readAsDataURL(b);
  });
const canvasBlob = (canvas, type, quality) => new Promise(r => canvas.toBlob(r, type, quality));
const objURL = b => URL.createObjectURL(b);
const freeURL = u => {
  if (typeof u == 'string' && u.startsWith('blob:')) URL.revokeObjectURL(u);
};

let library = [],
  projectId = null,
  dirtyScenes = new Set(),
  storedSceneIds = new Set(),
  audioDirty = false,
  saveBroken = false,
  editCount = 0,
  quotaWarned = false;
const save = () => {
  if (EMBED || !projectId) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 400);
  snapshot();
  editCount++;
};
// decode() can stall indefinitely when the page is not compositing, which would leave
// the loading bar up for good. Wait for load, which is reliable, then cap decode.
// Thumbnails only draw the image to a canvas, so they skip decode() altogether.
const DECODE_TIMEOUT_MS = 6000;
function loadImg(src, decode = true) {
  return new Promise((res, rej) => {
    const im = new Image();
    let started = false;
    const ready = () => {
      if (started) return;
      started = true;
      if (!decode) return res(im);
      const k = setTimeout(() => res(im), DECODE_TIMEOUT_MS),
        fin = () => {
          clearTimeout(k);
          res(im);
        };
      (im.decode ? im.decode() : Promise.resolve()).then(fin, fin);
    };
    im.onload = ready;
    im.onerror = () => rej(new Error('image'));
    im.src = src;
    if (im.complete && im.naturalWidth) ready();
  });
}
const makeTexture = im => {
  const tex = new THREE.Texture(im);
  tex.encoding = THREE.sRGBEncoding;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
};
async function libraryThumb(src) {
  try {
    const im = await loadImg(src, false);
    const c = document.createElement('canvas');
    c.width = 320;
    c.height = 160;
    c.getContext('2d').drawImage(im, 0, 0, 320, 160);
    return c.toDataURL('image/jpeg', 0.7);
  } catch (e) {
    return null;
  }
}
// Project document without image bytes, so autosave stays a few KB per write.
function toDoc(Q) {
  const d = { ...Q, v: SCHEMA, scenes: (Q.scenes || []).map(({ img, blob, ...r }) => r) };
  if (Q.audio) d.audio = { name: Q.audio.name, vol: Q.audio.vol };
  else delete d.audio;
  return d;
}
function saveFailed(e) {
  saveBroken = true;
  const q =
    e &&
    (e.name == 'QuotaExceededError' ||
      e.name == 'NotEnoughSpace' ||
      /quota|space/i.test(e.message || ''));
  toast(t(q ? 'msg.quotaFull' : 'msg.noAutosave'), 12000);
}
async function flush() {
  clearTimeout(saveTimer);
  if (EMBED || !projectId) return;
  const id = projectId,
    Q = project;
  try {
    for (const sid of [...dirtyScenes]) {
      const s = Q.scenes.find(x => x.id == sid);
      if (s && s.blob) await dbOp('put', 'b:' + id + ':' + sid, s.blob);
      dirtyScenes.delete(sid);
    }
    if (audioDirty) {
      if (Q.audio && Q.audio.blob) await dbOp('put', 'a:' + id, Q.audio.blob);
      else await dbOp('del', 'a:' + id).catch(() => {});
      audioDirty = false;
    }
    await dbOp('put', 'p:' + id, toDoc(Q));
    const live = new Set(Q.scenes.map(s => s.id));
    for (const sid of storedSceneIds)
      if (!live.has(sid)) await dbOp('del', 'b:' + id + ':' + sid).catch(() => {});
    storedSceneIds = live;
    let e = library.find(x => x.id == id);
    if (!e) {
      e = { id };
      library.push(e);
    }
    e.title = Q.title || t('def.untitled');
    e.n = Q.scenes.length;
    e.t = Date.now();
    const f = Q.scenes[0];
    if (!f) {
      e.th = null;
      e.thid = null;
    } else if (e.thid != f.id) {
      e.thid = f.id;
      e.th = f.th || (await libraryThumb(f.img));
    }
    await dbOp('put', 'idx', library);
    await dbOp('put', 'last', id);
    if (saveBroken) {
      saveBroken = false;
      toast(t('msg.autosaveBack'));
    }
    quotaWatch();
    remind();
  } catch (x) {
    saveFailed(x);
  }
}
// Warn before the quota fills rather than at the moment a write fails.
async function quotaWatch() {
  if (quotaWarned || !navigator.storage?.estimate) return;
  try {
    const { usage, quota } = await navigator.storage.estimate();
    if (quota && usage / quota > 0.8) {
      quotaWarned = true;
      toast(t('msg.quotaWarn', { p: Math.round((usage / quota) * 100) }), 10000);
    }
  } catch (e) {}
}
// Load a project and rehydrate its images as blob: URLs.
// Projects stored in the pre-Blob format are migrated on read.
async function loadProject(id) {
  const doc = await dbOp('get', 'p:' + id);
  if (!doc) return null;
  doc.scenes = Array.isArray(doc.scenes) ? doc.scenes : [];
  for (const s of doc.scenes) {
    if (typeof s.img == 'string' && s.img.startsWith('data:')) {
      // legacy inline data: URL
      try {
        s.blob = dataToBlob(s.img);
        s.img = objURL(s.blob);
        dirtyScenes.add(s.id);
      } catch (e) {
        s.blob = null;
        s.img = '';
      }
    } else {
      const b = await dbOp('get', 'b:' + id + ':' + s.id).catch(() => null);
      if (b instanceof Blob) {
        s.blob = b;
        s.img = objURL(b);
      } else {
        s.blob = null;
        s.img = '';
      }
    }
    if (!Array.isArray(s.hs)) s.hs = [];
  }
  doc.scenes = doc.scenes.filter(s => s.img);
  if (doc.audio) {
    if (typeof doc.audio.src == 'string' && doc.audio.src.startsWith('data:')) {
      try {
        doc.audio.blob = dataToBlob(doc.audio.src);
        doc.audio.src = objURL(doc.audio.blob);
        audioDirty = true;
      } catch (e) {
        delete doc.audio;
      }
    } else {
      const b = await dbOp('get', 'a:' + id).catch(() => null);
      if (b instanceof Blob) {
        doc.audio.blob = b;
        doc.audio.src = objURL(b);
      } else delete doc.audio;
    }
  }
  return doc;
}
function revokeProject(Q) {
  (Q?.scenes || []).forEach(s => freeURL(s.img));
  freeURL(Q?.audio?.src);
}
// ───────────── renderer ─────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local');
const glCanvas = renderer.domElement;
$('stage').prepend(glCanvas);
const scene3d = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 2000);
camera.rotation.order = 'YXZ';
scene3d.add(camera);
const world = new THREE.Group();
scene3d.add(world);
const sphereGeo = new THREE.SphereGeometry(SPHERE_R, 64, 40);
sphereGeo.scale(-1, 1, 1);
const sphereMat = new THREE.MeshBasicMaterial(),
  sphere = new THREE.Mesh(sphereGeo, sphereMat);
world.add(sphere);
const hotspotGroup = new THREE.Group();
world.add(hotspotGroup);
const sphereToVec = (u, v, r) => {
  const phi = 2 * PI * u,
    theta = PI * v;
  return new THREE.Vector3(
    Math.cos(phi) * Math.sin(theta),
    Math.cos(theta),
    Math.sin(phi) * Math.sin(theta)
  ).multiplyScalar(r);
};
const vecToUV = d => {
  d = d
    .clone()
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), -world.rotation.y)
    .normalize();
  return { u: (Math.atan2(d.z, d.x) / (2 * PI) + 1) % 1, v: Math.acos(d.y) / PI };
};
const resize = () => {
  const w = $('stage').clientWidth,
    h = $('stage').clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
};
new ResizeObserver(resize).observe($('stage'));
// ───────────── hotspot sprites ─────────────
// Arabic, Hebrew and related scripts. Canvas text needs its direction set explicitly.
const RTL_TEXT = /[\u0590-\u08ff\ufb1d-\ufdff\ufe70-\ufeff]/;
function drawIcon(ctx, shape, color) {
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = color;
  ctx.beginPath();
  if (shape == 'ring') {
    ctx.arc(0, 0, 64, 0, 7);
    ctx.lineWidth = 18;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, 76, 0, 7);
    ctx.stroke();
  } else if (shape == 'dot') {
    ctx.arc(0, 0, 40, 0, 7);
    ctx.fill();
    ctx.stroke();
  } else if (shape == 'pin') {
    ctx.moveTo(0, 70);
    ctx.bezierCurveTo(-80, -5, -62, -70, 0, -70);
    ctx.bezierCurveTo(62, -70, 80, -5, 0, 70);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -18, 18, 0, 7);
    ctx.fill();
  } else if (shape == 'star') {
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 32 : 72,
        a = (i * PI) / 5 - PI / 2;
      ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.arc(0, 0, 68, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = ctx.fillStyle = '#fff';
    if (shape == 'info') {
      ctx.font = '800 84px Georgia,serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('i', 0, 4);
    } else {
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(-28, 16);
      ctx.lineTo(0, -20);
      ctx.lineTo(28, 16);
      ctx.stroke();
    }
  }
}
function makeHotspotSprite(h) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  ctx.translate(256, 100);
  if (mode == 'edit' && selId == h.id) {
    ctx.setLineDash([14, 12]);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, 98, 0, 7);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  drawIcon(ctx, h.shape, h.color);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (h.label) {
    ctx.font = '700 40px system-ui,Tahoma,Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const w = Math.min(500, ctx.measureText(h.label).width + 40);
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fillRect(256 - w / 2, 208, w, 60);
    ctx.fillStyle = '#fff';
    ctx.direction = RTL_TEXT.test(h.label) ? 'rtl' : 'ltr';
    ctx.fillText(h.label, 256, 252, w - 30);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.encoding = THREE.sRGBEncoding;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true })
  );
  sprite.center.set(0.5, 1 - 100 / 320);
  sprite.renderOrder = 10;
  return sprite;
}
function buildHotspots() {
  hotspotGroup.children.slice().forEach(c => {
    c.material.map.dispose();
    c.material.dispose();
  });
  hotspotGroup.clear();
  gazeTarget = hovered = null;
  (scenes[current]?.hs || []).forEach(h => {
    const sp = makeHotspotSprite(h);
    sp.position.copy(sphereToVec(h.u, h.v, 380));
    sp.userData.h = h;
    hotspotGroup.add(sp);
  });
  preload();
}
// ───────────── scene loading ─────────────
async function showScene(i) {
  const s = scenes[i];
  if (!s) return;
  current = i;
  selId = null;
  placing = null;
  $('pop').hidden = true;
  hideVrPanel();
  if (!textures[s.id]) {
    busy(1);
    try {
      textures[s.id] = makeTexture(await loadImg(s.img));
    } catch (e) {
      busy(-1);
      toast(t('msg.sceneFail'));
      return;
    }
    busy(-1);
  }
  if (current != i) return;
  sphereMat.map = textures[s.id];
  sphereMat.needsUpdate = true;
  worldTurn = s.u0 || 0;
  world.rotation.y = 2 * PI * worldTurn + PI / 2;
  yaw = 0;
  pitch = s.p0 || 0;
  if (gyro) calibrateGyro();
  buildHotspots();
  ui();
}
async function addFiles(files) {
  let first = -1;
  const flatNames = [],
    failedNames = [];
  for (const f of files) {
    if (!f.type.startsWith('image/')) {
      failedNames.push(f.name);
      continue;
    }
    try {
      const im = await createImageBitmap(f),
        flat = Math.abs(im.width / im.height - 2) > 0.15,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
      if (flat) {
        const W = 4096,
          H = 2048,
          s = Math.min(W / 4 / im.width, (H * 0.7) / im.height),
          w = im.width * s,
          h = im.height * s;
        canvas.width = W;
        canvas.height = H;
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, W, H);
        ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
        flatNames.push(f.name);
      } else {
        const k = Math.min(1, 4096 / im.width);
        canvas.width = Math.round(im.width * k);
        canvas.height = Math.round(im.height * k);
        ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
      }
      const blob = await canvasBlob(canvas, 'image/jpeg', 0.86),
        sid = uid();
      scenes.push({
        id: sid,
        name: f.name.replace(/\.[^.]+$/, ''),
        img: objURL(blob),
        blob,
        th: sceneThumb(canvas),
        u0: flat ? 0.5 : 0,
        p0: 0,
        hs: [],
      });
      dirtyScenes.add(sid);
      if (first < 0) first = scenes.length - 1;
    } catch (e) {
      failedNames.push(f.name);
    }
  }
  const notes = [];
  if (flatNames.length) notes.push(t('msg.notPano', { n: flatNames.length, name: flatNames[0] }));
  if (failedNames.length)
    notes.push(t('msg.readFail', { n: failedNames.length, name: failedNames[0] }));
  if (notes.length) toast(notes.join(' '), 8000);
  save();
  if (first >= 0) showScene(first);
  else ui();
}
// ───────────── ui ─────────────
const selHotspot = () => scenes[current]?.hs.find(h => h.id == selId);
function renderScenes() {
  const m = d =>
    scenes
      .map((s, i) =>
        d
          ? `<button data-i="${i}" draggable="true" class="sth ${i == current ? 'on' : ''}" title="${esc(s.name)}">${s.th ? `<img src="${esc(s.th)}" alt="" draggable="false">` : '<span class="ph"></span>'}<span dir="auto">${esc(s.name)}</span></button>`
          : `<button data-i="${i}" class="${i == current ? 'on' : ''}" dir="auto">${esc(s.name)}</button>`
      )
      .join('');
  $('scenes').innerHTML = m(1);
  $('sb').innerHTML = scenes.length > 1 ? m(0) : '';
  // Centre the active scene in the bar. scrollIntoView() would also scroll the page that
  // embeds a tour, so the bar is scrolled directly.
  const sb = $('sb'),
    on = mode == 'view' && sb.querySelector('.on');
  if (on) {
    const a = on.getBoundingClientRect(),
      b = sb.getBoundingClientRect();
    sb.scrollLeft += a.left + a.width / 2 - (b.left + b.width / 2);
  }
  $('title').textContent = scenes[current]?.name || '';
  $('title').hidden = !scenes[current];
  const sh = $('shint');
  if (sh) sh.hidden = scenes.length < 2;
}
function renderHotspotList() {
  $('hlist').innerHTML = (scenes[current]?.hs || [])
    .map(
      h =>
        `<button data-id="${esc(h.id)}" class="${h.id == selId ? 'on' : ''}">${h.type == 'link' ? '<svg class="ic flip"><use href="#i-link"/></svg>' : '<svg class="ic"><use href="#i-info"/></svg>'}<span dir="auto">${esc(h.label || t(h.type == 'link' ? 'hs.link' : 'hs.info'))}</span></button>`
    )
    .join('');
}
const updateHotspot = o => {
  Object.assign(selHotspot(), o);
  buildHotspots();
  renderHotspotList();
  save();
};
const bind = (id, ev, f) => {
  const e = $(id);
  if (e) e.addEventListener(ev, f);
};
function renderHotspotProps() {
  const h = selHotspot(),
    p = $('hprops');
  $('hint2').textContent = placing ? t('hint.clickPano') : '';
  if (!h) {
    p.innerHTML = '';
    return;
  }
  const shp = ['arrow', 'ring', 'dot', 'pin', 'star', 'info'];
  p.innerHTML =
    `<label>${t('f.label')}<input id="pl" dir="auto" value="${esc(h.label)}"></label>` +
    (h.type == 'link'
      ? `<label>${t('f.target')}<select id="pt">${scenes
          .filter(s => s.id != scenes[current].id)
          .map(
            s =>
              `<option value="${esc(s.id)}" ${s.id == h.to ? 'selected' : ''}>${esc(s.name)}</option>`
          )
          .join('')}</select></label>`
      : `<label>${t('f.text')}<textarea id="px" rows="3" dir="auto">${esc(h.text)}</textarea></label>`) +
    `<label>${t('f.shape')}<select id="ps">${shp.map(k => `<option value="${k}" ${k == h.shape ? 'selected' : ''}>${esc(t('shape.' + k))}</option>`).join('')}</select></label>
  <label>${t('f.color')}<input id="pc" type="color" value="${esc(h.color)}"></label>
  <label>${t('f.size')}<input id="pz" type="range" min=".5" max="2.5" step=".1" value="${esc(h.size)}"></label>
  <p id="hint3">${t('hint.dragHs')}</p><button id="pd" class="dng">${t('act.delHs')}</button>`;
  bind('pl', 'input', e => updateHotspot({ label: e.target.value }));
  bind('pt', 'change', e => updateHotspot({ to: e.target.value }));
  bind('px', 'input', e => updateHotspot({ text: e.target.value }));
  bind('ps', 'change', e => updateHotspot({ shape: e.target.value }));
  bind('pc', 'input', e => updateHotspot({ color: e.target.value }));
  bind('pz', 'input', e => updateHotspot({ size: +e.target.value }));
  bind('pd', 'click', () => {
    scenes[current].hs = scenes[current].hs.filter(x => x.id != selId);
    selId = null;
    buildHotspots();
    ui();
    save();
  });
}
function ui() {
  $('root').classList.toggle('view', mode == 'view');
  $('empty').hidden = scenes.length > 0;
  $('sset').hidden = $('hsec').hidden = !scenes[current];
  $('cmp').hidden = scenes[current]?.n == null;
  $('back').hidden = !(mode == 'view' && !EMBED);
  if (scenes[current] && document.activeElement != $('sname'))
    $('sname').value = scenes[current].name;
  renderScenes();
  renderHotspotList();
  renderHotspotProps();
  syncExtras();
  setTimeout(resize, 0);
}
[$('scenes'), $('sb')].forEach(
  e =>
    (e.onclick = ev => {
      const b = ev.target.closest('button');
      if (b) showScene(+b.dataset.i);
    })
);
$('hlist').onclick = e => {
  const b = e.target.closest('button');
  if (b) {
    selId = b.dataset.id;
    placing = null;
    buildHotspots();
    ui();
  }
};
$('file').onchange = e => {
  addFiles([...e.target.files]);
  e.target.value = '';
};
$('stage').ondragover = e => e.preventDefault();
$('stage').ondrop = e => {
  e.preventDefault();
  addFiles([...e.dataTransfer.files]);
};
$('ptitle').oninput = e => {
  project.title = e.target.value;
  save();
};
$('auto').onchange = e => {
  project.auto = e.target.checked;
  save();
};
$('sname').oninput = e => {
  scenes[current].name = e.target.value;
  renderScenes();
  save();
};
$('sstart').onclick = () => {
  const d = new THREE.Vector3();
  camera.getWorldDirection(d);
  const r = vecToUV(d);
  scenes[current].u0 = r.u;
  scenes[current].p0 = PI / 2 - r.v * PI;
  save();
  showScene(current);
  toast(t('msg.startSaved'));
};
let delConfirm = 0;
$('sdel').onclick = () => {
  if (!delConfirm) {
    delConfirm = 1;
    $('sdelt').textContent = t('act.confirmDel');
    setTimeout(() => {
      delConfirm = 0;
      $('sdelt').textContent = t('act.delScene');
    }, 3000);
    return;
  }
  delConfirm = 0;
  $('sdelt').textContent = t('act.delScene');
  const id = scenes[current].id;
  if (sphereMat.map == textures[id]) sphereMat.map = null;
  textures[id]?.dispose();
  delete textures[id];
  scenes.splice(current, 1);
  scenes.forEach(s => (s.hs = s.hs.filter(h => h.type != 'link' || h.to != id)));
  save();
  if (scenes.length) showScene(Math.min(current, scenes.length - 1));
  else {
    current = -1;
    sphereMat.map = null;
    sphereMat.needsUpdate = true;
    buildHotspots();
    ui();
  }
};
$('addl').onclick = () => {
  if (scenes.length < 2) toast(t('msg.needTwoScenes'));
  else {
    placing = 'link';
    selId = null;
    buildHotspots();
    renderHotspotList();
    renderHotspotProps();
  }
};
$('addi').onclick = () => {
  placing = 'info';
  selId = null;
  buildHotspots();
  renderHotspotList();
  renderHotspotProps();
};
$('prev').onclick = () => {
  mode = 'view';
  selId = placing = null;
  buildHotspots();
  ui();
};
$('back').onclick = () => {
  mode = 'edit';
  buildHotspots();
  ui();
};
const fetchText = async u => {
  const r = await fetch(u);
  if (!r.ok) throw new Error(u);
  return r.text();
};
// Downloads data as a file and returns its size in bytes.
function saveFile(name, data, mime) {
  const blob = new Blob([data], { type: mime }),
    a = document.createElement('a'),
    url = URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 5000);
  return blob.size;
}
// The exported tour inlines everything and loads nothing from the network.
const EXPORT_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; " +
  "img-src data: blob:; media-src data: blob:; base-uri 'none'; form-action 'none'";
const fileName = ext =>
  ((project.title || 'tour').replace(/[\\\/:*?"<>|]+/g, '_').trim() || 'tour') + ext;
// Portable form of a project: images become base64 here only, for export and
// for saving a .json file. Never for storage.
async function toPortable(Q) {
  const out = toDoc(Q);
  out.scenes = [];
  for (const s of Q.scenes) {
    const { blob, ...r } = s;
    out.scenes.push({ ...r, img: blob ? await toDataURL(blob) : s.img });
  }
  if (Q.audio)
    out.audio = {
      name: Q.audio.name,
      vol: Q.audio.vol,
      src: Q.audio.blob ? await toDataURL(Q.audio.blob) : Q.audio.src,
    };
  out.lang = LANG; // an exported tour renders in the language its author was using
  return out;
}
const portableProject = () => toPortable(project);
$('exp').onclick = async () => {
  if (!scenes.length) {
    toast(t('msg.needOneScene'));
    return;
  }
  toast(t('msg.preparing'), 60000);
  try {
    const [css, three, app, data] = await Promise.all([
      fetchText('style.css'),
      fetchText('vendor/three.min.js'),
      fetchText('app.js'),
      portableProject(),
    ]);
    const html = `<!DOCTYPE html><html lang="${LANG}" dir="${isRTL() ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${EXPORT_CSP}"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(project.title)}</title><style>${css}</style></head><body><div id="root" class="view">${SHELL}</div><script>${three}<\/script><script>window.__TOUR__=${JSON.stringify(data).replace(/</g, '\\u003c')};${app}<\/script></body></html>`;
    const bytes = saveFile(fileName('.html'), html, 'text/html');
    editCount = 0;
    toast(t('msg.exported', { mb: (bytes / 1048576).toFixed(1) }));
  } catch (e) {
    toast(t('msg.exportFail'), 9000);
  }
};
let dragFrom = -1;
function moveScene(a, b) {
  if (a == b || b < 0 || b >= scenes.length) return;
  const id = scenes[current].id,
    [s] = scenes.splice(a, 1);
  scenes.splice(b, 0, s);
  current = scenes.findIndex(x => x.id == id);
  save();
  ui();
}
$('scenes').ondragstart = e => {
  const b = e.target.closest('button');
  if (b) {
    dragFrom = +b.dataset.i;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(dragFrom));
  }
};
$('scenes').ondragover = e => {
  if (dragFrom >= 0) e.preventDefault();
};
$('scenes').ondrop = e => {
  e.preventDefault();
  const b = e.target.closest('button');
  if (b && dragFrom >= 0) moveScene(dragFrom, +b.dataset.i);
  dragFrom = -1;
};
$('mvb').onclick = () => moveScene(current, current - 1);
$('mva').onclick = () => moveScene(current, current + 1);
$('snorth').onclick = () => {
  const s = scenes[current];
  s.n = (((worldTurn - yaw / (2 * PI)) % 1) + 1) % 1;
  save();
  ui();
  toast(t('msg.northSet'));
};
$('cmp').onclick = () => {
  const s = scenes[current];
  if (s && s.n != null) yaw = 2 * PI * (worldTurn - s.n);
};
$('psave').onclick = async () => {
  if (!scenes.length) {
    toast(t('msg.nothingToSave'));
    return;
  }
  toast(t('msg.preparingProj'), 60000);
  try {
    saveFile(fileName('.json'), JSON.stringify(await portableProject()), 'application/json');
    editCount = 0;
    toast(t('msg.projSaved'));
  } catch (x) {
    toast(t('msg.projSaveFail'));
  }
};
// An imported file is untrusted. Keep only well-formed fields with the expected types,
// so nothing unexpected reaches the markup or an exported tour.
const SHAPES = ['arrow', 'ring', 'dot', 'pin', 'star', 'info'];
const num = (v, fallback) => (Number.isFinite(+v) && v !== null && v !== '' ? +v : fallback);
const clamp01 = v => Math.min(1, Math.max(0, v));
const isDataImage = v => typeof v == 'string' && v.startsWith('data:image/');
const cleanHotspot = h => ({
  id: String(h.id || uid()),
  type: h.type == 'info' ? 'info' : 'link',
  to: h.type == 'info' || h.to == null ? undefined : String(h.to),
  label: String(h.label ?? ''),
  text: String(h.text ?? ''),
  shape: SHAPES.includes(h.shape) ? h.shape : 'arrow',
  color: /^#[0-9a-f]{6}$/i.test(h.color) ? h.color : '#f59e0b',
  size: Math.min(2.5, Math.max(0.5, num(h.size, 1))),
  u: clamp01(num(h.u, 0.5)),
  v: clamp01(num(h.v, 0.5)),
});
const cleanScene = s => {
  const out = {
    id: String(s.id || uid()),
    name: String(s.name ?? ''),
    img: s.img,
    u0: num(s.u0, 0),
    p0: num(s.p0, 0),
    hs: (Array.isArray(s.hs) ? s.hs : []).filter(h => h && typeof h == 'object').map(cleanHotspot),
  };
  if (isDataImage(s.th)) out.th = s.th;
  if (s.n != null && Number.isFinite(+s.n)) out.n = +s.n;
  if (s.pp && typeof s.pp == 'object')
    out.pp = { x: clamp01(num(s.pp.x, 0.5)), y: clamp01(num(s.pp.y, 0.5)) };
  return out;
};
$('pfile').onchange = async e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  toast(t('msg.importing'), 60000);
  try {
    const raw = JSON.parse(await f.text());
    if (!raw || typeof raw != 'object') throw new Error('invalid');
    if (raw.v && raw.v > SCHEMA) throw new Error('newer');
    const d = {
      v: SCHEMA,
      title: String(raw.title ?? ''),
      desc: String(raw.desc ?? ''),
      auto: !!raw.auto,
      walk: raw.walk !== false,
      eurl: typeof raw.eurl == 'string' ? raw.eurl : '',
      scenes: (Array.isArray(raw.scenes) ? raw.scenes : [])
        .filter(s => s && isDataImage(s.img))
        .map(cleanScene),
    };
    if (!d.scenes.length) throw new Error('empty');
    if (raw.nadir && isDataImage(raw.nadir.img))
      d.nadir = { img: raw.nadir.img, r: Math.min(50, Math.max(8, num(raw.nadir.r, 25))) };
    if (raw.plan && isDataImage(raw.plan.img)) d.plan = { img: raw.plan.img };
    if (raw.logo && isDataImage(raw.logo.img)) d.logo = cleanLogo(raw.logo);
    const a = raw.audio;
    if (a && typeof a.src == 'string' && a.src.startsWith('data:'))
      d.audio = {
        src: a.src,
        name: String(a.name ?? ''),
        vol: Math.min(1, Math.max(0, num(a.vol, 0.6))),
      };
    for (const s of d.scenes) {
      s.blob = dataToBlob(s.img);
      s.img = objURL(s.blob);
    }
    if (d.audio) {
      d.audio.blob = dataToBlob(d.audio.src);
      d.audio.src = objURL(d.audio.blob);
    }
    d.title = d.title || t('def.imported');
    await flush();
    const nid = uid() + uid();
    setProject(nid, d);
    d.scenes.forEach(s => dirtyScenes.add(s.id));
    audioDirty = !!d.audio;
    storedSceneIds = new Set();
    await flush();
    closeLib();
    toast(t('msg.imported'));
  } catch (x) {
    toast(t(x.message == 'newer' ? 'msg.newerFile' : 'msg.badFile'));
  }
};
// ───────────── project library ─────────────
const safeName = title =>
  String(title || 'tour')
    .replace(/[\\\/:*?"<>|]+/g, '_')
    .trim() || 'tour';
function closeLib() {
  const m = $('libm');
  if (!m || m.hidden) return;
  m.hidden = true;
  $('lib').focus();
}
function setProject(id, d) {
  if (project !== d) revokeProject(project);
  projectId = id;
  project = d;
  scenes = project.scenes;
  sphereMat.map = fadeMesh.material.map = null;
  for (const k in textures) {
    textures[k].dispose();
    delete textures[k];
  }
  resetHist();
  $('pdesc').value = project.desc || '';
  current = -1;
  selId = placing = null;
  mode = 'edit';
  dirtyScenes = new Set();
  audioDirty = false;
  storedSceneIds = new Set(scenes.map(s => s.id));
  editCount = 0;
  $('ptitle').value = project.title || '';
  $('auto').checked = !!project.auto;
  $('wk').checked = project.walk !== false;
  toast('');
  if (scenes.length) showScene(0);
  else {
    sphereMat.map = null;
    sphereMat.needsUpdate = true;
    buildHotspots();
    ui();
  }
}
async function openProject(id) {
  if (id == projectId) return;
  await flush();
  try {
    const d = await loadProject(id);
    if (d) {
      setProject(id, d);
      await dbOp('put', 'last', id);
    } else toast(t('msg.openFail'));
  } catch (e) {
    toast(t('msg.openFailStore'));
  }
}
async function newProject() {
  await flush();
  setProject(uid() + uid(), { v: SCHEMA, title: t('def.newProj'), scenes: [] });
  await flush();
  closeLib();
}
async function duplicateProject(id) {
  await flush();
  const d = await dbOp('get', 'p:' + id);
  if (!d) return;
  const nid = uid() + uid(),
    e = library.find(x => x.id == id) || {};
  try {
    for (const s of d.scenes || []) {
      const b = await dbOp('get', 'b:' + id + ':' + s.id).catch(() => null);
      if (b instanceof Blob) await dbOp('put', 'b:' + nid + ':' + s.id, b);
    }
    const a = await dbOp('get', 'a:' + id).catch(() => null);
    if (a instanceof Blob) await dbOp('put', 'a:' + nid, a);
    const n = JSON.parse(JSON.stringify(d));
    n.title = (d.title || '') + t('def.copySuffix');
    await dbOp('put', 'p:' + nid, n);
    library.push({ ...e, id: nid, title: n.title, t: Date.now() });
    await dbOp('put', 'idx', library);
    toast(t('msg.duplicated'));
  } catch (x) {
    saveFailed(x);
  }
}
async function deleteProject(id) {
  try {
    const d = await dbOp('get', 'p:' + id).catch(() => null);
    for (const s of d?.scenes || []) await dbOp('del', 'b:' + id + ':' + s.id).catch(() => {});
    await dbOp('del', 'a:' + id).catch(() => {});
    await dbOp('del', 'p:' + id);
    library = library.filter(x => x.id != id);
    await dbOp('put', 'idx', library);
  } catch (x) {
    saveFailed(x);
    return;
  }
  if (id == projectId) {
    projectId = null;
    clearTimeout(saveTimer);
    if (library.length) await openProject(library[0].id);
    else await newProject();
  }
}
const fmtDate = ms =>
  new Date(ms).toLocaleDateString(LANG == 'ar' ? 'ar-u-nu-latn' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
function renderLibrary() {
  const L = [...library].sort((a, b) => b.t - a.t);
  $('libg').innerHTML = L.length
    ? L.map(
        e =>
          `<div class="pc ${e.id == projectId ? 'on' : ''}" data-id="${esc(e.id)}">${e.th ? `<img src="${esc(e.th)}" alt="">` : '<div class="ph"></div>'}<div class="in"><b dir="auto">${esc(e.title)}</b><small>${esc(t('lib.scenes', { n: e.n || 0 }))} · ${fmtDate(e.t)}</small><div class="row"><button data-a="open">${esc(t(e.id == projectId ? 'lib.current' : 'lib.open'))}</button><button data-a="dup">${esc(t('lib.dup'))}</button></div><div class="row"><button data-a="exp">${esc(t('act.saveCopy'))}</button><button data-a="del" class="dng">${esc(t('act.delete'))}</button></div></div></div>`
      ).join('')
    : `<p>${esc(t('lib.empty'))}</p>`;
}
if (!EMBED) {
  $('lib').onclick = () => {
    renderLibrary();
    $('libm').hidden = false;
    $('libx').focus();
  };
  $('libx').onclick = closeLib;
  $('libn').onclick = newProject;
  $('libm').onclick = e => {
    if (e.target == $('libm')) closeLib();
  };
  addEventListener('keydown', e => {
    if (e.key == 'Escape') closeLib();
  });
  addEventListener('visibilitychange', () => {
    if (document.hidden) flush();
  });
  $('libg').onclick = async ev => {
    const b = ev.target.closest('button');
    if (!b) return;
    const id = b.closest('.pc').dataset.id,
      a = b.dataset.a;
    if (a == 'open') {
      await openProject(id);
      closeLib();
      return;
    }
    if (a == 'dup') await duplicateProject(id);
    else if (a == 'exp') {
      await flush();
      toast(t('msg.preparing'), 60000);
      try {
        let out;
        if (id == projectId) out = await portableProject();
        else {
          const d = await loadProject(id);
          if (!d) throw new Error('missing');
          out = await toPortable(d);
          revokeProject(d);
        }
        saveFile(safeName(out.title) + '.json', JSON.stringify(out), 'application/json');
        toast(t('msg.projFileSaved'));
      } catch (x) {
        toast(t('msg.projExpFail'));
      }
    } else if (a == 'del') {
      if (b.dataset.c != '1') {
        b.dataset.c = '1';
        b.textContent = t('act.confirmDel');
        setTimeout(() => {
          b.dataset.c = '';
          b.textContent = t('act.delete');
        }, 3000);
        return;
      }
      await deleteProject(id);
    }
    renderLibrary();
  };
}
// ───────────── walkthrough transition ─────────────
let worldTurn = 0,
  walking = false;
const Y_AXIS = new THREE.Vector3(0, 1, 0),
  ease = k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const fadeMesh = new THREE.Mesh(
  sphereGeo,
  new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthTest: false,
    depthWrite: false,
  })
);
fadeMesh.visible = false;
fadeMesh.renderOrder = 5;
const fadeGroup = new THREE.Group();
fadeGroup.add(fadeMesh);
scene3d.add(fadeGroup);
const setFov = v => {
  camera.fov = Math.max(25, v);
  camera.updateProjectionMatrix();
};
const animate = (ms, f) =>
  new Promise(r => {
    const start = performance.now(),
      step = n => {
        const k = Math.min(1, (n - start) / ms);
        f(k);
        k < 1 ? requestAnimationFrame(step) : r();
      };
    requestAnimationFrame(step);
  });
async function ensureTexture(s) {
  if (!textures[s.id]) {
    try {
      textures[s.id] = makeTexture(await loadImg(s.img));
    } catch (e) {
      return false;
    }
  }
  return true;
}
async function walkTo(i, h) {
  if (walking || i == current) return;
  const s = scenes[i],
    from = scenes[current];
  walking = true;
  $('pop').hidden = true;
  try {
    if (!(await ensureTexture(s))) {
      walking = false;
      return showScene(i);
    }
    if (!gyro) {
      const d = sphereToVec(h.u, h.v, 1).applyAxisAngle(Y_AXIS, world.rotation.y),
        ty = Math.atan2(-d.x, -d.z),
        tp = Math.max(-0.3, Math.min(0.3, Math.asin(d.y) * 0.6)),
        y0 = yaw,
        p0 = pitch,
        dy = Math.atan2(Math.sin(ty - y0), Math.cos(ty - y0));
      await animate(450, k => {
        k = ease(k);
        yaw = y0 + dy * k;
        pitch = p0 + (tp - p0) * k;
        setFov(fov - 8 * k);
      });
    }
    // Keep the visitor's compass heading when both scenes have a north set;
    // otherwise land on the next scene's start angle.
    const heading = worldTurn - yaw / (2 * PI),
      target = from.n != null && s.n != null ? s.n + (heading - from.n) : s.u0 || 0,
      nextTurn = target + yaw / (2 * PI);
    fadeGroup.rotation.y = 2 * PI * nextTurn + PI / 2;
    fadeMesh.material.map = textures[s.id];
    fadeMesh.material.needsUpdate = true;
    fadeMesh.material.opacity = 0;
    fadeMesh.visible = true;
    hotspotGroup.visible = false;
    await animate(650, k => {
      fadeMesh.material.opacity = ease(k);
      setFov(fov - 8 - 22 * k);
    });
    sphereMat.map = textures[s.id];
    sphereMat.needsUpdate = true;
    worldTurn = nextTurn;
    world.rotation.y = fadeGroup.rotation.y;
    current = i;
    selId = null;
    buildHotspots();
    hotspotGroup.visible = true;
    fadeMesh.visible = false;
    ui();
    await animate(550, k => setFov(fov - 30 * (1 - ease(k))));
  } finally {
    setFov(fov);
    fadeMesh.visible = false;
    hotspotGroup.visible = true;
    walking = false;
  }
}
$('wk').onchange = e => {
  project.walk = e.target.checked;
  save();
};
// ───────────── gyroscope ─────────────
let gyro = false,
  gyroReady = false,
  gyroNeedsCalib = false,
  gyroYawOffset = 0;
const gyroQuat = new THREE.Quaternion(),
  SCREEN_QUAT = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)),
  orientQuat = new THREE.Quaternion(),
  Z_AXIS = new THREE.Vector3(0, 0, 1),
  gyroEuler = new THREE.Euler(),
  gyroForward = new THREE.Vector3();
const gyroDirection = () => gyroForward.set(0, 0, -1).applyQuaternion(gyroQuat);
function calibrateGyro() {
  if (gyroReady) {
    const f = gyroDirection();
    gyroYawOffset = yaw - Math.atan2(-f.x, -f.z);
  }
}
function onOrientation(e) {
  if (e.alpha == null) return;
  const r = THREE.MathUtils.degToRad,
    o = r(screen.orientation?.angle ?? window.orientation ?? 0);
  gyroEuler.set(r(e.beta), r(e.alpha), -r(e.gamma), 'YXZ');
  gyroQuat
    .setFromEuler(gyroEuler)
    .multiply(SCREEN_QUAT)
    .multiply(orientQuat.setFromAxisAngle(Z_AXIS, -o));
  gyroReady = true;
  if (gyroNeedsCalib) {
    gyroNeedsCalib = false;
    calibrateGyro();
  }
}
const gyroNote = s => {
  $('gyt').textContent = s;
  setTimeout(() => {
    $('gyt').textContent = t('act.gyro');
  }, 2500);
};
function gyroOff() {
  gyro = false;
  removeEventListener('deviceorientation', onOrientation);
  $('gy').classList.remove('on');
}
if (window.DeviceOrientationEvent && navigator.maxTouchPoints > 0) $('gy').hidden = false;
$('gy').onclick = async () => {
  if (gyro) {
    gyroOff();
    return;
  }
  try {
    if (
      typeof DeviceOrientationEvent.requestPermission == 'function' &&
      (await DeviceOrientationEvent.requestPermission()) != 'granted'
    ) {
      gyroNote(t('msg.gyroDenied'));
      return;
    }
    gyroReady = false;
    gyroNeedsCalib = true;
    gyro = true;
    addEventListener('deviceorientation', onOrientation);
    $('gy').classList.add('on');
    setTimeout(() => {
      if (gyro && !gyroReady) {
        gyroOff();
        gyroNote(t('msg.gyroNA'));
      }
    }, 1500);
  } catch (e) {
    gyroOff();
    gyroNote(t('msg.gyroNA'));
  }
};
// ───────────── pointer interaction ─────────────
const raycaster = new THREE.Raycaster();
raycaster.camera = camera;
const hotspotAt = e => {
  const r = glCanvas.getBoundingClientRect();
  raycaster.setFromCamera(
    new THREE.Vector2(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    ),
    camera
  );
  const x = raycaster.intersectObjects(hotspotGroup.children, false);
  return x.length ? x[0].object.userData.h : null;
};
const pickXR = (o, d) => {
  raycaster.set(o, d);
  const x = raycaster.intersectObjects(
    vrPanel.visible ? [...hotspotGroup.children, vrPanelBody, vrPanelClose] : hotspotGroup.children,
    false
  );
  return x.length ? x[0].object : null;
};
function activate(h) {
  if (h.type == 'link') {
    const k = scenes.findIndex(s => s.id == h.to);
    if (k >= 0) project.walk !== false && !renderer.xr.isPresenting ? walkTo(k, h) : showScene(k);
  } else if (renderer.xr.isPresenting) showVrPanel(h);
  else {
    const p = $('pop');
    p.innerHTML =
      (h.label ? `<b dir="auto">${esc(h.label)}</b>` : '') +
      (h.text ? `<p dir="auto">${esc(h.text)}</p>` : '') +
      `<button>${esc(t('act.close'))}</button>`;
    p.hidden = false;
    p.querySelector('button').onclick = closePop;
    p.querySelector('button').focus({ preventScroll: true });
  }
}
function closePop() {
  const p = $('pop');
  if (p.hidden) return;
  const hadFocus = p.contains(document.activeElement);
  p.hidden = true;
  if (hadFocus) glCanvas.focus({ preventScroll: true });
}
addEventListener('keydown', e => {
  if (e.key == 'Escape') closePop();
});
glCanvas.addEventListener('pointerdown', e => {
  if (walking) return;
  if (mode == 'edit' && !placing) {
    const h = hotspotAt(e);
    if (h) {
      hsDrag = {
        h,
        sp: hotspotGroup.children.find(c => c.userData.h === h),
        x: e.clientX,
        y: e.clientY,
        m: 0,
        moved: false,
      };
      selId = h.id;
      glCanvas.setPointerCapture(e.pointerId);
      return;
    }
  }
  drag = { x: e.clientX, y: e.clientY, m: 0 };
  glCanvas.setPointerCapture(e.pointerId);
  glCanvas.style.cursor = 'grabbing';
});
glCanvas.addEventListener('pointermove', e => {
  if (hsDrag) {
    hsDrag.m += Math.abs(e.clientX - hsDrag.x) + Math.abs(e.clientY - hsDrag.y);
    hsDrag.x = e.clientX;
    hsDrag.y = e.clientY;
    if (hsDrag.m >= 6 && hsDrag.sp) {
      hsDrag.moved = true;
      const r = glCanvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          -((e.clientY - r.top) / r.height) * 2 + 1
        ),
        camera
      );
      const p = vecToUV(raycaster.ray.direction);
      hsDrag.h.u = p.u;
      hsDrag.h.v = p.v;
      hsDrag.sp.position.copy(sphereToVec(p.u, p.v, 380));
      glCanvas.style.cursor = 'grabbing';
    }
    return;
  }
  if (drag) {
    const k = ((camera.fov / glCanvas.clientHeight) * PI) / 180,
      dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    if (gyro) gyroYawOffset += dx * k;
    else {
      yaw += dx * k;
      pitch = Math.max(-1.5, Math.min(1.5, pitch + dy * k));
    }
    drag.m += Math.abs(dx) + Math.abs(dy);
    drag.x = e.clientX;
    drag.y = e.clientY;
  } else {
    hovered = hotspotAt(e);
    glCanvas.style.cursor = placing ? 'crosshair' : hovered ? 'pointer' : 'grab';
  }
});
glCanvas.addEventListener('pointerup', e => {
  if (hsDrag) {
    const d = hsDrag;
    hsDrag = null;
    glCanvas.style.cursor = 'grab';
    if (d.moved) save();
    buildHotspots();
    ui();
    return;
  }
  const was = drag;
  drag = null;
  glCanvas.style.cursor = 'grab';
  if (!was || was.m >= 6) return;
  const h = hotspotAt(e);
  if (mode == 'view') {
    if (h) activate(h);
    return;
  }
  if (placing) {
    const p = vecToUV(raycaster.ray.direction);
    if (placing == 'move') Object.assign(selHotspot(), p);
    else {
      const o = scenes.find(s => s.id != scenes[current].id),
        n = {
          id: uid(),
          type: placing,
          label: '',
          text: '',
          to: placing == 'link' ? o?.id : undefined,
          shape: placing == 'info' ? 'info' : 'arrow',
          color: '#f59e0b',
          size: 1,
          ...p,
        };
      scenes[current].hs.push(n);
      selId = n.id;
    }
    placing = null;
    buildHotspots();
    ui();
    save();
    return;
  }
  selId = h ? h.id : null;
  buildHotspots();
  ui();
});
glCanvas.addEventListener(
  'wheel',
  e => {
    e.preventDefault();
    fov = Math.max(40, Math.min(95, fov + e.deltaY * 0.04));
    camera.fov = fov;
    camera.updateProjectionMatrix();
  },
  { passive: false }
);
// ───────────── webxr ─────────────
for (let i = 0; i < 2; i++) {
  const c = renderer.xr.getController(i);
  c.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -4)]),
      new THREE.LineBasicMaterial({ color: 0xffffff })
    )
  );
  c.addEventListener('selectstart', () => {
    const m = new THREE.Matrix4().extractRotation(c.matrixWorld),
      o = new THREE.Vector3().setFromMatrixPosition(c.matrixWorld),
      d = new THREE.Vector3(0, 0, -1).applyMatrix4(m),
      x = pickXR(o, d);
    if (x) {
      if (x.userData.vp) hideVrPanel();
      else activate(x.userData.h);
    }
  });
  scene3d.add(c);
}
if (navigator.xr)
  navigator.xr
    .isSessionSupported('immersive-vr')
    .then(ok => {
      if (ok) $('vr').hidden = false;
    })
    .catch(() => {});
$('vr').onclick = async () => {
  try {
    mode = 'view';
    ui();
    const s = await navigator.xr.requestSession('immersive-vr', {
      optionalFeatures: ['local', 'local-floor'],
    });
    await renderer.xr.setSession(s);
  } catch (e) {
    toast(t('msg.vrFail'));
  }
};
renderer.setAnimationLoop(time => {
  const dt = Math.min((time - lastFrame) / 1000, 0.1);
  lastFrame = time;
  const xr = renderer.xr.isPresenting;
  // An untextured MeshBasicMaterial renders white; hide it so the empty state stays readable.
  sphere.visible = !!sphereMat.map;
  if (!xr) {
    if (project.auto && mode == 'view' && !drag && !gyro) yaw -= dt * 0.08;
    if (gyro && gyroReady) {
      const f = gyroDirection();
      yaw = gyroYawOffset + Math.atan2(-f.x, -f.z);
      pitch = Math.asin(Math.max(-1, Math.min(1, f.y)));
    }
    camera.rotation.set(pitch, yaw, 0);
    const s = scenes[current];
    if (s && s.n != null)
      $('cg').setAttribute('transform', `rotate(${-(worldTurn - yaw / (2 * PI) - s.n) * 360})`);
  }
  let gz = null;
  if (xr) {
    const o = new THREE.Vector3(),
      d = new THREE.Vector3();
    camera.getWorldPosition(o);
    camera.getWorldDirection(d);
    gz = pickXR(o, d);
  }
  if (gz !== gazeTarget) {
    gazeTarget = gz;
    gazeTime = 0;
  }
  const hz = gz && gz.userData.h,
    need = hz && hz.type == 'info' ? 3 : 1.6;
  if (gz && (hz || gz === vrPanelClose)) {
    gazeTime += dt;
    if (gazeTime > need) {
      gazeTime = 0;
      gazeTarget = null;
      hz ? activate(hz) : hideVrPanel();
    }
  }
  // Hotspots are sized against the stage height so they stay easy to hit on a phone
  // without dominating a large monitor. In a headset the world-space size applies.
  const fit = xr ? 1 : Math.min(2.4, Math.max(0.9, 840 / (glCanvas.clientHeight || 600)));
  hotspotGroup.children.forEach(sp => {
    const h = sp.userData.h,
      k =
        fit *
        (h.size || 1) *
        (sp == gazeTarget || sp.userData.h == hovered ? 1.2 : 1) *
        (sp == gazeTarget ? 1 + (gazeTime / need) * 0.3 : 1);
    sp.scale.set(70 * k, 43.75 * k, 1);
  });
  renderer.render(scene3d, camera);
});
// ───────────── hotspot dragging, thumbnails ─────────────
let hsDrag = null,
  thumbsBusy = false;
glCanvas.addEventListener('pointercancel', () => {
  hsDrag = null;
  drag = null;
});
function sceneThumb(src) {
  const out = document.createElement('canvas');
  out.width = 160;
  out.height = 80;
  out.getContext('2d').drawImage(src, 0, 0, 160, 80);
  return out.toDataURL('image/jpeg', 0.6);
}
async function fillThumbs() {
  if (thumbsBusy || EMBED) return;
  thumbsBusy = true;
  let any = false;
  try {
    for (const s of scenes) {
      if (s.th) continue;
      s.th = sceneThumb(await loadImg(s.img, false));
      any = true;
      renderScenes();
    }
  } catch (e) {}
  thumbsBusy = false;
  if (any) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 400);
  }
}
// ───────────── vr info panel, preload, undo/redo, start screen ─────────────
const vrPanel = new THREE.Group();
vrPanel.visible = false;
scene3d.add(vrPanel);
const vrPanelBody = new THREE.Mesh(
  new THREE.PlaneGeometry(1.6, 1),
  new THREE.MeshBasicMaterial({ transparent: true, depthTest: false })
);
vrPanelBody.renderOrder = 20;
vrPanelBody.userData.vp = 1;
const vrPanelClose = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, 7);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(42, 42);
  ctx.lineTo(86, 86);
  ctx.moveTo(86, 42);
  ctx.lineTo(42, 86);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.encoding = THREE.sRGBEncoding;
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.1, 32),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false })
  );
  mesh.position.set(-0.7, 0.4, 0.01);
  mesh.renderOrder = 21;
  mesh.userData.vp = 1;
  return mesh;
})();
vrPanel.add(vrPanelBody, vrPanelClose);
const hideVrPanel = () => {
  vrPanel.visible = false;
};
function showVrPanel(h) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(18,20,26,.94)';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 8;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(8, 8, 1008, 624, 40);
  else ctx.rect(8, 8, 1008, 624);
  ctx.fill();
  ctx.stroke();
  const rtl = isRTL(),
    ax = rtl ? 960 : 64;
  ctx.direction = rtl ? 'rtl' : 'ltr';
  ctx.textAlign = rtl ? 'right' : 'left';
  ctx.fillStyle = '#fff';
  ctx.font = '700 56px system-ui,Tahoma,Arial';
  ctx.fillText(h.label || t('hs.info'), ax, 110, 780);
  ctx.font = '400 40px system-ui,Tahoma,Arial';
  ctx.fillStyle = '#e5e7eb';
  const lines = [];
  let l = '';
  for (const w of (h.text || '').split(/\s+/)) {
    const n = l ? l + ' ' + w : w;
    if (ctx.measureText(n).width > 900 && l) {
      lines.push(l);
      l = w;
    } else l = n;
  }
  if (l) lines.push(l);
  lines
    .slice(0, 8)
    .forEach((s, i) => ctx.fillText(i == 7 && lines.length > 8 ? s + '…' : s, ax, 190 + i * 54));
  const tex = new THREE.CanvasTexture(canvas);
  tex.encoding = THREE.sRGBEncoding;
  if (vrPanelBody.material.map) vrPanelBody.material.map.dispose();
  vrPanelBody.material.map = tex;
  vrPanelBody.material.needsUpdate = true;
  const o = new THREE.Vector3(),
    d = new THREE.Vector3();
  camera.getWorldPosition(o);
  camera.getWorldDirection(d);
  d.y = 0;
  if (d.lengthSq() < 1e-4) d.set(0, 0, -1);
  d.normalize();
  vrPanel.position.copy(o).addScaledVector(d, 2.2);
  vrPanel.position.y = o.y - 0.1;
  vrPanel.lookAt(o);
  vrPanel.visible = true;
}
renderer.xr.addEventListener('sessionend', hideVrPanel);
let busyCount = 0;
const busy = d => {
  busyCount += d;
  $('bar').hidden = busyCount <= 0;
};
function preload() {
  const s = scenes[current];
  if (!s) return;
  new Set((s.hs || []).filter(h => h.type == 'link').map(h => h.to)).forEach(id => {
    const target = scenes.find(x => x.id == id);
    if (target && !textures[target.id]) ensureTexture(target);
  });
}
let undoStack = [],
  undoPos = -1,
  snapTimer,
  restoring = false;
const sceneKey = () => JSON.stringify(scenes.map(s => ({ ...s, img: 0, th: 0, blob: 0 })));
const cloneScene = s => ({
  ...s,
  hs: JSON.parse(JSON.stringify(s.hs || [])),
  pp: s.pp && { ...s.pp },
});
function syncUndoButtons() {
  const u = $('undo'),
    r = $('redo');
  if (u) u.disabled = undoPos <= 0;
  if (r) r.disabled = undoPos >= undoStack.length - 1;
}
function snapshotNow() {
  clearTimeout(snapTimer);
  if (restoring || EMBED) return;
  const k = sceneKey();
  if (undoPos >= 0 && undoStack[undoPos].k == k) return;
  undoStack = undoStack.slice(0, undoPos + 1);
  undoStack.push({ k, s: scenes.map(cloneScene) });
  if (undoStack.length > 60) undoStack.shift();
  undoPos = undoStack.length - 1;
  syncUndoButtons();
}
const snapshot = () => {
  clearTimeout(snapTimer);
  snapTimer = setTimeout(snapshotNow, 500);
};
function resetHist() {
  clearTimeout(snapTimer);
  undoStack = [];
  undoPos = -1;
  snapshotNow();
}
function restoreSnapshot(i) {
  if (i < 0 || i >= undoStack.length) return;
  restoring = true;
  undoPos = i;
  const id = scenes[current]?.id;
  const oth = Object.fromEntries(scenes.map(s => [s.id, s.th]));
  project.scenes = scenes = undoStack[i].s.map(cloneScene);
  scenes.forEach(s => {
    if (!s.th && oth[s.id]) s.th = oth[s.id];
  });
  scenes.forEach(s => {
    if (s.blob && !storedSceneIds.has(s.id)) dirtyScenes.add(s.id);
  }); // a scene brought back by undo after its blob was deleted from storage
  current = scenes.findIndex(s => s.id == id);
  selId = null;
  placing = null;
  restoring = false;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 400);
  syncUndoButtons();
  if (current >= 0) {
    buildHotspots();
    ui();
  } else if (scenes.length) showScene(0);
  else {
    current = -1;
    sphereMat.map = null;
    sphereMat.needsUpdate = true;
    buildHotspots();
    ui();
  }
}
const undo = () => {
    snapshotNow();
    restoreSnapshot(undoPos - 1);
  },
  redo = () => {
    snapshotNow();
    restoreSnapshot(undoPos + 1);
  };
$('undo').onclick = undo;
$('redo').onclick = redo;
addEventListener('keydown', e => {
  if (EMBED || mode != 'edit' || !(e.ctrlKey || e.metaKey)) return;
  const tg = e.target.tagName;
  if (tg == 'INPUT' || tg == 'TEXTAREA' || tg == 'SELECT') return;
  const k = e.key.toLowerCase();
  if (k == 'z') {
    e.preventDefault();
    e.shiftKey ? redo() : undo();
  } else if (k == 'y') {
    e.preventDefault();
    redo();
  }
});
$('pdesc').oninput = e => {
  project.desc = e.target.value;
  save();
};
$('sgo').onclick = () => {
  $('start').hidden = true;
  startAudio();
};
// ───────────── nadir patch, audio, floor plan, embed code ─────────────
async function shrinkImage(f, max, type) {
  const im = await createImageBitmap(f),
    k = Math.min(1, max / Math.max(im.width, im.height)),
    canvas = document.createElement('canvas');
  canvas.width = Math.round(im.width * k);
  canvas.height = Math.round(im.height * k);
  canvas.getContext('2d').drawImage(im, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(type, 0.88);
}
let nadirMesh = null,
  nadirSrc = '',
  audioEl = null,
  audioSrc = '',
  muted = false,
  planOpen = false,
  placingPlan = false,
  planSrc = '';
function syncNadir() {
  const n = project.nadir;
  if (!n) {
    if (nadirMesh) {
      scene3d.remove(nadirMesh);
      nadirMesh = null;
    }
    nadirSrc = '';
    return;
  }
  if (nadirSrc != n.img) {
    nadirSrc = n.img;
    if (nadirMesh) {
      scene3d.remove(nadirMesh);
      nadirMesh = null;
    }
    const im = new Image();
    im.onload = () => {
      if (nadirSrc != n.img) return;
      const tex = new THREE.Texture(im);
      tex.encoding = THREE.sRGBEncoding;
      tex.needsUpdate = true;
      nadirMesh = new THREE.Mesh(
        new THREE.CircleGeometry(1, 48),
        new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          depthTest: false,
          depthWrite: false,
        })
      );
      nadirMesh.rotation.x = -PI / 2;
      nadirMesh.renderOrder = 3;
      scene3d.add(nadirMesh);
      syncNadir();
    };
    im.src = n.img;
    return;
  }
  if (nadirMesh) {
    const a = ((n.r || 25) * PI) / 180,
      rr = SPHERE_R * 0.97 * Math.sin(a);
    nadirMesh.scale.set(rr, rr, 1);
    nadirMesh.position.y = -SPHERE_R * 0.97 * Math.cos(a);
  }
}
function syncAudio() {
  const a = project.audio;
  if (!a) {
    if (audioEl) {
      audioEl.pause();
      audioEl = null;
      audioSrc = '';
    }
    return;
  }
  if (audioSrc != a.src) {
    if (audioEl) audioEl.pause();
    audioSrc = a.src;
    audioEl = new Audio(a.src);
    audioEl.loop = true;
    audioEl.volume = a.vol ?? 0.6;
  }
  $('mutei').setAttribute('href', muted ? '#i-mute' : '#i-volume');
  $('mute').setAttribute('aria-label', t(muted ? 'act.unmuteAria' : 'act.muteAria'));
}
function startAudio() {
  if (audioEl && !muted && audioEl.paused && mode == 'view') audioEl.play().catch(() => {});
}
function renderPlan() {
  const pl = project.plan;
  $('plan').hidden = !(pl && planOpen);
  if (!pl) return;
  if (planSrc != pl.img) {
    planSrc = pl.img;
    $('pimg').src = pl.img;
  }
  $('pdots').innerHTML = scenes
    .map((s, i) =>
      s.pp
        ? `<button class="pd ${i == current ? 'on' : ''}" data-i="${i}" style="left:${s.pp.x * 100}%;top:${s.pp.y * 100}%" title="${esc(s.name)}"></button>`
        : ''
    )
    .join('');
}
// Accepts only absolute http(s) URLs, so the snippet cannot carry a javascript: link.
const embedUrl = () => {
  try {
    const u = new URL((project.eurl || '').trim());
    return /^https?:$/.test(u.protocol) ? u.href : '';
  } catch (e) {
    return '';
  }
};
const embedCode = () => {
  const u = embedUrl();
  return u
    ? `<iframe src="${esc(u)}" width="100%" height="480" style="border:0" allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen" allowfullscreen loading="lazy"></iframe>`
    : '';
};
function syncExtras() {
  syncNadir();
  syncAudio();
  renderPlan();
  fillThumbs();
  $('mute').hidden = !project.audio;
  $('pbtn').hidden = !project.plan;
  if (document.activeElement != $('nsz')) $('nsz').value = project.nadir?.r || 25;
  if (document.activeElement != $('eurl')) $('eurl').value = project.eurl || '';
  $('ecode').value = embedCode();
  syncLogo();
  if (audioEl) {
    mode == 'view' ? startAudio() : audioEl.pause();
  }
}
addEventListener('pointerdown', startAudio);
$('mute').onclick = () => {
  muted = !muted;
  if (audioEl) {
    muted ? audioEl.pause() : startAudio();
  }
  syncAudio();
};
$('pbtn').onclick = () => {
  planOpen = !planOpen;
  renderPlan();
};
$('pdots').onclick = e => {
  const b = e.target.closest('button');
  if (b) showScene(+b.dataset.i);
};
$('pbox').onclick = e => {
  if (!placingPlan || e.target.closest('button')) return;
  const r = $('pimg').getBoundingClientRect(),
    c = v => Math.min(1, Math.max(0, v));
  scenes[current].pp = {
    x: c((e.clientX - r.left) / r.width),
    y: c((e.clientY - r.top) / r.height),
  };
  placingPlan = false;
  toast(t('msg.planSet'));
  save();
  renderPlan();
};
$('pset').onclick = () => {
  if (!project.plan) {
    toast(t('msg.planFirst'));
    return;
  }
  if (!scenes[current]) return;
  planOpen = true;
  placingPlan = true;
  renderPlan();
  toast(t('msg.planClick'));
};
$('nfile').onchange = async e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    project.nadir = { img: await shrinkImage(f, 512, 'image/png'), r: project.nadir?.r || 25 };
    save();
    syncExtras();
  } catch (x) {
    toast(t('msg.imgFail'));
  }
};
$('nrm').onclick = () => {
  delete project.nadir;
  save();
  syncExtras();
};
$('nsz').oninput = e => {
  if (project.nadir) {
    project.nadir.r = +e.target.value;
    save();
    syncNadir();
  }
};
$('afile').onchange = e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  if (f.size > 8e6) {
    toast(t('msg.audioBig'));
    return;
  }
  freeURL(project.audio?.src);
  project.audio = { src: objURL(f), blob: f, name: f.name, vol: 0.6 };
  audioDirty = true;
  save();
  syncExtras();
  toast(t('msg.audioAdded'));
};
$('arm').onclick = () => {
  freeURL(project.audio?.src);
  delete project.audio;
  audioDirty = true;
  save();
  syncExtras();
};
$('plfile').onchange = async e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    project.plan = { img: await shrinkImage(f, 1600, 'image/jpeg') };
    planOpen = true;
    save();
    syncExtras();
  } catch (x) {
    toast(t('msg.imgFail'));
  }
};
$('prm').onclick = () => {
  delete project.plan;
  scenes.forEach(s => delete s.pp);
  planOpen = false;
  save();
  syncExtras();
};
$('eurl').oninput = e => {
  project.eurl = e.target.value;
  save();
  $('ecode').value = embedCode();
};
$('ecopy').onclick = async () => {
  const v = $('ecode').value;
  if (!v) {
    toast(t((project.eurl || '').trim() ? 'msg.badUrl' : 'msg.urlFirst'));
    return;
  }
  try {
    await navigator.clipboard.writeText(v);
  } catch (x) {
    $('ecode').select();
    document.execCommand('copy');
  }
  toast(t('msg.copied'));
};
// ───────────── logo ─────────────
// A logo sits in a corner of the stage, over every scene, as a plain <img>: it stays sharp
// at any size and needs nothing from the 3D scene. Corners are physical (tl, tr, bl, br),
// so a tour looks the same whichever language it opens in. op is the opacity, ar the
// width-to-height ratio, and size sets how much of the screen the logo covers (see logoBox).
const LOGO_CORNERS = ['tl', 'tr', 'bl', 'br'],
  LOGO_MAX_PX = 800,
  LOGO_DEFAULT = { size: 14, op: 1 };
const cleanLogo = l => ({
  img: l.img,
  pos: LOGO_CORNERS.includes(l.pos) ? l.pos : 'tl',
  size: Math.min(40, Math.max(5, num(l.size, LOGO_DEFAULT.size))),
  op: Math.min(1, Math.max(0.2, num(l.op, LOGO_DEFAULT.op))),
  ar: Math.min(10, Math.max(0.1, num(l.ar, 1))),
});
// The logo's box for a frame of w × h pixels. size scales its area rather than its width,
// so a wide wordmark and a square mark at the same setting look equally heavy, and it is
// measured against the frame's geometric mean so a phone and a monitor both get a sensible
// size. Its short side is at least 18 px so a wide wordmark stays legible on a phone, and
// the box never takes more than 45% of the width or 30% of the height.
function logoBox(l, w, h, minSide = 18) {
  const side = (l.size / 100) * 0.6 * Math.sqrt(w * h),
    r = Math.sqrt(l.ar),
    grow = Math.max(1, minSide / Math.min(side * r, side / r));
  let bw = side * r * grow,
    bh = (side / r) * grow;
  const fit = Math.min(1, (w * 0.45) / bw, (h * 0.3) / bh);
  return [Math.round(bw * fit), Math.round(bh * fit)];
}
function sizeLogo() {
  const l = project.logo;
  if (!l) return;
  const stage = $('stage'),
    [w, h] = logoBox(l, stage.clientWidth, stage.clientHeight),
    img = $('logo');
  img.style.width = w + 'px';
  img.style.height = h + 'px';
  // The title row and the compass read these to make room for a logo at the top.
  stage.style.setProperty('--logo-w', w + 'px');
  stage.style.setProperty('--logo-h', h + 'px');
  if (EMBED) return;
  const frame = $('lpos'),
    // The preview keeps true proportions, so it skips the minimum size.
    [tw, th] = logoBox(l, frame.clientWidth, frame.clientHeight, 0);
  $('lthumb').style.width = tw + 'px';
  $('lthumb').style.height = th + 'px';
}
let logoSrc = '';
// Raster logos are decoded with createImageBitmap, which rejects a damaged file instead of
// drawing the part it could read, and re-encoded as PNG at up to 800 px on the long side so
// their transparency survives. SVG is stored as it is and stays sharp at every size.
async function readLogo(f) {
  if (f.type == 'image/svg+xml') {
    const url = objURL(f);
    try {
      const im = await loadImg(url, false),
        vb = (await f.text()).match(
          /viewBox\s*=\s*["']\s*[-\d.e]+[\s,]+[-\d.e]+[\s,]+([\d.e]+)[\s,]+([\d.e]+)/i
        ),
        // An SVG without width and height reports a default 300 × 150 size, so its
        // viewBox is the better source for the shape.
        ar =
          vb && +vb[1] > 0 && +vb[2] > 0
            ? +vb[1] / +vb[2]
            : im.naturalWidth && im.naturalHeight
              ? im.naturalWidth / im.naturalHeight
              : 1;
      return { img: await toDataURL(f), ar, opaque: false };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  const im = await createImageBitmap(f),
    w = im.width,
    h = im.height,
    k = Math.min(1, LOGO_MAX_PX / Math.max(w, h)),
    canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * k));
  canvas.height = Math.max(1, Math.round(h * k));
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
  im.close();
  const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data,
    alphaAt = (x, y) => px[(y * canvas.width + x) * 4 + 3];
  // An image with nothing visible in it cannot serve as a logo.
  let visible = false;
  for (let i = 3; i < px.length && !visible; i += 4) visible = px[i] > 8;
  if (!visible) throw new Error('empty');
  // Four solid corners almost always mean a background the user did not mean to keep.
  const x1 = canvas.width - 1,
    y1 = canvas.height - 1,
    opaque = [alphaAt(0, 0), alphaAt(x1, 0), alphaAt(0, y1), alphaAt(x1, y1)].every(a => a == 255);
  return { img: canvas.toDataURL('image/png'), ar: w / h, opaque };
}
// Places the stage logo and keeps the panel controls in step with project.logo.
function syncLogo() {
  const l = project.logo,
    img = $('logo'),
    stage = $('stage');
  LOGO_CORNERS.forEach(c => stage.classList.toggle('logo-' + c, !!l && l.pos == c));
  // Bottom corners sit above the scene bar when it is showing.
  stage.style.setProperty('--sb-h', $('sb').offsetHeight + 'px');
  img.hidden = !l;
  if (!l) {
    logoSrc = '';
    img.removeAttribute('src');
  } else {
    if (logoSrc != l.img) img.src = logoSrc = l.img;
    img.dataset.pos = l.pos;
    img.style.opacity = l.op;
    img.title = mode == 'edit' && !EMBED ? t('logo.dragTitle') : '';
  }
  if (EMBED) return sizeLogo();
  $('lctl').hidden = !l;
  $('lrm').disabled = !l;
  setText($('lupt'), t(l ? 'act.replaceLogo' : 'act.upLogo'));
  if (!l) return;
  const th = scenes[current]?.th;
  $('lpos').style.backgroundImage = th ? `url("${th}")` : '';
  $('lpos')
    .querySelectorAll('button')
    .forEach(b => b.setAttribute('aria-pressed', b.dataset.pos == l.pos));
  const thumb = $('lthumb');
  if (thumb.getAttribute('src') != l.img) thumb.src = l.img;
  thumb.dataset.pos = l.pos;
  thumb.style.opacity = l.op;
  if (document.activeElement != $('lsz')) $('lsz').value = l.size;
  if (document.activeElement != $('lop')) $('lop').value = Math.round(l.op * 100);
  $('lszv').value = l.size + '%';
  $('lopv').value = Math.round(l.op * 100) + '%';
  sizeLogo();
}
const logoResize = new ResizeObserver(sizeLogo);
logoResize.observe($('stage'));
logoResize.observe($('lpos'));
$('lfile').onchange = async e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  if (f.size > 5e6) {
    toast(t('msg.logoBig'));
    return;
  }
  try {
    const { img, ar, opaque } = await readLogo(f),
      prev = project.logo;
    project.logo = cleanLogo({
      img,
      ar,
      pos: prev?.pos ?? (isRTL() ? 'tr' : 'tl'),
      size: prev?.size,
      op: prev?.op,
    });
    save();
    syncExtras();
    toast(t(opaque ? 'msg.logoOpaque' : 'msg.logoAdded'), opaque ? 9000 : 6000);
  } catch (x) {
    toast(t('msg.imgFail'));
  }
};
$('lrm').onclick = () => {
  delete project.logo;
  save();
  syncExtras();
};
$('lpos').onclick = e => {
  const b = e.target.closest('button');
  if (b && project.logo) setLogoCorner(b.dataset.pos);
};
$('lsz').oninput = e => {
  if (!project.logo) return;
  project.logo.size = +e.target.value;
  save();
  syncLogo();
};
$('lop').oninput = e => {
  if (!project.logo) return;
  project.logo.op = +e.target.value / 100;
  save();
  syncLogo();
};
// Moves the logo to a corner. When from is the logo's rectangle before the move, it glides
// from there to its new place instead of jumping.
function setLogoCorner(pos, from) {
  const img = $('logo');
  project.logo.pos = pos;
  save();
  // Measure the new place with no transform and no transition running, then start from
  // the old place and let the CSS transition carry it home.
  img.style.transition = 'none';
  img.style.transform = '';
  syncLogo();
  if (from) {
    const to = img.getBoundingClientRect();
    img.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px)`;
  }
  img.getBoundingClientRect();
  img.style.transition = '';
  img.style.transform = '';
}
// The corner nearest to the logo's centre.
function nearestCorner() {
  const r = $('logo').getBoundingClientRect(),
    s = $('stage').getBoundingClientRect();
  return (
    (r.top + r.height / 2 < s.top + s.height / 2 ? 't' : 'b') +
    (r.left + r.width / 2 < s.left + s.width / 2 ? 'l' : 'r')
  );
}
// In the editor the logo can be dragged on the stage; it snaps to the nearest corner on
// release, and a dashed outline shows where it will land. A click opens its settings.
let logoDrag = null;
$('logo').addEventListener('pointerdown', e => {
  if (mode != 'edit' || EMBED || !project.logo || e.button > 0) return;
  e.preventDefault();
  logoDrag = { x: e.clientX, y: e.clientY, moved: false };
  try {
    $('logo').setPointerCapture(e.pointerId);
  } catch (x) {} // the pointer can already be gone, e.g. a touch that ended at once
});
$('logo').addEventListener('pointermove', e => {
  if (!logoDrag) return;
  const img = $('logo'),
    slot = $('logoslot'),
    dx = e.clientX - logoDrag.x,
    dy = e.clientY - logoDrag.y;
  if (!logoDrag.moved && Math.hypot(dx, dy) < 4) return;
  if (!logoDrag.moved) {
    logoDrag.moved = true;
    const r = img.getBoundingClientRect();
    slot.style.width = r.width + 'px';
    slot.style.height = r.height + 'px';
    img.classList.add('dragging');
    slot.hidden = false;
  }
  img.style.transform = `translate(${dx}px, ${dy}px)`;
  slot.dataset.pos = nearestCorner();
});
const endLogoDrag = (e, cancelled) => {
  if (!logoDrag) return;
  const { moved } = logoDrag,
    img = $('logo');
  logoDrag = null;
  $('logoslot').hidden = true;
  img.classList.remove('dragging');
  if (!moved) {
    if (!cancelled) {
      $('lsec').open = true;
      $('lsec').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    return;
  }
  if (cancelled) setLogoCorner(project.logo.pos, img.getBoundingClientRect());
  else setLogoCorner(nearestCorner(), img.getBoundingClientRect());
};
$('logo').addEventListener('pointerup', e => endLogoDrag(e, false));
$('logo').addEventListener('pointercancel', e => endLogoDrag(e, true));

// ───────────── toasts, pinch zoom, keyboard control, backup reminder ─────────────
// Auto-dismiss, after the duration the last toast() asked for.
(() => {
  const m = $('msg');
  if (!m) return;
  new MutationObserver(() => {
    clearTimeout(toastTimer);
    if (m.textContent)
      toastTimer = setTimeout(() => {
        m.textContent = '';
        toastMs = 5200;
      }, toastMs);
  }).observe(m, { childList: true, characterData: true, subtree: true });
})();

// Browser storage alone is not a safe home for someone's work.
let remindAt = 40;
function remind() {
  if (EMBED || editCount < remindAt) return;
  remindAt = editCount + 80;
  toast(t('msg.remind'), 9000);
}

// Only warn on unload when autosave is known to be broken.
addEventListener('beforeunload', e => {
  if (!EMBED && saveBroken) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// Pinch to zoom on touch screens. The wheel handler covers mice and trackpads.
const pointers = new Map();
let pinch = null;
glCanvas.addEventListener('pointerdown', e => {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size == 2) {
    const [a, b] = [...pointers.values()];
    drag = null;
    hsDrag = null;
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, f: fov };
  }
});
glCanvas.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && pointers.size == 2) {
    const [a, b] = [...pointers.values()],
      d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d > 0) {
      fov = Math.max(40, Math.min(95, (pinch.f * pinch.d) / d));
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }
});
const endPointer = e => {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
};
glCanvas.addEventListener('pointerup', endPointer);
glCanvas.addEventListener('pointercancel', endPointer);

// Keyboard control: arrow keys look around, + and − zoom.
glCanvas.tabIndex = 0;
glCanvas.setAttribute('role', 'application');
glCanvas.setAttribute('aria-label', t('aria.canvas'));
glCanvas.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const stp = 0.09;
  switch (e.key) {
    case 'ArrowRight':
      yaw -= stp;
      break;
    case 'ArrowLeft':
      yaw += stp;
      break;
    case 'ArrowUp':
      pitch = Math.min(1.5, pitch + stp);
      break;
    case 'ArrowDown':
      pitch = Math.max(-1.5, pitch - stp);
      break;
    case '+':
    case '=':
      fov = Math.max(40, fov - 5);
      camera.fov = fov;
      camera.updateProjectionMatrix();
      break;
    case '-':
    case '_':
      fov = Math.min(95, fov + 5);
      camera.fov = fov;
      camera.updateProjectionMatrix();
      break;
    default:
      return;
  }
  e.preventDefault();
});

// The compass is a div with role="button", so it needs Enter and Space by hand.
$('cmp')?.addEventListener('keydown', e => {
  if (e.key == 'Enter' || e.key == ' ') {
    e.preventDefault();
    $('cmp').click();
  }
});

// Remember which sections were left open.
if (!EMBED)
  document.querySelectorAll('details.gp').forEach((d, i) => {
    const k = 'vrt.sec.' + (d.id || i);
    try {
      const v = localStorage.getItem(k);
      if (v !== null) d.open = v == '1';
    } catch (e) {}
    d.addEventListener('toggle', () => {
      try {
        localStorage.setItem(k, d.open ? '1' : '0');
      } catch (e) {}
    });
  });

// Drop indicator while reordering scenes.
if (!EMBED) {
  const scn = $('scenes');
  scn.addEventListener('dragover', e => {
    const b = e.target.closest('.sth');
    scn.querySelectorAll('.sth.dz').forEach(x => x !== b && x.classList.remove('dz'));
    b && b.classList.add('dz');
  });
  const clr = () => scn.querySelectorAll('.sth.dz').forEach(x => x.classList.remove('dz'));
  scn.addEventListener('dragleave', clr);
  scn.addEventListener('drop', clr);
  scn.addEventListener('dragend', clr);
}

(async () => {
  if (!EMBED) {
    try {
      library = (await dbOp('get', 'idx')) || [];
      if (!library.length) {
        const old = await dbOp('get', 'p').catch(() => null); // single-project layout from a much older build
        if (old && Array.isArray(old.scenes)) {
          projectId = uid() + uid();
          for (const s of old.scenes)
            if (typeof s.img == 'string' && s.img.startsWith('data:')) {
              try {
                s.blob = dataToBlob(s.img);
                s.img = objURL(s.blob);
                dirtyScenes.add(s.id);
              } catch (e) {}
            }
          if (typeof old.audio?.src == 'string' && old.audio.src.startsWith('data:')) {
            try {
              old.audio.blob = dataToBlob(old.audio.src);
              old.audio.src = objURL(old.audio.blob);
              audioDirty = true;
            } catch (e) {
              delete old.audio;
            }
          }
          project = old;
          scenes = project.scenes;
          await flush();
          await dbOp('del', 'p').catch(() => {});
        }
      } else {
        const last = await dbOp('get', 'last').catch(() => null),
          id = library.some(x => x.id == last) ? last : library[0].id;
        const d = await loadProject(id);
        if (d) {
          projectId = id;
          project = d;
          scenes = project.scenes;
          storedSceneIds = new Set(scenes.map(s => s.id));
        }
      }
      if (!projectId) {
        projectId = uid() + uid();
        await flush();
      }
    } catch (e) {
      projectId = projectId || uid() + uid();
      toast(t('msg.noStorage'), 14000);
    }
  }
  $('ptitle').value = project.title;
  $('pdesc').value = project.desc || '';
  $('auto').checked = !!project.auto;
  $('wk').checked = project.walk !== false;
  resetHist();
  if (EMBED && scenes.length) {
    $('stt').textContent = project.title || '';
    $('std').textContent = project.desc || '';
    $('start').style.backgroundImage =
      `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.7)),url("${scenes[0].img}")`;
    $('sgo').disabled = true;
    $('sgo').textContent = t('view.loading');
    $('start').hidden = false;
  }
  ui();
  resize();
  if (scenes.length)
    showScene(0).then(() => {
      $('sgo').disabled = false;
      $('sgo').textContent = t('view.start');
    });
})();
