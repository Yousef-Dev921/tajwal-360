const $ = id => document.getElementById(id),
  PI = Math.PI,
  SPHERE_R = 500,
  SHELL = $('root').innerHTML;
const esc = s =>
  String(s ?? '').replace(
    /[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );
// A hotspot label can run over several lines; lists and titles show it on one.
const oneLine = s =>
  String(s ?? '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join(' ');
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
    'act.export': 'تصدير HTML',
    'act.exportTitle':
      'ملف HTML واحد يُفتح في أي مكان، حتى من الجهاز مباشرة. يناسب الجولات الصغيرة.',
    'act.exportZip': 'تصدير كمجلد (ZIP)',
    'act.exportZipTitle':
      'مجلد ملفات تنشره على استضافة ويب مثل GitHub Pages أو Netlify. يُفتح أسرع ويناسب الجولات الكبيرة.',
    'act.saveCopy': 'حفظ نسخة',
    'act.import': 'استيراد',
    'act.startAngle': 'زاوية البداية',
    'act.startAngleTitle': 'اجعل المنظر الحالي، بما فيه التكبير، بداية هذا المشهد',
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
    'f.autoSpeed': 'السرعة',
    'spd.slow': 'بطيئة',
    'spd.normal': 'عادية',
    'spd.fast': 'سريعة',
    'hint.autoReduced': 'معطّل لأن نظامك يطلب تقليل الحركة.',
    'opt.tr': 'الانتقال بين المشاهد',
    'tr.walk': 'مشي',
    'tr.fade': 'تلاشٍ',
    'tr.none': 'بلا انتقال',
    'opt.meta': 'إظهار تاريخ التصوير وموقعه',
    'opt.click': 'النقر في أي مكان للانتقال',
    'hint.click':
      'في الجولة، تنقل النقرة التي لا تصيب أي نقطة إلى نقطة الانتقال الأقرب إلى اتجاهها. تكبر تلك النقطة تحت المؤشر قبل النقر، فيرى الزائر إلى أين سيذهب.',
    'nav.bar': 'التنقّل بين المشاهد',
    'nav.all': 'كل المشاهد',
    'nav.gridAria': 'كل المشاهد. أنت في المشهد {i} من {n}',
    'nav.prev': 'المشهد السابق',
    'nav.next': 'المشهد التالي',
    'nav.filterPh': 'ابحث باسم المشهد',
    'nav.filterAria': 'تصفية المشاهد بالاسم',
    'nav.none': 'لا يوجد مشهد يطابق البحث.',
    'nav.matches': '{n} من {t}',
    'f.targetFind': 'ابحث عن الوجهة',
    'hint.meta':
      'يُقرأ التاريخ والموقع من بيانات الكاميرا داخل الصورة، ولا تتضمّنهما الجولة المصدَّرة إلا عند تفعيل هذا الخيار.',
    'opt.hd': 'الاحتفاظ بنسخة عالية الدقة (\u20668192\u2069 بكسل)',
    'hint.hd':
      'يسري على الصور التي تُضاف بعد تفعيله. تُحفظ لكل بانوراما أعرض من \u20664096\u2069 بكسل نسختان: حتى \u20668192\u2069 لأجهزة الكمبيوتر، و\u20664096\u2069 للهواتف والأجهزة اللوحية. يحمل التصدير كمجلد النسختين، أما ملف HTML فيحمل نسخة \u20664096\u2069 وحدها.',
    'f.hdScene': 'لهذا المشهد نسخة عالية الدقة تظهر على أجهزة الكمبيوتر.',
    'msg.hdLeft':
      'تُركت النسخ عالية الدقة خارج الملف لأنه كان سيتجاوز حجماً يمكن استيراده مرة أخرى، وبقيت في هذا المتصفح.',
    'msg.exportedHd':
      'يحمل الملف نسخ \u20664096\u2069 بكسل وحدها، فالنسخ عالية الدقة في التصدير كمجلد.',
    'f.captured': 'التُقطت:',
    'act.openMap': 'فتح الموقع على الخريطة',
    'act.planBig': 'تكبير المخطط',
    'act.planSmall': 'تصغير المخطط',
    'act.zoomIn': 'تكبير',
    'act.zoomOut': 'تصغير',
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
    'shape.none': 'نص فقط',
    'shape.spot': 'بقعة أرضية',
    'shape.img': 'أيقونة',
    'act.upIcon': 'رفع أيقونة خاصة',
    'msg.iconBig': 'حجم ملف الأيقونة أكبر من 2 ميجابايت. اختر ملفاً أصغر.',
    'f.level': 'تصحيح الميلان',
    'act.tiltCcw': 'تدوير عكس عقارب الساعة',
    'act.tiltCw': 'تدوير مع عقارب الساعة',
    'act.reset': 'إعادة الضبط',
    'hint.level':
      'انظر إلى خط عمودي في المشهد، كحافة باب أو عمود، ودوّر حتى يوازي الخطوط الإرشادية. كرّر ذلك بعد الالتفات ربع دورة. تبقى النقاط في أماكنها.',
    'sec.cover': 'صورة الغلاف',
    'hint.cover':
      'تظهر خلف عنوان الجولة في شاشة البداية، وفي مكتبة المشاريع. وجّه المشهد إلى المنظر الذي تريده ثم التقطه.',
    'act.coverSet': 'التقط المنظر الحالي',
    'msg.coverSet': 'أصبح المنظر الحالي صورة الغلاف.',
    'f.labelPh': 'اضغط Enter لبدء سطر جديد',
    'f.textSize': 'حجم النص',
    'f.labelBox': 'خلفية داكنة خلف النص',
    'f.rotation': 'اتجاه السهم',
    'f.keepSize': 'حجم ثابت على الشاشة عند التكبير',
    'f.labelPos': 'موضع العنوان',
    'lp.b': 'تحت الأيقونة',
    'lp.t': 'فوق الأيقونة',
    'lp.l': 'يسار الأيقونة',
    'lp.r': 'يمين الأيقونة',
    'f.labelHover': 'إظهار العنوان عند الإشارة إلى النقطة فقط',
    'hint.labelHover':
      'يبقى ظاهراً في المحرر. في الجولة يظهر عند مرور المؤشر، وعلى شاشات اللمس تُظهره اللمسة الأولى وتفتح الثانية النقطة.',
    'f.floor': 'ممدّدة على الأرض',
    'msg.floorClamp': 'نُقلت النقطة إلى ما تحت الأفق، فالنقطة الممدّدة على الأرض لا تعلوه.',
    'act.copy': 'نسخ',
    'act.copyTitle': 'انسخ النقطة لتلصقها في مشهد آخر (Ctrl+C)',
    'act.dup': 'تكرار',
    'act.dupTitle': 'أضف نسخة من النقطة بجانبها (Ctrl+D)',
    'act.paste': 'لصق النقطة',
    'act.pasteTitle': 'ألصق النقطة المنسوخة حيث تنظر (Ctrl+V)',
    'msg.hsCopied': 'نُسخت النقطة. انتقل إلى مشهد آخر واضغط «لصق النقطة» أو Ctrl+V لتظهر حيث تنظر.',
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
    'msg.exportBig':
      'سيبلغ حجم الملف نحو {mb} ميجابايت. الملف الواحد بهذا الحجم بطيء التحميل وقد يُغلق الصفحة على الهواتف، و«تصدير كمجلد (ZIP)» أنسب له. اضغط «تصدير HTML» مرة أخرى للمتابعة رغم ذلك.',
    'msg.zipProgress': 'جارٍ تجهيز المجلد… \u2066{p}%\u2069',
    'msg.zipDone':
      'نُزّلت الجولة كمجلد مضغوط ({mb} ميجابايت). فكّ الضغط وارفع المجلد إلى استضافة ويب، فهو لا يعمل عند فتحه من الجهاز مباشرة.',
    'msg.zipLimit':
      'الجولة أكبر من أن تُحفظ في ملف ZIP واحد، إذ تتجاوز 4 جيجابايت. قسّمها إلى مشروعين.',
    'view.fileProto':
      'هذه الجولة مجلد ملفات، ولا تعمل عند فتحها من الجهاز مباشرة لأن المتصفح يمنع عرض الصور من الملفات المحلية. ارفع المجلد كما هو إلى استضافة ويب مثل GitHub Pages أو Netlify، أو شغّل خادماً محلياً داخله بالأمر \u2066python3 -m http.server\u2069 ثم افتح \u2066http://localhost:8000\u2069',
    'zip.readme':
      'جولة افتراضية من Tajwal 360\n\nافتح index.html من خادم ويب، لا من الجهاز مباشرة، لأن المتصفح يمنع عرض الصور من الملفات المحلية.\n\nللنشر: ارفع هذا المجلد كما هو إلى أي استضافة ملفات ثابتة، مثل GitHub Pages أو Netlify أو Cloudflare Pages، مع الإبقاء على ترتيب المجلدات.\n\nللمعاينة على هذا الجهاز: افتح الطرفية داخل هذا المجلد وشغّل\n    python3 -m http.server 8000\nثم افتح http://localhost:8000 في المتصفح.',
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
    'msg.notPersisted':
      'تنبيه: قد يحذف هذا المتصفح المشاريع المحفوظة فيه، ويحذفها سفاري إذا مرّت 7 أيام من استخدامه دون فتح هذا الموقع. اضغط «حفظ نسخة» لتحتفظ بملف المشروع على جهازك.',
    'msg.planSet': 'حُدّد موقع المشهد على المخطط.',
    'msg.planFirst': 'ارفع صورة المخطط أولاً.',
    'msg.planClick':
      'اضغط على المخطط لتحديد موقع هذا المشهد. كبّر المخطط وحرّكه أولاً لتحديد أدق.',
    'msg.audioBig': 'حجم الملف الصوتي أكبر من 8 ميجابايت. اختر ملفاً أصغر.',
    'msg.audioAdded': 'أُضيفت الموسيقى.',
    'f.sceneAudio': 'صوت المشهد',
    'hint.sceneAudio':
      'يُشغَّل عند دخول الزائر هذا المشهد ويتوقف عند مغادرته، وتنخفض الموسيقى الخلفية أثناءه. الحد الأقصى 8 ميجابايت.',
    'f.loop': 'تكرار',
    'f.delay': 'التأخير قبل التشغيل',
    'f.sec': '{n} ث',
    'act.listen': 'استماع',
    'act.stop': 'إيقاف',
    'msg.sceneAudioAdded': 'أُضيف صوت المشهد.',
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
    'act.export': 'Export HTML',
    'act.exportTitle':
      'One HTML file that opens anywhere, even straight from disk. Best for small tours.',
    'act.exportZip': 'Export as folder (ZIP)',
    'act.exportZipTitle':
      'A folder of files to publish on a web host such as GitHub Pages or Netlify. Opens faster and suits large tours.',
    'act.saveCopy': 'Save a copy',
    'act.import': 'Import',
    'act.startAngle': 'Start angle',
    'act.startAngleTitle': 'Use the current view, zoom included, as this scene’s starting view',
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
    'f.autoSpeed': 'Speed',
    'spd.slow': 'Slow',
    'spd.normal': 'Normal',
    'spd.fast': 'Fast',
    'hint.autoReduced': 'Off because your system asks for reduced motion.',
    'opt.tr': 'Transition between scenes',
    'tr.walk': 'Walk',
    'tr.fade': 'Fade',
    'tr.none': 'None',
    'opt.meta': 'Show capture date and location',
    'opt.click': 'Click anywhere to move',
    'hint.click':
      'In the tour, a click that misses every hotspot takes the link hotspot nearest its direction. That hotspot grows under the pointer first, so visitors see where they will go.',
    'nav.bar': 'Scene navigation',
    'nav.all': 'All scenes',
    'nav.gridAria': 'All scenes. You are on scene {i} of {n}',
    'nav.prev': 'Previous scene',
    'nav.next': 'Next scene',
    'nav.filterPh': 'Search by scene name',
    'nav.filterAria': 'Filter scenes by name',
    'nav.none': 'No scene matches.',
    'nav.matches': '{n} of {t}',
    'f.targetFind': 'Find a destination',
    'hint.meta':
      'Both are read from the camera data in each photo. An exported tour includes them only while this is on.',
    'opt.hd': 'Keep high-resolution panoramas (8192 px)',
    'hint.hd':
      'Applies to images added from now on. Each panorama wider than 4096 px keeps two copies: up to 8192 px for desktops, and 4096 px for phones and tablets. The folder export carries both; the HTML file carries the 4096 px copy only.',
    'f.hdScene': 'This scene has a high-resolution copy, shown on desktops.',
    'msg.hdLeft':
      'The high-resolution copies were left out, since the file would be too large to import again; they stay in this browser.',
    'msg.exportedHd':
      'It carries the 4096 px copies only; the high-resolution ones are in the folder export.',
    'f.captured': 'Captured:',
    'act.openMap': 'Open this location on a map',
    'act.planBig': 'Enlarge plan',
    'act.planSmall': 'Shrink plan',
    'act.zoomIn': 'Zoom in',
    'act.zoomOut': 'Zoom out',
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
    'shape.none': 'Text only',
    'shape.spot': 'Floor spot',
    'shape.img': 'Icon',
    'act.upIcon': 'Upload your own icon',
    'msg.iconBig': 'The icon file is over 2 MB. Choose a smaller one.',
    'f.level': 'Level correction',
    'act.tiltCcw': 'Rotate anticlockwise',
    'act.tiltCw': 'Rotate clockwise',
    'act.reset': 'Reset',
    'hint.level':
      'Look at a vertical edge in the scene, such as a door frame or a column, and rotate until it runs parallel to the guide lines. Repeat after turning a quarter of the way round. Hotspots stay in place.',
    'sec.cover': 'Cover image',
    'hint.cover':
      'Shown behind the tour title on the start screen, and in the project library. Turn the scene to the view you want, then take it.',
    'act.coverSet': 'Use the current view',
    'msg.coverSet': 'The current view is now the cover image.',
    'f.labelPh': 'Press Enter to start a new line',
    'f.textSize': 'Text size',
    'f.labelBox': 'Dark background behind the text',
    'f.rotation': 'Arrow direction',
    'f.keepSize': 'Same size on screen when zooming',
    'f.labelPos': 'Label position',
    'lp.b': 'Below the icon',
    'lp.t': 'Above the icon',
    'lp.l': 'Left of the icon',
    'lp.r': 'Right of the icon',
    'f.labelHover': 'Show the label only on hover',
    'hint.labelHover':
      'Always shown in the editor. In the tour it appears under the pointer; on touch screens the first tap shows it and the second opens the hotspot.',
    'f.floor': 'Lie flat on the floor',
    'msg.floorClamp': 'Moved below the horizon: a hotspot lying on the floor can’t sit above it.',
    'act.copy': 'Copy',
    'act.copyTitle': 'Copy the hotspot to paste into another scene (Ctrl+C)',
    'act.dup': 'Duplicate',
    'act.dupTitle': 'Add a copy of the hotspot next to it (Ctrl+D)',
    'act.paste': 'Paste hotspot',
    'act.pasteTitle': 'Paste the copied hotspot where you are looking (Ctrl+V)',
    'msg.hsCopied':
      'Hotspot copied. Go to another scene and use “Paste hotspot” or Ctrl+V to place it where you are looking.',
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
    'msg.exportBig':
      'The file would be about {mb} MB. A single file this large loads slowly and can crash the page on phones, so “Export as folder (ZIP)” suits it better. Click “Export HTML” again to go ahead anyway.',
    'msg.zipProgress': 'Packing the folder… {p}%',
    'msg.zipDone':
      'Tour downloaded as a ZIP folder ({mb} MB). Unzip it and upload the folder to a web host; it doesn’t open straight from disk.',
    'msg.zipLimit':
      'This tour is too large for one ZIP file: it would pass 4 GB. Split it into two projects.',
    'view.fileProto':
      'This tour is a folder of files and doesn’t work when opened straight from disk, because browsers block panoramas loaded from local files. Upload the folder as it is to a web host such as GitHub Pages or Netlify, or run a local server inside it with python3 -m http.server and open http://localhost:8000',
    'zip.readme':
      'Tajwal 360 virtual tour\n\nOpen index.html from a web server, not straight from disk: browsers block panoramas loaded from local files.\n\nTo publish, upload this folder as it is to any static web host, such as GitHub Pages, Netlify or Cloudflare Pages. Keep the folder structure.\n\nTo preview on this computer, open a terminal in this folder and run\n    python3 -m http.server 8000\nthen open http://localhost:8000 in a browser.',
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
    'msg.notPersisted':
      'Note: this browser may clear the projects stored in it, and Safari does after 7 days of use without opening this site. Use “Save a copy” to keep the project file on your device.',
    'msg.planSet': 'Scene placed on the plan.',
    'msg.planFirst': 'Upload a floor plan first.',
    'msg.planClick': 'Click the plan to place this scene. Zoom and pan first for a precise spot.',
    'msg.audioBig': 'The audio file is over 8 MB. Choose a smaller one.',
    'msg.audioAdded': 'Music added.',
    'f.sceneAudio': 'Scene audio',
    'hint.sceneAudio':
      'Plays when the visitor enters this scene and stops when they leave; the background music is lowered meanwhile. 8 MB maximum.',
    'f.loop': 'Loop',
    'f.delay': 'Delay before playing',
    'f.sec': '{n} s',
    'act.listen': 'Listen',
    'act.stop': 'Stop',
    'msg.sceneAudioAdded': 'Scene audio added.',
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
// In an exported tour the script runs once the whole file has arrived, so the loading note
// shown during the download can go.
$('xload')?.remove();
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
// The default zoom, as the camera's vertical field of view in degrees; zoom runs from 40 to 95.
const FOV0 = 75,
  FOV_MIN = 40,
  FOV_MAX = 95;
let project = EMBED || { title: t('def.title'), scenes: [] },
  scenes = project.scenes,
  current = -1,
  selId = null,
  placing = null,
  mode = EMBED ? 'view' : 'edit',
  yaw = 0,
  pitch = 0,
  fov = FOV0,
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
    type = h.slice(5).split(';')[0] || 'application/octet-stream';
  // An imported SVG logo can be a URL-encoded data: URL rather than base64.
  if (!/;base64$/i.test(h)) return new Blob([decodeURIComponent(u.slice(i + 1))], { type });
  const bin = atob(u.slice(i + 1)),
    n = bin.length,
    a = new Uint8Array(n);
  for (let x = 0; x < n; x++) a[x] = bin.charCodeAt(x);
  return new Blob([a], { type });
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
  storedSnd = new Map(), // scene id → the clip Blob in storage
  audioDirty = false,
  planDirty = false,
  coverDirty = false,
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
const decodeImg = im =>
  new Promise(res => {
    const k = setTimeout(() => res(im), DECODE_TIMEOUT_MS),
      fin = () => {
        clearTimeout(k);
        res(im);
      };
    (im.decode ? im.decode() : Promise.resolve()).then(fin, fin);
  });
function loadImg(src, decode = true) {
  return new Promise((res, rej) => {
    const im = new Image();
    let started = false;
    const ready = () => {
      if (started) return;
      started = true;
      res(decode ? decodeImg(im) : im);
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
// A panorama takes width × height × 4 bytes of GPU memory, 32 MB at 4096 × 2048, and Safari
// on iOS reloads a page that holds much more than about 600 MB. Only the scenes most recently
// shown or preloaded stay resident, within a budget of pixels: eight 4096 panoramas, or four
// on a touch device. An 8192 panorama counts as four. Older ones are released and decoded
// again if revisited.
const TOUCH = navigator.maxTouchPoints > 0,
  PANO_PX = 4096 * 2048,
  TEX_BUDGET = (TOUCH ? 4 : 8) * PANO_PX;
let texOrder = [], // scene ids, least recently used first
  walkTarget = null;
const texLoads = {};
// A scene added with high resolution on has an 8192 copy (hd) beside its 4096 one (img).
// Desktops whose GPU takes an 8192 texture show it; phones and tablets never decode it.
const useHD = () => !TOUCH && renderer.capabilities.maxTextureSize >= 8192,
  sceneSrc = s => (s.hd && useHD() ? s.hd : s.img);
const texPx = k => {
  const im = textures[k]?.image;
  return im ? (im.naturalWidth || im.width) * (im.naturalHeight || im.height) : 0;
};
// What a scene costs in the budget: its texture if loaded, else the most it can take.
const sceneCost = s => texPx(s.id) || (s.hd && useHD() ? 4 : 1) * PANO_PX;
// Marks a scene's texture as just used, then releases the oldest ones over the budget. The
// current scene, a walk in progress and anything on screen are never released.
function useTexture(id) {
  texOrder = texOrder.filter(x => x != id);
  texOrder.push(id);
  let used = texOrder.reduce((n, k) => n + texPx(k), 0);
  for (let i = 0; used > TEX_BUDGET && i < texOrder.length; ) {
    const k = texOrder[i],
      tex = textures[k];
    if (
      k == id ||
      k == scenes[current]?.id ||
      k == walkTarget ||
      tex === sphereMat.map ||
      tex === fadeMesh.material.map
    ) {
      i++;
      continue;
    }
    used -= texPx(k);
    texOrder.splice(i, 1);
    tex?.dispose();
    delete textures[k];
  }
}
// Decoding holds a whole bitmap in memory, 32 MB at 4096 and 128 MB at 8192, so decodes take
// turns: one at a time on a touch device, two elsewhere. Only the decode waits its turn, not
// the download, so a slow file doesn't hold up the others. A scene the visitor is waiting
// for (urgent) goes to the front of the queue, ahead of preloads.
const DECODES = TOUCH ? 1 : 2,
  decodeQueue = [],
  urgentIds = new Set();
let decoding = 0;
const decodeTurn = id =>
  new Promise(r => {
    if (decoding < DECODES) {
      decoding++;
      r();
    } else decodeQueue[urgentIds.has(id) ? 'unshift' : 'push']({ id, r });
  });
function decodeDone() {
  const n = decodeQueue.shift();
  if (n) n.r();
  else decoding--;
}
// One decode per scene, however many callers ask for it at once.
function loadTexture(s, urgent) {
  if (textures[s.id]) {
    useTexture(s.id);
    return Promise.resolve(textures[s.id]);
  }
  if (urgent) {
    urgentIds.add(s.id);
    // Already queued as a preload: move it up.
    const i = decodeQueue.findIndex(x => x.id == s.id);
    if (i > 0) decodeQueue.unshift(...decodeQueue.splice(i, 1));
  }
  if (!texLoads[s.id]) {
    const p = loadImg(sceneSrc(s), false)
      .then(im =>
        decodeTurn(s.id)
          .then(() => decodeImg(im))
          .finally(decodeDone)
      )
      .then(im => {
        // Another project was opened meanwhile; a duplicate shares scene ids.
        if (texLoads[s.id] !== p) throw new Error('stale');
        textures[s.id] = makeTexture(im);
        useTexture(s.id);
        return textures[s.id];
      })
      .finally(() => {
        if (texLoads[s.id] === p) {
          delete texLoads[s.id];
          urgentIds.delete(s.id);
        }
      });
    texLoads[s.id] = p;
  }
  return texLoads[s.id];
}
function dropTexture(id) {
  if (sphereMat.map == textures[id]) sphereMat.map = null;
  textures[id]?.dispose();
  delete textures[id];
  texOrder = texOrder.filter(x => x != id);
}
async function libraryThumb(src) {
  try {
    const im = await loadImg(src, false);
    const c = document.createElement('canvas');
    c.width = 320;
    c.height = 160;
    // Cropped to fill: a 2:1 panorama fits as it is, a 16:9 cover loses a strip top and bottom.
    const w = im.naturalWidth,
      h = im.naturalHeight,
      k = Math.min(w / 320, h / 160);
    c.getContext('2d').drawImage(
      im,
      (w - 320 * k) / 2,
      (h - 160 * k) / 2,
      320 * k,
      160 * k,
      0,
      0,
      320,
      160
    );
    return c.toDataURL('image/jpeg', 0.7);
  } catch (e) {
    return null;
  }
}
// A scene clip's name and options, without its bytes.
const sndOpts = ({ src, blob, ...o }) => o;
// Project document without image bytes, so autosave stays a few KB per write.
function toDoc(Q) {
  const d = {
    ...Q,
    v: SCHEMA,
    // hd: 1 records that the scene has a high-resolution master under its own key.
    scenes: (Q.scenes || []).map(({ img, blob, hd, hdBlob, ...r }) => {
      // The scene's clip is stored under its own key too; the document keeps its options.
      if (r.snd) r.snd = sndOpts(r.snd);
      return hdBlob ? { ...r, hd: 1 } : r;
    }),
  };
  if (Q.audio) d.audio = { name: Q.audio.name, vol: Q.audio.vol };
  else delete d.audio;
  // The plan image is stored on its own; the document only records that there is one.
  if (Q.plan) d.plan = {};
  // So is the cover; its time tells the library when to redraw the project's thumbnail.
  if (Q.cover) d.cover = { t: Q.cover.t };
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
      if (s && s.hdBlob) await dbOp('put', 'h:' + id + ':' + sid, s.hdBlob);
      dirtyScenes.delete(sid);
    }
    // Taken now rather than cleared after the write: opening another project during the
    // await sets the flags for that project, and clearing them afterwards would lose them.
    const audio = audioDirty,
      plan = planDirty,
      cover = coverDirty;
    audioDirty = planDirty = coverDirty = false;
    try {
      if (audio) {
        if (Q.audio && Q.audio.blob) await dbOp('put', 'a:' + id, Q.audio.blob);
        else await dbOp('del', 'a:' + id).catch(() => {});
      }
      if (plan) {
        if (Q.plan && Q.plan.blob) await dbOp('put', 'pl:' + id, Q.plan.blob);
        else await dbOp('del', 'pl:' + id).catch(() => {});
      }
      if (cover) {
        if (Q.cover && Q.cover.blob) await dbOp('put', 'cv:' + id, Q.cover.blob);
        else await dbOp('del', 'cv:' + id).catch(() => {});
      }
    } catch (x) {
      // Not written: try again on the next save, if this is still the open project.
      if (id == projectId) {
        if (audio) audioDirty = true;
        if (plan) planDirty = true;
        if (cover) coverDirty = true;
      }
      throw x;
    }
    // Scene clips are written when they differ from what storage holds, which also covers
    // a clip that undo or redo brings back.
    const held = storedSnd;
    for (const s of Q.scenes) {
      const b = s.snd?.blob || null;
      if (b === (held.get(s.id) || null)) continue;
      if (b) await dbOp('put', 'sa:' + id + ':' + s.id, b);
      else await dbOp('del', 'sa:' + id + ':' + s.id).catch(() => {});
      b ? held.set(s.id, b) : held.delete(s.id);
    }
    await dbOp('put', 'p:' + id, toDoc(Q));
    const live = new Set(Q.scenes.map(s => s.id));
    for (const [sid] of held)
      if (!live.has(sid)) {
        await dbOp('del', 'sa:' + id + ':' + sid).catch(() => {});
        held.delete(sid);
      }
    for (const sid of storedSceneIds)
      if (!live.has(sid)) {
        await dbOp('del', 'b:' + id + ':' + sid).catch(() => {});
        await dbOp('del', 'h:' + id + ':' + sid).catch(() => {});
      }
    storedSceneIds = live;
    let e = library.find(x => x.id == id);
    if (!e) {
      e = { id };
      library.push(e);
    }
    e.title = Q.title || t('def.untitled');
    e.n = Q.scenes.length;
    e.t = Date.now();
    // The library shows the cover, or else the first scene.
    const f = Q.scenes[0],
      thid = Q.cover ? 'cv' + Q.cover.t : f?.id;
    if (!f) {
      e.th = null;
      e.thid = null;
    } else if (e.thid != thid) {
      e.thid = thid;
      e.th = Q.cover ? await libraryThumb(Q.cover.img) : f.th || (await libraryThumb(f.img));
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
// What loadProject() moved out of a legacy document and still has to write to storage.
// It is kept beside the document rather than in the dirty flags, because opening a project
// resets those flags, and a migration lost that way would drop the images on the next save.
const migrated = new WeakMap();
// Marks what a freshly loaded project still needs written, and starts tracking it.
function applyMigration(d) {
  const m = migrated.get(d);
  dirtyScenes = new Set(m?.scenes);
  audioDirty = !!m?.audio;
  planDirty = !!m?.plan;
  coverDirty = false;
}
// Load a project and rehydrate its images as blob: URLs.
// Projects stored in the pre-Blob format are migrated on read.
async function loadProject(id) {
  const doc = await dbOp('get', 'p:' + id);
  if (!doc) return null;
  const m = { scenes: [], audio: false, plan: false };
  migrated.set(doc, m);
  doc.scenes = Array.isArray(doc.scenes) ? doc.scenes : [];
  for (const s of doc.scenes) {
    if (typeof s.img == 'string' && s.img.startsWith('data:')) {
      // legacy inline data: URL
      try {
        s.blob = dataToBlob(s.img);
        s.img = objURL(s.blob);
        m.scenes.push(s.id);
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
    if (s.hd) {
      const b = s.img && (await dbOp('get', 'h:' + id + ':' + s.id).catch(() => null));
      if (b instanceof Blob) {
        s.hdBlob = b;
        s.hd = objURL(b);
      } else delete s.hd;
    }
    if (s.snd) {
      const b = s.img && (await dbOp('get', 'sa:' + id + ':' + s.id).catch(() => null));
      if (b instanceof Blob) s.snd = { ...s.snd, src: objURL(b), blob: b };
      else delete s.snd;
    }
    if (!Array.isArray(s.hs)) s.hs = [];
  }
  doc.scenes = doc.scenes.filter(s => s.img);
  if (doc.audio) {
    if (typeof doc.audio.src == 'string' && doc.audio.src.startsWith('data:')) {
      try {
        doc.audio.blob = dataToBlob(doc.audio.src);
        doc.audio.src = objURL(doc.audio.blob);
        m.audio = true;
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
  // Plans used to sit in the document as a data: URL, rewritten on every autosave.
  if (doc.plan) {
    if (isDataImage(doc.plan.img)) {
      try {
        doc.plan = { blob: dataToBlob(doc.plan.img) };
        doc.plan.img = objURL(doc.plan.blob);
        m.plan = true;
      } catch (e) {
        delete doc.plan;
      }
    } else {
      const b = await dbOp('get', 'pl:' + id).catch(() => null);
      if (b instanceof Blob) doc.plan = { img: objURL(b), blob: b };
      else delete doc.plan;
    }
  }
  if (doc.cover) {
    const b = await dbOp('get', 'cv:' + id).catch(() => null);
    if (b instanceof Blob) doc.cover = { img: objURL(b), blob: b, t: num(doc.cover.t, 0) };
    else delete doc.cover;
  }
  return doc;
}
function revokeProject(Q) {
  (Q?.scenes || []).forEach(s => {
    freeURL(s.img);
    freeURL(s.hd);
    freeURL(s.snd?.src);
  });
  freeURL(Q?.audio?.src);
  freeURL(Q?.plan?.img);
  freeURL(Q?.cover?.img);
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
// world turns the scene to its start angle; level, inside it, holds the scene's level
// correction. The panorama and its hotspots both sit in level, so straightening a tilted
// photo carries the hotspots with it and they stay on what they point at.
const world = new THREE.Group(),
  level = new THREE.Group();
scene3d.add(world);
world.add(level);
const sphereGeo = new THREE.SphereGeometry(SPHERE_R, 64, 40);
sphereGeo.scale(-1, 1, 1);
const sphereMat = new THREE.MeshBasicMaterial(),
  sphere = new THREE.Mesh(sphereGeo, sphereMat);
level.add(sphere);
const hotspotGroup = new THREE.Group();
level.add(hotspotGroup);
const UP = new THREE.Vector3(0, 1, 0),
  NO_TILT = [0, 0, 0, 1],
  // The rotation from the panorama's own frame to the scene.
  sceneQuat = (q = new THREE.Quaternion()) =>
    q.setFromAxisAngle(UP, world.rotation.y).multiply(level.quaternion);
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
  d = d.clone().applyQuaternion(sceneQuat().invert()).normalize();
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
// The glyph on a filled icon (the arrow's chevron, the "i", the pin's eye) is white, or dark
// on a light fill such as white, where white would vanish. Relative luminance, WCAG formula.
function glyphInk(color) {
  const c = [1, 3, 5].map(i => {
    const v = parseInt(color.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] > 0.45 ? '#13131c' : '#fff';
}
function drawIcon(ctx, shape, color, flat) {
  const ink = glyphInk(color);
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
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(0, -18, 18, 0, 7);
    ctx.fill();
  } else if (shape == 'spot' && flat) {
    // The same marker seen from above, for a hotspot that lies on the floor: a disc in a soft
    // pool of light. The floor itself gives it its perspective.
    const g = ctx.createRadialGradient(0, 0, 56, 0, 0, 124);
    g.addColorStop(0, color + '99');
    g.addColorStop(1, color + '00');
    ctx.fillStyle = g;
    ctx.arc(0, 0, 124, 0, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 76, 0, 7);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, 7);
    ctx.lineWidth = 6;
    ctx.strokeStyle = ink;
    ctx.stroke();
  } else if (shape == 'spot') {
    // A marker lying on the floor, seen in perspective, with a soft beam rising from it.
    const g = ctx.createLinearGradient(0, 0, 0, -96);
    g.addColorStop(0, color + 'aa');
    g.addColorStop(1, color + '00');
    ctx.fillStyle = g;
    ctx.moveTo(-70, 0);
    ctx.lineTo(-58, -96);
    ctx.lineTo(58, -96);
    ctx.lineTo(70, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, 84, 30, 0, 0, 7);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, 44, 15, 0, 0, 7);
    ctx.lineWidth = 6;
    ctx.strokeStyle = ink;
    ctx.stroke();
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
    ctx.strokeStyle = ctx.fillStyle = ink;
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
// Breaks text into the lines the author typed, wrapping any line wider than max pixels at
// word boundaries. Trailing empty lines are dropped.
function wrapLines(ctx, text, max) {
  const lines = [];
  for (const para of String(text || '').split('\n')) {
    let l = '';
    for (const w of para.split(/\s+/).filter(Boolean)) {
      const n = l ? l + ' ' + w : w;
      if (ctx.measureText(n).width > max && l) {
        lines.push(l);
        l = w;
      } else l = n;
    }
    lines.push(l);
  }
  while (lines.length && !lines[lines.length - 1]) lines.pop();
  return lines;
}
// Custom icons are uploaded per project and kept as PNG, decoded once and drawn into every
// hotspot that uses them. A sprite drawn before its icon has decoded is redrawn when it has.
const ICON_MAX_PX = 256,
  ICON_MAX_CHARS = 6e5,
  ICON_BOX = 176,
  iconImgs = new Map(); // icon id → { src, im, ok }
const projectIcon = id => (project.icons || []).find(x => x.id == id);
function iconImage(id) {
  const ic = projectIcon(id);
  if (!ic) return null;
  let e = iconImgs.get(id);
  if (!e || e.src != ic.img) {
    e = { src: ic.img, im: new Image(), ok: false };
    iconImgs.set(id, e);
    e.im.onload = () => {
      e.ok = true;
      if (iconImgs.get(id) === e && scenes[current]?.hs.some(h => h.icon == id)) buildHotspots();
    };
    e.im.src = ic.img;
  }
  return e.ok ? e.im : null;
}
function drawCustomIcon(ctx, id) {
  const im = iconImage(id),
    ar = projectIcon(id)?.ar || 1;
  if (!im) {
    // Still decoding, or missing: a faint ring keeps the hotspot visible and clickable.
    ctx.strokeStyle = 'rgba(255,255,255,.6)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, 7);
    ctx.stroke();
    return;
  }
  const w = ar >= 1 ? ICON_BOX : ICON_BOX * ar,
    h = ar >= 1 ? ICON_BOX / ar : ICON_BOX;
  ctx.drawImage(im, -w / 2, -h / 2, w, h);
}
// Shapes that have a direction, and so a rotation.
const TURNS = ['arrow', 'img'];
// A hotspot is drawn on canvases at HS_PX canvas pixels per world unit: the icon in a 200 px
// box at the middle of a HS_ICON_CV px square, and the label on a canvas of its own, in up to
// HS_MAX_LINES lines of at most HS_LABEL_W px. Without a box the label gets a dark outline, so
// white text stays readable on a bright wall. The label is a sprite of its own so it can fade
// in on hover without redrawing anything, sit on any side of the icon while the hotspot stays
// anchored on the icon's centre, and stay upright when the icon lies on the floor. A text-only
// hotspot ('none') is its label alone, centred on the anchor.
const HS_PX = 512 / 70,
  HS_ICON = 200,
  HS_ICON_CV = 256,
  HS_LABEL_W = 900,
  HS_MAX_LINES = 6,
  HS_GAP = 16, // between the icon's box and the label's
  HS_M = 12, // around the label's box, for its outline and the selection mark
  HS_R = 380;
// A hotspot can lie on the floor as a decal: a flat square where the sprite would be, at HS_R
// on the hotspot's direction, level with the real floor (the level correction tilts the photo,
// not the floor). Seen from the centre, a disc there looks exactly like one on a floor at any
// depth, scaled with its distance, so its width matches the sprite's and lying down shortens
// it as perspective does; it is drawn FLOOR_K times larger to make up for that. Close to the
// horizon it would flatten to a line, so it is kept 5° below it.
const FLOOR_K = 1.33,
  FLOOR_SIN = Math.sin((5 * PI) / 180),
  FLOOR_GEO = new THREE.PlaneGeometry(1, 1);
const onFloor = h => !!h.fl && h.shape != 'none';
// Keeps a floor hotspot 5° below the horizon of a scene levelled by lq, the current scene's
// by default, moving it straight down to there if it is higher. Returns whether it had to
// move; with dry set it only says so. The horizon is the corrected one, which the decal lies
// against: on a photo tilted by more than 5°, the photo's own would let it rise above it.
const floorClamp = (h, lq = scenes[current]?.lq, dry) => {
  if (!onFloor(h)) return false;
  const q = new THREE.Quaternion().fromArray(lq || NO_TILT),
    d = sphereToVec(h.u, h.v, 1).applyQuaternion(q);
  if (d.y <= -FLOOR_SIN + 1e-9) return false;
  if (dry) return true;
  const k = Math.sqrt(1 - FLOOR_SIN * FLOOR_SIN) / (Math.hypot(d.x, d.z) || 1);
  if (!d.x && !d.z) d.x = 1; // straight up: any way down will do
  d.set(d.x * k, -FLOOR_SIN, d.z * k).applyQuaternion(q.invert());
  h.u = (Math.atan2(d.z, d.x) / (2 * PI) + 1) % 1;
  h.v = Math.acos(Math.max(-1, Math.min(1, d.y))) / PI;
  return true;
};
// A text-only hotspot is its own label, so it is always shown.
const hoverLabel = h => !!h.hov && h.shape != 'none';
const canvasTex = c => {
  const tex = new THREE.CanvasTexture(c);
  tex.encoding = THREE.sRGBEncoding;
  return tex;
};
function hotspotIcon(h, sel, flat) {
  const c = document.createElement('canvas'),
    ctx = c.getContext('2d');
  c.width = c.height = HS_ICON_CV;
  ctx.translate(HS_ICON_CV / 2, HS_ICON_CV / 2);
  if (sel) {
    ctx.setLineDash([14, 12]);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, 98, 0, 7);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // On the floor the decal itself turns, about the vertical.
  if (TURNS.includes(h.shape) && !flat) ctx.rotate(((h.rot || 0) * PI) / 180);
  if (h.shape == 'img') drawCustomIcon(ctx, h.icon);
  else drawIcon(ctx, h.shape, h.color, flat);
  return c;
}
function hotspotLabel(h, sel) {
  const icon = h.shape != 'none',
    // Without an icon, size alone scales the text.
    fs = Math.round(40 * (icon ? h.ts || 1 : 1)),
    lh = Math.round(fs * 1.3),
    font = `700 ${fs}px system-ui,Tahoma,Arial`,
    c = document.createElement('canvas'),
    ctx = c.getContext('2d');
  ctx.font = font;
  let lines = wrapLines(ctx, h.label, HS_LABEL_W);
  if (lines.length > HS_MAX_LINES)
    lines = [...lines.slice(0, HS_MAX_LINES - 1), lines[HS_MAX_LINES - 1] + '…'];
  // A text-only hotspot with no text yet still needs something to click and drag.
  if (!icon && !lines.length) lines = ['…'];
  if (!lines.length) return null;
  const pad = Math.round(fs * 0.5),
    tw = Math.min(HS_LABEL_W, Math.max(...lines.map(l => ctx.measureText(l).width))),
    bw = tw + pad * 2,
    bh = lines.length * lh + pad,
    // Beside the icon, the lines line up on the side that faces it.
    align = (icon && { l: 'right', r: 'left' }[h.lp]) || 'center';
  c.width = Math.ceil(bw + 2 * HS_M);
  c.height = Math.ceil(bh + 2 * HS_M);
  if (h.box !== false) {
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fillRect(HS_M, HS_M, bw, bh);
  }
  if (sel) {
    ctx.setLineDash([14, 12]);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(HS_M - 6, HS_M - 6, bw + 12, bh + 12);
    ctx.setLineDash([]);
  }
  const x = align == 'right' ? HS_M + bw - pad : align == 'left' ? HS_M + pad : c.width / 2;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(4, fs * 0.16);
  ctx.strokeStyle = 'rgba(0,0,0,.85)';
  ctx.fillStyle = '#fff';
  lines.forEach((l, i) => {
    const y = HS_M + pad / 2 + lh * (i + 0.5);
    ctx.direction = RTL_TEXT.test(l) ? 'rtl' : 'ltr';
    if (h.box === false) ctx.strokeText(l, x, y, HS_LABEL_W);
    ctx.fillText(l, x, y, HS_LABEL_W);
  });
  return c;
}
// The objects that show hotspot h: the icon sprite ic, or on the floor the decal dc with an
// invisible sprite ic over it that catches the pointer (a decal near the horizon is too thin
// to hit), and the label sprite lb. Sizes are in world units at scale 1; a is the label's
// opacity and g the hotspot's growth on hover, eased in the render loop.
function makeHotspotSprite(h) {
  const sel = mode == 'edit' && selId == h.id,
    e = { h, a: 1, g: h === hovered || h === peek?.h ? 1.2 : 1 };
  if (h.shape != 'none') {
    const tex = canvasTex(hotspotIcon(h, sel, onFloor(h)));
    if (onFloor(h)) {
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      e.dc = new THREE.Mesh(
        FLOOR_GEO,
        new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );
      e.dc.renderOrder = 9;
      e.ic = new THREE.Sprite(new THREE.SpriteMaterial());
      e.ic.visible = false;
    } else {
      e.ic = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true })
      );
      e.ic.renderOrder = 10;
    }
    e.iw = HS_ICON_CV / HS_PX;
  }
  const c = hotspotLabel(h, sel && h.shape == 'none');
  if (c) {
    e.lb = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: canvasTex(c), depthTest: false, transparent: true })
    );
    e.lb.renderOrder = 11;
    e.lW = c.width;
    e.lH = c.height;
    // A label shown on hover starts hidden in the tour, unless its hotspot is hovered or peeked.
    e.a = mode == 'view' && hoverLabel(h) && h !== hovered && h !== peek?.h ? 0 : 1;
  }
  return e;
}
// Where the label sits around the icon's centre, as the sprite's centre: below (the default),
// above, left or right, HS_GAP clear of the icon's box. The sides are physical, as on the
// photo, so a label set to clear a door frame stays clear of it in either language. vs shortens
// the box vertically, for a decal seen at an angle.
function placeLabel(e, vs) {
  const h = e.h,
    side = h.shape == 'none' ? '' : h.lp || 'b',
    hx = (HS_ICON / 2) * (e.dc ? FLOOR_K : 1),
    off = HS_GAP - HS_M;
  if (side == 'b') e.lb.center.set(0.5, 1 + (hx * vs + off) / e.lH);
  else if (side == 't') e.lb.center.set(0.5, -(hx * vs + off) / e.lH);
  else if (side == 'r') e.lb.center.set(-(hx + off) / e.lW, 0.5);
  else if (side == 'l') e.lb.center.set(1 + (hx + off) / e.lW, 0.5);
  else e.lb.center.set(0.5, 0.5);
}
// Lays decal e flat on the floor, whose up is the given direction in the panorama's frame. Its
// top edge faces away from the viewer, so an arrow at 0° points ahead along the floor and
// rot turns it clockwise as seen from above. Returns the sine of the angle below the horizon,
// by which it looks shortened.
const _fd = new THREE.Vector3(),
  _fr = new THREE.Vector3(),
  _fx = new THREE.Vector3(),
  _fm = new THREE.Matrix4();
function layDecal(e, up) {
  const h = e.h;
  _fd.copy(e.dc.position).normalize();
  const s = -_fd.dot(up);
  _fr.copy(_fd).addScaledVector(up, s);
  if (_fr.lengthSq() < 1e-8) _fr.set(1, 0, 0).addScaledVector(up, -up.x); // straight down
  _fr.normalize();
  if (TURNS.includes(h.shape) && h.rot) _fr.applyAxisAngle(up, (-h.rot * PI) / 180);
  _fx.crossVectors(_fr, up);
  e.dc.quaternion.setFromRotationMatrix(_fm.makeBasis(_fx, _fr, up));
  return Math.max(0, s);
}
const placeHotspot = e => {
  const p = sphereToVec(e.h.u, e.h.v, HS_R);
  [e.ic, e.dc, e.lb].forEach(o => o && o.position.copy(p));
};
// peek is the hotspot whose label a tap is showing on a touch screen, until a time.
const PEEK_MS = 4000,
  reduceMotion = matchMedia('(prefers-reduced-motion: reduce)'),
  floorUp = new THREE.Vector3(),
  floorQ = new THREE.Quaternion();
let hsParts = [],
  peek = null;
// The scene whose hotspots are on the panorama. showScene() moves current on at once but
// builds the next scene's hotspots only once its panorama has loaded.
let hotspotsOf = null;
function buildHotspots() {
  hotspotsOf = scenes[current]?.id;
  hotspotGroup.children.slice().forEach(c => {
    c.material.map?.dispose();
    c.material.dispose();
  });
  hotspotGroup.clear();
  gazeTarget = null;
  // A redraw, such as a custom icon finishing decoding, leaves a hovered hotspot hovered and a
  // peeked one peeked; a new scene starts with neither, and the editor has no peek.
  if (!scenes[current]?.hs.includes(hovered)) hovered = null;
  if (mode != 'view' || !scenes[current]?.hs.includes(peek?.h)) peek = null;
  hsParts = (scenes[current]?.hs || []).map(h => {
    const e = makeHotspotSprite(h);
    [e.dc, e.ic, e.lb].forEach(o => {
      if (!o) return;
      o.userData.h = h;
      o.userData.e = e;
      hotspotGroup.add(o);
    });
    placeHotspot(e);
    return e;
  });
  preload();
}
// ───────────── scene loading ─────────────
// o.fade cross-fades into the scene once its panorama is ready, over o.fade ms. o.via is the
// link hotspot taken from scene o.from: the camera then stays as it is and the scene turns to
// arrivalHeading(), as a walk would, instead of opening at its start view.
async function showScene(i, o = {}) {
  const s = scenes[i];
  if (!s) return;
  current = i;
  selId = null;
  placing = null;
  $('pop').hidden = true;
  hideVrPanel();
  // The last scene's clip stops now, not once this one has loaded.
  if (clip && clip.id != s.id) endClip();
  if (!textures[s.id]) {
    busy(1);
    try {
      await loadTexture(s, true);
    } catch (e) {
      busy(-1);
      if (scenes[i] === s) toast(t('msg.sceneFail'));
      return;
    }
    busy(-1);
  }
  // A walk begun meanwhile wins: it owns fadeMesh until it lands.
  if (current != i || walking) return;
  const ms = o.fade && !renderer.xr.isPresenting && sphereMat.map ? o.fade : 0,
    f = camera.fov;
  stopFade();
  if (ms) {
    // The panorama on screen goes on fadeMesh where it is now, and stays there as the view
    // below it moves to the new scene. Set before useTexture(), which never releases it.
    fadeMesh.material.map = sphereMat.map;
    fadeMesh.material.needsUpdate = true;
    fadeMesh.quaternion.copy(level.quaternion);
    fadeQ.copy(camera.quaternion).invert().multiply(world.quaternion);
  }
  useTexture(s.id);
  sphereMat.map = textures[s.id];
  sphereMat.needsUpdate = true;
  if (o.via) {
    worldTurn = arrivalHeading(o.from, s, o.via, worldTurn - yaw / (2 * PI)) + yaw / (2 * PI);
  } else {
    worldTurn = s.u0 || 0;
    yaw = 0;
    pitch = s.p0 || 0;
  }
  world.rotation.y = 2 * PI * worldTurn + PI / 2;
  level.quaternion.fromArray(s.lq || NO_TILT);
  fov = s.f0 || FOV0;
  camera.fov = fov;
  camera.updateProjectionMatrix();
  if (gyro) calibrateGyro();
  buildHotspots();
  ui();
  if (ms) crossFade(ms, f);
}
// ───────────── capture date and position ─────────────
// Panoramas are re-encoded on the way in, which drops their Exif block, so the capture
// date and GPS position are read from the original file first. Only JPEG carries them
// here; anything unreadable just yields nothing. Altitude is left out on purpose: camera
// GPS heights are rough and their datum varies, which would mislead anyone who relies on
// a level.
const EXIF_DATE = /^(\d{4}):(\d\d):(\d\d) (\d\d):(\d\d)(?::(\d\d))?/,
  TAKEN = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$/;
async function readCapture(f) {
  const out = {};
  let v, tiff;
  try {
    // Exif sits in an APP1 segment near the start; 1 MB covers the larger maker blocks.
    v = new DataView(await f.slice(0, 1 << 20).arrayBuffer());
    if (v.getUint16(0) != 0xffd8) return out;
    for (let p = 2; p + 10 <= v.byteLength; ) {
      const m = v.getUint16(p);
      if (m >> 8 != 0xff || m == 0xffda) break; // start of image data: no Exif
      if (m == 0xffe1 && v.getUint32(p + 4) == 0x45786966 && v.getUint16(p + 8) == 0) {
        tiff = p + 10;
        break;
      }
      p += 2 + v.getUint16(p + 2);
    }
  } catch (e) {}
  if (tiff == null || tiff + 8 > v.byteLength) return out;
  // Offsets inside the block are relative to its TIFF header, in its own byte order.
  const le = v.getUint16(tiff) == 0x4949,
    u16 = o => v.getUint16(tiff + o, le),
    u32 = o => v.getUint32(tiff + o, le),
    ifd = o => {
      const tags = new Map(),
        n = u16(o);
      for (let i = 0; i < n; i++) tags.set(u16(o + 2 + i * 12), o + 2 + i * 12);
      return tags;
    },
    // ASCII values of four bytes or fewer sit in the entry itself.
    ascii = e => {
      const n = Math.min(u32(e + 4), 64), // a damaged count must not run on
        at = n > 4 ? u32(e + 8) : e + 8;
      let s = '';
      for (let i = 0; i < n; i++) s += String.fromCharCode(v.getUint8(tiff + at + i));
      return s.replace(/\0[\s\S]*$/, '').trim();
    },
    rationals = e => {
      const at = u32(e + 8),
        r = [];
      for (let i = 0; i < Math.min(u32(e + 4), 3); i++)
        r.push(u32(at + i * 8) / u32(at + i * 8 + 4));
      return r;
    };
  let ifd0;
  try {
    ifd0 = ifd(u32(4));
  } catch (e) {
    return out;
  }
  try {
    const ex = ifd0.has(0x8769) ? ifd(u32(ifd0.get(0x8769) + 8)) : new Map(),
      e = ex.get(0x9003) ?? ifd0.get(0x0132), // DateTimeOriginal, else DateTime
      d = e != null && ascii(e).match(EXIF_DATE);
    if (d && +d[1] > 1990 && +d[2] >= 1 && +d[2] <= 12 && +d[3] >= 1 && +d[3] <= 31)
      out.taken = `${d[1]}-${d[2]}-${d[3]}T${d[4]}:${d[5]}:${d[6] || '00'}`;
  } catch (e) {}
  try {
    if (!ifd0.has(0x8825)) return out;
    const g = ifd(u32(ifd0.get(0x8825) + 8));
    if (![1, 2, 3, 4].every(k => g.has(k))) return out;
    const dms = (tag, ref, neg) => {
      const [a, b = 0, c = 0] = rationals(g.get(tag));
      return (a + b / 60 + c / 3600) * (ascii(g.get(ref)).toUpperCase() == neg ? -1 : 1);
    };
    // A void fix (status V) or the 0,0 that cameras write without a fix is not a position.
    if (g.has(9) && ascii(g.get(9)).toUpperCase() == 'V') return out;
    const lat = dms(2, 1, 'S'),
      lon = dms(4, 3, 'W');
    if (
      Number.isFinite(lat) &&
      Number.isFinite(lon) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lon) <= 180 &&
      (lat || lon)
    )
      out.gps = { lat: +lat.toFixed(7), lon: +lon.toFixed(7) };
  } catch (e) {}
  return out;
}
// Browsers can clear a site's storage: under disk pressure, and Safari after seven days of
// browsing without a visit. Persistent storage protects against the first where the browser
// grants it; when it isn't granted, or the browser can't be asked, the author is told once per
// session to keep a copy. Firefox asks the user, so this runs after images are added, not on
// page load.
let storageChecked = false;
async function storageKept() {
  if (storageChecked || EMBED) return true;
  storageChecked = true;
  try {
    return (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch (e) {
    return false;
  }
}
async function addFiles(files) {
  let first = -1;
  const flatNames = [],
    failedNames = [];
  for (const f of files) {
    // Some sources (a zip viewer, some Android apps) hand over a file with no type at all, so
    // an empty type is decoded like an image; anything that isn't one fails below.
    if (f.type && !f.type.startsWith('image/')) {
      failedNames.push(f.name);
      continue;
    }
    let hdBlob = null;
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
        // With high resolution on, a panorama wider than 4096 also keeps a master of up to
        // 8192, and the 4096 copy is drawn from that master: halving gives a cleaner result
        // than a single large step down. iOS refuses a canvas this size, so there the master
        // is skipped and the scene keeps its 4096 copy only.
        let src = im;
        if (project.hd && im.width > 4096) {
          const m = document.createElement('canvas'),
            k = Math.min(1, 8192 / im.width);
          m.width = Math.round(im.width * k);
          m.height = Math.round(im.height * k);
          const mx = m.getContext('2d');
          mx?.drawImage(im, 0, 0, m.width, m.height);
          // A browser over its canvas limit can hand back no context, or one that silently
          // draws nothing; a decoded photo is opaque, so a transparent middle gives it away.
          if (mx?.getImageData(m.width >> 1, m.height >> 1, 1, 1).data[3] == 255) {
            hdBlob = await canvasBlob(m, 'image/jpeg', 0.86);
            if (hdBlob) src = m;
          }
        }
        const k = Math.min(1, 4096 / im.width);
        canvas.width = Math.round(im.width * k);
        canvas.height = Math.round(im.height * k);
        ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
        if (src != im) src.width = src.height = 0; // let the 128 MB master go now
      }
      im.close();
      const blob = await canvasBlob(canvas, 'image/jpeg', 0.86),
        sid = uid();
      scenes.push({
        id: sid,
        name: f.name.replace(/\.[^.]+$/, ''),
        img: objURL(blob),
        blob,
        ...(hdBlob && { hd: objURL(hdBlob), hdBlob }),
        th: sceneThumb(canvas),
        u0: flat ? 0.5 : 0,
        p0: 0,
        hs: [],
        ...(await readCapture(f)),
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
  if (first >= 0 && !(await storageKept()))
    toast([...notes, t('msg.notPersisted')].join(' '), 14000);
}
// ───────────── ui ─────────────
const selHotspot = () => scenes[current]?.hs.find(h => h.id == selId);
// Up to MANY scenes, the tour's bar names every scene, so each is one tap away. A longer tour
// gets previous, next and the scene grid there instead: a strip of 143 names has to be
// scrolled to find where you are, and each name in it is a blurred glass button that a
// phone's GPU redraws every frame. The editor's scene list and its destination list get a
// search field from the same size.
const MANY = 12;
// Folds text for searching. Case, accents and Arabic diacritics (tashkeel, tatweel) are
// dropped; alef with hamza or madda becomes a plain alef, alef maqsura yaa and taa marbuta
// haa; Arabic-Indic digits become Latin. So "ايوان" finds "إيوان" and "12" finds "١٢". NFKD
// splits the hamza and madda off their letters and undoes presentation forms.
const fold = s =>
  String(s ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g, '')
    .replace(/\u0671/g, '\u0627')
    .replace(/\u0649/g, '\u064a')
    .replace(/\u0629/g, '\u0647')
    .replace(/[\u0660-\u0669\u06f0-\u06f9]/g, d => d.charCodeAt(0) % 16)
    .toLowerCase();
// A test for search q: every word of it must appear in the scene's name. A number on its own
// also finds the scene at that place in the tour, as the counter shows it.
function sceneMatcher(q) {
  const f = fold(q).trim(),
    w = f.split(/\s+/).filter(Boolean),
    n = /^\d+$/.test(f) ? +f : 0;
  return (s, i) => {
    const nm = fold(s.name);
    return w.every(x => nm.includes(x)) || i + 1 == n;
  };
}
// The editor's list is rebuilt only when its scenes or thumbnails change; a new name is
// written in place and the current scene just marked. With 150 scenes the list carries a few
// hundred KB of thumbnails, and this runs on every change in the editor.
let listShown = []; // [id, name, thumbnail] of each scene as #scenes shows it
function renderScenes() {
  const L = $('scenes'),
    rows = scenes.map(s => [s.id, s.name, s.th]),
    same =
      rows.length == listShown.length &&
      rows.every((r, i) => r[0] === listShown[i][0] && r[2] === listShown[i][2]);
  if (!same)
    L.innerHTML = scenes
      .map(
        (s, i) =>
          `<button data-i="${i}" draggable="true" class="sth" title="${esc(s.name)}">${s.th ? `<img src="${esc(s.th)}" alt="" draggable="false">` : '<span class="ph"></span>'}<span dir="auto">${esc(s.name)}</span></button>`
      )
      .join('');
  else
    rows.forEach((r, i) => {
      if (r[1] === listShown[i][1]) return;
      const b = L.children[i];
      b.title = r[1];
      b.lastChild.textContent = r[1];
    });
  listShown = rows;
  // Reordering still works while the list is filtered: each button keeps its place in the tour.
  const fq = $('sfilt'),
    many = scenes.length > MANY;
  fq.hidden = !many;
  if (!many) fq.value = '';
  const m = sceneMatcher(fq.value);
  let hits = 0;
  [...L.children].forEach((b, i) => {
    b.classList.toggle('on', i == current);
    b.hidden = !m(scenes[i], i);
    hits += !b.hidden;
  });
  $('snone').hidden = hits > 0 || !scenes.length;
  renderBar();
  $('title').textContent = scenes[current]?.name || '';
  $('title').hidden = !scenes[current];
  const sh = $('shint');
  if (sh) sh.hidden = scenes.length < 2;
}
// The tour's scene bar. It is rebuilt on every scene change, so the button that had focus
// gets it back, and a keyboard user can press Next again and again.
function renderBar() {
  const sb = $('sb'),
    n = scenes.length,
    i = current,
    f = sb.contains(document.activeElement) && document.activeElement,
    was = f && (f.dataset.a || f.dataset.i);
  if (n < 2) {
    sb.innerHTML = '';
    return;
  }
  const step = (k, dis) =>
      `<button data-a="${k}" class="sbn" title="${esc(t('nav.' + k))}" aria-label="${esc(t('nav.' + k))}"${dis ? ' disabled' : ''}><svg class="ic flip"><use href="#i-${k}"/></svg></button>`,
    grid = `<button data-a="grid" class="sbg" aria-haspopup="dialog" title="${esc(t('nav.all'))}" aria-label="${esc(t('nav.gridAria', { i: i + 1, n }))}"><svg class="ic"><use href="#i-grid"/></svg><span dir="ltr">${i + 1}/${n}</span></button>`;
  sb.innerHTML =
    n > MANY
      ? step('prev', i <= 0) + grid + step('next', i >= n - 1)
      : grid +
        scenes
          .map(
            (s, k) =>
              `<button data-i="${k}" class="${k == i ? 'on' : ''}" dir="auto">${esc(s.name)}</button>`
          )
          .join('');
  if (was) {
    const b = sb.querySelector(`[data-a="${was}"], [data-i="${was}"]`);
    (b && !b.disabled ? b : sb.querySelector('[data-a="grid"]')).focus({ preventScroll: true });
  }
  // Centre the active scene in the bar. scrollIntoView() would also scroll the page that
  // embeds a tour, so the bar is scrolled directly.
  const on = mode == 'view' && sb.querySelector('.on');
  if (on) {
    const a = on.getBoundingClientRect(),
      b = sb.getBoundingClientRect();
    sb.scrollLeft += a.left + a.width / 2 - (b.left + b.width / 2);
  }
}
function renderHotspotList() {
  $('hlist').innerHTML = (scenes[current]?.hs || [])
    .map(
      h =>
        `<button data-id="${esc(h.id)}" class="${h.id == selId ? 'on' : ''}">${h.type == 'link' ? '<svg class="ic flip"><use href="#i-link"/></svg>' : '<svg class="ic"><use href="#i-info"/></svg>'}<span dir="auto">${esc(oneLine(h.label) || t(h.type == 'link' ? 'hs.link' : 'hs.info'))}</span></button>`
    )
    .join('');
}
// The look of the last link and the last info hotspot the author styled. A new hotspot of
// the same kind starts from it, so a tour of many scenes needs its arrows styled only once.
// Held for the session only.
const LOOK = ['shape', 'icon', 'color', 'size', 'ts', 'box', 'fix', 'lp', 'hov', 'fl'],
  hsLook = { link: null, info: null };
const updateHotspot = o => {
  const h = selHotspot();
  Object.assign(h, o);
  hsLook[h.type] = Object.fromEntries(LOOK.filter(k => h[k] !== undefined).map(k => [k, h[k]]));
  buildHotspots();
  renderHotspotList();
  save();
};
const bind = (id, ev, f) => {
  const e = $(id);
  if (e) e.addEventListener(ev, f);
};
// A link's destinations: every other scene, in tour order. In a tour of more than MANY scenes
// a search field narrows them; the current destination stays in the list so it still shows.
let pickQ = '',
  pickFor = null;
function targetOptions(h) {
  const m = sceneMatcher(scenes.length > MANY ? pickQ : ''),
    here = scenes[current].id;
  let hits = 0;
  const o = scenes
    .map((s, i) => {
      if (s.id == here || (s.id != h.to && !m(s, i))) return '';
      hits += s.id != h.to;
      return `<option value="${esc(s.id)}" ${s.id == h.to ? 'selected' : ''}>${esc(s.name)}</option>`;
    })
    .join('');
  return hits ? o : o + `<option disabled>${esc(t('nav.none'))}</option>`;
}
function renderHotspotProps() {
  const h = selHotspot(),
    p = $('hprops');
  $('hint2').textContent = placing ? t('hint.clickPano') : '';
  if (!h) {
    p.innerHTML = '';
    return;
  }
  if (pickFor != h.id) {
    pickFor = h.id;
    pickQ = '';
  }
  const rng = (id, key, min, max, step, v, out) =>
    `<label id="${id}w"><span class="lrow"><span>${t(key)}</span><output id="${id}v" dir="ltr">${out}</output></span><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${esc(v)}"></label>`;
  p.innerHTML =
    `<label>${t('f.label')}<textarea id="pl" rows="2" dir="auto" placeholder="${esc(t('f.labelPh'))}">${esc(h.label)}</textarea></label>` +
    (h.type == 'link'
      ? `<div class="fld"><label for="pt">${t('f.target')}</label>${scenes.length > MANY ? `<input id="ptq" type="search" dir="auto" autocomplete="off" value="${esc(pickQ)}" placeholder="${esc(t('f.targetFind'))}" aria-label="${esc(t('f.targetFind'))}">` : ''}<select id="pt">${targetOptions(h)}</select></div>`
      : `<label>${t('f.text')}<textarea id="px" rows="3" dir="auto">${esc(h.text)}</textarea></label>`) +
    `<label>${t('f.shape')}<select id="ps">${SHAPES.filter(k => k != 'img')
      .map(
        k =>
          `<option value="${k}" ${k == h.shape ? 'selected' : ''}>${esc(t('shape.' + k))}</option>`
      )
      .join('')}${(project.icons || [])
      .map(
        ic =>
          `<option value="img:${esc(ic.id)}" ${h.shape == 'img' && h.icon == ic.id ? 'selected' : ''} dir="auto">${esc(ic.name || t('shape.img'))}</option>`
      )
      .join('')}</select></label>
  <label class="btn" for="pif"><svg class="ic"><use href="#i-image"/></svg><span>${t('act.upIcon')}</span></label><input id="pif" type="file" accept="image/png,image/webp,image/svg+xml,image/gif,image/jpeg" hidden>
  <label class="opt" id="pflw"><input type="checkbox" id="pfl" ${h.fl ? 'checked' : ''}><span>${t('f.floor')}</span></label>
  ${rng('pr', 'f.rotation', -180, 180, 5, h.rot || 0, (h.rot || 0) + '°')}
  <label id="pcw">${t('f.color')}<input id="pc" type="color" value="${esc(h.color)}"></label>
  ${rng('pz', 'f.size', 0.5, 2.5, 0.1, h.size, '×' + h.size)}
  <label class="opt"><input type="checkbox" id="pk" ${h.fix ? 'checked' : ''}><span>${t('f.keepSize')}</span></label>
  <label id="plpw">${t('f.labelPos')}<select id="plp">${['b', 't', 'l', 'r']
    .map(
      k =>
        `<option value="${k}" ${k == (h.lp || 'b') ? 'selected' : ''}>${esc(t('lp.' + k))}</option>`
    )
    .join('')}</select></label>
  ${rng('pf', 'f.textSize', 0.6, 2, 0.1, h.ts || 1, '×' + (h.ts || 1))}
  <label class="opt"><input type="checkbox" id="pb" ${h.box !== false ? 'checked' : ''}><span>${t('f.labelBox')}</span></label>
  <label class="opt" id="phvw"><input type="checkbox" id="phv" aria-describedby="phvh" ${h.hov ? 'checked' : ''}><span>${t('f.labelHover')}</span></label>
  <p id="phvh" class="hint">${t('hint.labelHover')}</p>
  <p id="hint3">${t('hint.dragHs')}</p>
  <div class="row"><button id="pdup" title="${esc(t('act.dupTitle'))}"><svg class="ic"><use href="#i-dup"/></svg><span>${t('act.dup')}</span></button><button id="pcopy" title="${esc(t('act.copyTitle'))}"><svg class="ic"><use href="#i-copy"/></svg><span>${t('act.copy')}</span></button></div>
  <button id="pd" class="dng">${t('act.delHs')}</button>`;
  // Only an arrow or a custom icon has a direction, neither a custom icon nor a text-only
  // hotspot takes a colour, and a text-only hotspot's size already sets its text size. A
  // text-only hotspot is its own label, so it can't lie down, and its label has no side and
  // can't hide.
  const fit = () => {
    const h = selHotspot(),
      s = h?.shape,
      none = s == 'none';
    $('prw').hidden = !TURNS.includes(s);
    $('pcw').hidden = none || s == 'img';
    $('pfw').hidden = $('pflw').hidden = $('plpw').hidden = $('phvw').hidden = none;
    $('phvh').hidden = none || !h?.hov;
    $('pfl').checked = !!h?.fl;
  };
  fit();
  bind('pl', 'input', e => updateHotspot({ label: e.target.value }));
  bind('pt', 'change', e => updateHotspot({ to: e.target.value }));
  bind('ptq', 'input', e => {
    pickQ = e.target.value;
    $('pt').innerHTML = targetOptions(selHotspot());
  });
  // Enter takes the first match.
  bind('ptq', 'keydown', e => {
    if (e.key != 'Enter') return;
    e.preventDefault();
    const m = sceneMatcher(pickQ),
      o = scenes.find((s, i) => s.id != scenes[current].id && m(s, i));
    if (o && o.id != selHotspot().to) {
      updateHotspot({ to: o.id });
      $('pt').innerHTML = targetOptions(selHotspot());
    }
  });
  bind('px', 'input', e => updateHotspot({ text: e.target.value }));
  bind('ps', 'change', e => {
    const v = e.target.value,
      h = selHotspot(),
      o = v.startsWith('img:') ? { shape: 'img', icon: v.slice(4) } : { shape: v, icon: undefined };
    // A floor spot is made to lie on the floor, so choosing one lays it down, unless that would
    // move it; the checkbox stands it up again.
    if (o.shape == 'none') o.fl = undefined;
    else if (
      o.shape == 'spot' &&
      h.shape != 'spot' &&
      !floorClamp({ ...h, ...o, fl: true }, undefined, 1)
    )
      o.fl = true;
    updateHotspot(o);
    fit();
  });
  bind('pfl', 'change', e => {
    const o = { ...selHotspot(), fl: e.target.checked || undefined },
      moved = floorClamp(o);
    updateHotspot({ fl: o.fl, u: o.u, v: o.v });
    if (moved) toast(t('msg.floorClamp'));
  });
  bind('plp', 'change', e =>
    updateHotspot({ lp: e.target.value == 'b' ? undefined : e.target.value })
  );
  bind('phv', 'change', e => {
    updateHotspot({ hov: e.target.checked || undefined });
    fit();
  });
  bind('pif', 'change', e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (f) addIcon(f);
  });
  bind('pc', 'input', e => updateHotspot({ color: e.target.value }));
  bind('pr', 'input', e => {
    updateHotspot({ rot: +e.target.value });
    $('prv').value = e.target.value + '°';
  });
  bind('pz', 'input', e => {
    updateHotspot({ size: +e.target.value });
    $('pzv').value = '×' + e.target.value;
  });
  bind('pf', 'input', e => {
    updateHotspot({ ts: +e.target.value });
    $('pfv').value = '×' + e.target.value;
  });
  bind('pb', 'change', e => updateHotspot({ box: e.target.checked }));
  bind('pk', 'change', e => updateHotspot({ fix: e.target.checked }));
  bind('pd', 'click', deleteHotspot);
  bind('pdup', 'click', duplicateHotspot);
  bind('pcopy', 'click', copyHotspot);
}
// ── custom icons ──
// Raster icons are re-encoded as PNG at up to ICON_MAX_PX, keeping transparency. SVG is drawn
// into a PNG once here too: a vector image drawn onto a canvas can stop that canvas being
// uploaded to the GPU in some browsers, and every hotspot is a canvas texture.
async function readIcon(f) {
  if (f.type != 'image/svg+xml') return readLogo(f, ICON_MAX_PX);
  const { img, ar } = await readLogo(f),
    im = await loadImg(img, false),
    c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(ar >= 1 ? ICON_MAX_PX : ICON_MAX_PX * ar));
  c.height = Math.max(1, Math.round(ar >= 1 ? ICON_MAX_PX / ar : ICON_MAX_PX));
  // An SVG with only a viewBox has no size of its own, which some browsers refuse to draw.
  im.width = c.width;
  im.height = c.height;
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  return { img: c.toDataURL('image/png'), ar };
}
// Adds an icon to the project, reusing an identical one already there, and gives it to the
// selected hotspot if that is still the one selected once the file has been read.
async function addIcon(f) {
  if (f.size > 2e6) {
    toast(t('msg.iconBig'));
    return;
  }
  const h = selHotspot();
  try {
    const { img, ar } = await readIcon(f),
      icons = project.icons || (project.icons = []);
    let ic = icons.find(x => x.img == img);
    if (!ic) {
      ic = {
        id: uid(),
        name: f.name.replace(/\.[^.]+$/, '').slice(0, 60),
        img,
        ar: +ar.toFixed(4),
      };
      icons.push(ic);
    }
    if (h && selHotspot() === h) updateHotspot({ shape: 'img', icon: ic.id });
    else save();
    renderHotspotProps();
  } catch (x) {
    toast(t('msg.imgFail'));
  }
}
// ── copy, paste, duplicate ──
// A copied hotspot keeps its look and text, so a styled arrow or a note can be repeated across
// a long tour. It is held in memory only, and survives switching scenes and projects.
let hsClip = null;
function deleteHotspot() {
  if (!selHotspot()) return;
  scenes[current].hs = scenes[current].hs.filter(x => x.id != selId);
  selId = null;
  buildHotspots();
  ui();
  save();
}
function copyHotspot() {
  const h = selHotspot();
  if (!h) return;
  // A custom icon travels with the copy, so it can be pasted into another project.
  const ic = h.shape == 'img' && projectIcon(h.icon);
  hsClip = { h: JSON.parse(JSON.stringify(h)), from: scenes[current].id, icon: ic && { ...ic } };
  syncPaste();
  toast(t('msg.hsCopied'));
}
// The direction the camera faces, in panorama coordinates.
function viewUV() {
  const d = new THREE.Vector3();
  camera.getWorldDirection(d);
  return vecToUV(d);
}
// Adds a copy of h to the current scene at p. A link can't lead to the scene it sits in: one
// pasted into its own destination leads back to the scene it was copied from, which is what
// a return arrow needs, and one whose destination is gone leads to the first other scene.
function addHotspotCopy(h, from, p, icon) {
  const s = scenes[current];
  if (!s) return;
  const n = { ...JSON.parse(JSON.stringify(h)), id: uid(), ...p },
    moved = floorClamp(n);
  if (n.shape == 'img' && !projectIcon(n.icon)) {
    if (icon) (project.icons || (project.icons = [])).push({ ...icon });
    else n.shape = 'arrow';
  }
  if (n.type == 'link') {
    const ok = id => id && id != s.id && scenes.some(x => x.id == id);
    if (!ok(n.to)) n.to = ok(from) ? from : scenes.find(x => x.id != s.id)?.id;
    if (!n.to) {
      toast(t('msg.needTwoScenes'));
      return;
    }
  }
  s.hs.push(n);
  selId = n.id;
  placing = null;
  buildHotspots();
  ui();
  save();
  if (moved) toast(t('msg.floorClamp'));
}
const pasteHotspot = () => hsClip && addHotspotCopy(hsClip.h, hsClip.from, viewUV(), hsClip.icon);
// The duplicate lands a little to one side, so it doesn't hide the original.
function duplicateHotspot() {
  const h = selHotspot();
  if (h) addHotspotCopy(h, scenes[current].id, { u: (h.u + 0.02) % 1, v: h.v });
}
function syncPaste() {
  $('hpaste').hidden = !hsClip;
}
$('hpaste').onclick = pasteHotspot;
// The capture time is the camera's local clock with no zone, so it is formatted as UTC to
// show exactly what the camera recorded.
function fmtTaken(s) {
  const [y, mo, d, h, mi] = s.split(/[-T:]/).map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, mi)).toLocaleString(
    LANG == 'ar' ? 'ar-u-nu-latn' : 'en-GB',
    {
      timeZone: 'UTC',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }
  );
}
const fmtGps = g => g.lat.toFixed(5) + ', ' + g.lon.toFixed(5);
const mapUrl = g => 'https://www.google.com/maps/search/?api=1&query=' + g.lat + ',' + g.lon;
// Capture date and position: under the title on the stage when the author shows them, and
// always as a note in the scene settings so the author knows what the photo carries.
function syncMeta() {
  const s = scenes[current],
    has = !!(s && (s.taken || s.gps));
  $('meta').hidden = !(project.meta && has);
  if (has) {
    $('mdate').textContent = s.taken ? fmtTaken(s.taken) : '';
    $('mdate').hidden = !s.taken;
    const a = $('mgps');
    a.hidden = !s.gps;
    if (s.gps) {
      a.textContent = fmtGps(s.gps);
      a.href = mapUrl(s.gps);
      a.title = t('act.openMap');
    } else a.removeAttribute('href');
  }
  if (EMBED) return;
  $('metaon').checked = !!project.meta;
  $('shd').hidden = !s?.hd;
  $('scap').hidden = !has;
  if (has)
    $('scap').textContent =
      t('f.captured') +
      ' ' +
      // The pair sits in a left-to-right isolate: in the Arabic interface the bidi algorithm
      // would otherwise show it as "lon, lat".
      [s.taken && fmtTaken(s.taken), s.gps && '⁦' + fmtGps(s.gps) + '⁩']
        .filter(Boolean)
        .join(' · ');
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
  syncMeta();
  syncLevel();
  syncExtras();
  setTimeout(resize, 0);
}
$('scenes').onclick = ev => {
  const b = ev.target.closest('button');
  if (b) showScene(+b.dataset.i);
};
$('sfilt').oninput = renderScenes;
// Previous and next follow the tour's order, which in a survey is usually the route walked
// on site. Like the grid, they jump rather than walk: neighbours in the list need not be
// neighbours in the building.
$('sb').onclick = ev => {
  const b = ev.target.closest('button');
  if (!b || walking) return;
  const a = b.dataset.a;
  if (a == 'grid') openGrid(b);
  else if (a) {
    const k = current + (a == 'next' ? 1 : -1);
    if (scenes[k]) jumpTo(k);
  } else jumpTo(+b.dataset.i);
};
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
  syncAuto();
};
// autoSpd multiplies the speed, 0.5 or 2; left out at 1.
$('asp').onchange = e => {
  const v = +e.target.value;
  if (v == 1) delete project.autoSpd;
  else project.autoSpd = v;
  save();
};
// ── auto-rotate ──
// It waits AUTO_IDLE ms after the visitor's last input, then eases up to speed over AUTO_RAMP
// ms. A mouse moving over the panorama counts as input, so a hotspot being aimed at does not
// slide away. Reduced motion keeps it off on this device, whatever the project says.
const AUTO_SPEED = 0.08, // radians a second
  AUTO_IDLE = 4000,
  AUTO_RAMP = 1000;
let autoAt = 0;
const autoStop = () => (autoAt = performance.now());
['pointerdown', 'keydown', 'wheel'].forEach(k =>
  addEventListener(k, autoStop, { capture: true, passive: true })
);
glCanvas.addEventListener('pointermove', autoStop, { passive: true });
// Held while anything is open over the panorama (the info popup, the scene grid, the start
// screen, the enlarged plan) and while a walk or the gyroscope moves the camera.
const autoHeld = () =>
  !project.auto ||
  mode != 'view' ||
  reduceMotion.matches ||
  !!drag ||
  gyro ||
  walking ||
  planBig ||
  !$('pop').hidden ||
  !$('sgm').hidden ||
  !$('start').hidden;
function syncAuto() {
  $('auto').checked = !!project.auto;
  $('asp').value = String(project.autoSpd || 1);
  $('aspw').hidden = !project.auto;
  $('autoh').hidden = !(project.auto && reduceMotion.matches);
}
// The system setting is followed live: the render loop and link activation read it each
// time, and the hint says when it is what keeps auto-rotate off.
reduceMotion.addEventListener?.('change', syncAuto);
$('hdon').onchange = e => {
  if (e.target.checked) project.hd = true;
  else delete project.hd;
  save();
};
// Left out of the project while off.
$('ca').onchange = e => {
  if (e.target.checked) project.click = true;
  else delete project.click;
  hovered = null;
  save();
};
$('metaon').onchange = e => {
  project.meta = e.target.checked;
  save();
  syncMeta();
};
$('sname').oninput = e => {
  scenes[current].name = e.target.value;
  renderScenes();
  save();
};
// The start view is the current one, zoom included. It is stored as the turn and pitch that
// showScene() will set, so it comes back exactly, however the scene is levelled.
$('sstart').onclick = () => {
  const s = scenes[current];
  s.u0 = (((worldTurn - yaw / (2 * PI)) % 1) + 1) % 1;
  s.p0 = pitch;
  if (Math.abs(fov - FOV0) > 0.5) s.f0 = Math.round(fov * 10) / 10;
  else delete s.f0;
  save();
  showScene(current);
  toast(t('msg.startSaved'));
};
// ── level correction ──
// A step turns the scene by LEVEL_STEP degrees about the direction the camera faces, laid flat
// on the horizon: a turn about a level axis tilts the scene without spinning it round.
// Straightening a vertical edge in front, then one a quarter turn away, levels the photo.
// The correction is stored per scene as a quaternion (lq) and left out when there is none.
const LEVEL_STEP = 0.25;
// How far a correction tips the vertical, in degrees.
const tiltOf = a =>
  (Math.acos(Math.min(1, UP.clone().applyQuaternion(new THREE.Quaternion().fromArray(a)).y)) *
    180) /
  PI;
function tiltScene(deg) {
  const s = scenes[current];
  if (!s) return;
  const axis = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).applyAxisAngle(
      UP,
      -world.rotation.y
    ),
    q = new THREE.Quaternion()
      .setFromAxisAngle(axis, (deg * PI) / 180)
      .multiply(level.quaternion)
      .normalize(),
    a = q.toArray().map(v => Math.round(v * 1e6) / 1e6);
  if (tiltOf(a) < 0.01) delete s.lq;
  else s.lq = a;
  showGuides();
  syncLevel();
  save();
}
function syncLevel() {
  const s = scenes[current];
  level.quaternion.fromArray(s?.lq || NO_TILT);
  if (EMBED) return;
  $('lvlv').value = (s?.lq ? tiltOf(s.lq) : 0).toFixed(2) + '°';
  $('lvl0').disabled = !s?.lq;
}
// Vertical guide lines over the panorama, shown for a moment after each step.
let guidesTimer;
function showGuides() {
  $('guides').hidden = false;
  clearTimeout(guidesTimer);
  guidesTimer = setTimeout(() => ($('guides').hidden = true), 2500);
}
// A press steps once; holding the button keeps stepping.
function repeatOnHold(b, f) {
  let timer = null,
    held = false;
  const stop = () => {
    clearTimeout(timer);
    clearInterval(timer);
    timer = null;
  };
  b.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    held = false;
    stop();
    timer = setTimeout(() => {
      held = true;
      timer = setInterval(f, 70);
    }, 400);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, stop));
  b.addEventListener('click', () => (held ? (held = false) : f()));
}
repeatOnHold($('lvlccw'), () => tiltScene(-LEVEL_STEP));
repeatOnHold($('lvlcw'), () => tiltScene(LEVEL_STEP));
$('lvl0').onclick = () => {
  delete scenes[current]?.lq;
  syncLevel();
  save();
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
  dropTexture(id);
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
  closeGrid();
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
// for saving a .json file. Never for storage. A published tour leaves out the capture date
// and position unless the author chose to show them, so they don't travel unseen.
// put(blob, name) decides how a file travels: as a data: URL by default, or, for the folder
// export, as a file in the ZIP whose relative path takes its place. name is a path without
// an extension, unique within the tour.
// A .json backup is one string, and browsers can't build or read one much past 500 MB. The
// high-resolution masters are the bulk of a large project, so they go into the file only
// while it stays under JSON_HD_MAX; otherwise the file keeps the 4096 copies and says so.
const JSON_HD_MAX = 300 * 1048576;
async function toPortable(Q, forTour, put) {
  const out = toDoc(Q),
    zip = !!put,
    hdBytes = (Q.scenes || []).reduce(
      (n, s) => n + (s.hdBlob?.size || 0) + (s.blob?.size || 0) + (s.snd?.blob?.size || 0),
      0
    ),
    withHd = zip || (!forTour && (hdBytes * 4) / 3 < JSON_HD_MAX),
    // Small images the document carries inline (icons, nadir, logo) become files too.
    inline = (u, name) => (zip ? put(dataToBlob(u), name) : u);
  put = put || toDataURL;
  out.scenes = [];
  for (const s of Q.scenes) {
    const { blob, hdBlob, hd, ...r } = s;
    if (forTour && !Q.meta) {
      delete r.taken;
      delete r.gps;
    }
    // The tour's scene grid loads thumbnails lazily, as files of their own.
    if (zip && r.th) r.th = await inline(r.th, 'thumbs/' + s.id);
    // The single file carries the 4096 copies only: at 8192 it would grow about fourfold.
    if (hdBlob && withHd) r.hd = await put(hdBlob, 'scenes/' + s.id + '-hd');
    if (r.snd)
      r.snd = {
        ...sndOpts(r.snd),
        src: r.snd.blob ? await put(r.snd.blob, 'audio/' + s.id, r.snd.name) : r.snd.src,
      };
    out.scenes.push({ ...r, img: blob ? await put(blob, 'scenes/' + s.id) : s.img });
  }
  if (Q.audio)
    out.audio = {
      name: Q.audio.name,
      vol: Q.audio.vol,
      src: Q.audio.blob ? await put(Q.audio.blob, 'audio/music', Q.audio.name) : Q.audio.src,
    };
  if (Q.plan) out.plan = { img: Q.plan.blob ? await put(Q.plan.blob, 'plan') : Q.plan.img };
  if (Q.cover) out.cover = { img: Q.cover.blob ? await put(Q.cover.blob, 'cover') : Q.cover.img };
  // The editor keeps every icon uploaded to a project; a file carries only those in use.
  const used = new Set(Q.scenes.flatMap(s => s.hs.filter(h => h.shape == 'img').map(h => h.icon)));
  out.icons = [];
  for (const ic of Q.icons || [])
    if (used.has(ic.id)) out.icons.push({ ...ic, img: await inline(ic.img, 'icons/' + ic.id) });
  if (!out.icons.length) delete out.icons;
  if (zip && Q.nadir) out.nadir = { ...Q.nadir, img: await inline(Q.nadir.img, 'nadir') };
  if (zip && Q.logo) out.logo = { ...Q.logo, img: await inline(Q.logo.img, 'logo') };
  if (forTour) delete out.hd; // an editor setting
  out.lang = LANG; // an exported tour renders in the language its author was using
  // Not a field of the file: tells the caller the masters were left out.
  if (!forTour && !withHd && Q.scenes.some(s => s.hdBlob))
    Object.defineProperty(out, 'hdLeft', { value: true });
  return out;
}
const portableProject = () => toPortable(project);
// What the single file would weigh: base64 grows every byte by a third, on top of about
// 750 KB of code. Past EXPORT_BIG_MB the author is pointed to the folder export first.
const EXPORT_BIG_MB = 100;
function exportEstimate() {
  let n = 0;
  for (const s of scenes) n += (s.blob?.size || 0) + (s.snd?.blob?.size || 0);
  n += (project.audio?.blob?.size || 0) + (project.plan?.blob?.size || 0);
  n += project.cover?.blob?.size || 0;
  return (n * 4) / 3 + 8e5;
}
let expArmed = 0;
$('exp').onclick = async () => {
  if (!scenes.length) {
    toast(t('msg.needOneScene'));
    return;
  }
  const mb = exportEstimate() / 1048576;
  // A large file takes a second click, once the author has read what it will weigh.
  if (mb > EXPORT_BIG_MB && Date.now() - expArmed > 15000) {
    expArmed = Date.now();
    toast(t('msg.exportBig', { mb: Math.round(mb) }), 15000);
    return;
  }
  expArmed = 0;
  toast(t('msg.preparing'), 60000);
  try {
    const [css, three, app, data] = await Promise.all([
      fetchText('style.css'),
      fetchText('vendor/three.min.js'),
      fetchText('app.js'),
      toPortable(project, true),
    ]);
    const html = `<!DOCTYPE html><html lang="${LANG}" dir="${isRTL() ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${EXPORT_CSP}"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(project.title)}</title><style>${css}</style><noscript><style>#xload{display:none}</style></noscript></head><body><div id="xload" role="status"><b dir="auto">${esc(project.title)}</b><i></i><span>${esc(t('view.loading'))}</span></div><div id="root" class="view">${SHELL}</div><script>${three}<\/script><script>window.__TOUR__=${JSON.stringify(data).replace(/</g, '\\u003c')};${app}<\/script></body></html>`;
    const bytes = saveFile(fileName('.html'), html, 'text/html');
    editCount = 0;
    const hdNote = scenes.some(s => s.hdBlob) ? ' ' + t('msg.exportedHd') : '';
    toast(t('msg.exported', { mb: (bytes / 1048576).toFixed(1) }) + hdNote, hdNote ? 9000 : 0);
  } catch (e) {
    toast(t('msg.exportFail'), 9000);
  }
};
// ───────────── folder (ZIP) export ─────────────
// The folder tour loads each panorama as its own file, so a large tour costs no more to open
// than the scenes a visitor actually sees, and nothing is inflated by base64. Layout:
//   index.html        the page, with its own content security policy
//   tour/             style.css, three.min.js, app.js (cached by the browser between visits)
//                     and data.js, the tour document, which sets window.__TOUR__ exactly as
//                     the single file does, so the viewer has one code path for both
//   scenes/, audio/, icons/, plan, cover, nadir, logo   the media, as binary files
// data.js is a script rather than JSON so the page needs no fetch() and no connect-src.
// file: lets the scripts run when the folder is opened from disk, whichever way a browser
// reads 'self' for a file, so the page can explain that it needs a web server; a hosted page
// can't load file: URLs anyway.
const ZIP_CSP =
  "default-src 'none'; script-src 'self' file:; style-src 'self' file: 'unsafe-inline'; " +
  "img-src 'self' data:; media-src 'self'; base-uri 'none'; form-action 'none'";
const FAVICON = document.querySelector('link[rel=icon]')?.getAttribute('href') || '';
// File extensions by type, so a static host serves each file with the right Content-Type.
const EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/webm': 'webm',
  'audio/flac': 'flac',
};
// A ZIP written by hand. Every entry is STORED, since JPEG and compressed audio don't shrink
// any further, with its CRC-32 and a UTF-8 name, followed by the central directory. The
// archive is a Blob made of the files' own Blobs between small headers: the browser can leave
// the images where they already are (on disk, for blobs read from IndexedDB) rather than
// copy them into one huge buffer, and the CRC is computed over 4 MB slices. Without ZIP64 an
// archive holds at most 65,535 entries and 4 GiB; a 143-scene tour at 8192 px comes to about
// 2 GB, so a tour past either limit is refused, before any file is read.
const CRC_TABLE = (() => {
  const T = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    T[n] = c;
  }
  return T;
})();
function crc32(a, c) {
  for (let i = 0, n = a.length; i < n; i++) c = CRC_TABLE[(c ^ a[i]) & 255] ^ (c >>> 8);
  return c;
}
const ZIP_SLICE = 4 << 20;
// files: [{ name, data: Blob or string }]. progress(done, total) runs after each file.
async function zipBlob(files, progress) {
  const enc = new TextEncoder(),
    items = files.map(f => ({
      name: enc.encode(f.name),
      b: f.data instanceof Blob ? f.data : new Blob([f.data]),
    })),
    total = items.reduce((n, x) => n + 30 + 46 + 2 * x.name.length + x.b.size, 22);
  if (items.length > 0xffff || total > 0xffffffff) throw new Error('zip-limit');
  const d = new Date(),
    time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
    parts = [],
    dir = [];
  let off = 0;
  for (let i = 0; i < items.length; i++) {
    const { name, b } = items[i];
    let c = 0xffffffff;
    for (let p = 0; p < b.size; p += ZIP_SLICE)
      c = crc32(new Uint8Array(await b.slice(p, p + ZIP_SLICE).arrayBuffer()), c);
    c = (c ^ 0xffffffff) >>> 0;
    // Local header, then the same fields again in the central directory.
    const L = new DataView(new ArrayBuffer(30)),
      C = new DataView(new ArrayBuffer(46)),
      common = (v, o) => {
        v.setUint16(o, 20, true); // version needed: 2.0
        v.setUint16(o + 2, 0x0800, true); // bit 11: the name is UTF-8
        v.setUint16(o + 4, 0, true); // method: STORE
        v.setUint16(o + 6, time, true);
        v.setUint16(o + 8, date, true);
        v.setUint32(o + 10, c, true);
        v.setUint32(o + 14, b.size, true);
        v.setUint32(o + 18, b.size, true);
        v.setUint16(o + 22, name.length, true);
      };
    L.setUint32(0, 0x04034b50, true);
    common(L, 4);
    C.setUint32(0, 0x02014b50, true);
    C.setUint16(4, 0x0314, true); // made by Unix, 2.0, so the mode below applies
    common(C, 6);
    C.setUint32(38, 0o100644 << 16, true); // a regular file, rw-r--r--
    C.setUint32(42, off, true);
    parts.push(L.buffer, name, b);
    dir.push(C.buffer, name);
    off += 30 + name.length + b.size;
    progress?.(i + 1, items.length);
  }
  const size = dir.reduce((n, x) => n + x.byteLength, 0),
    E = new DataView(new ArrayBuffer(22));
  E.setUint32(0, 0x06054b50, true);
  E.setUint16(8, items.length, true);
  E.setUint16(10, items.length, true);
  E.setUint32(12, size, true);
  E.setUint32(16, off, true);
  return new Blob([...parts, ...dir, E.buffer], { type: 'application/zip' });
}
// Builds the folder tour's file list and the page that loads it.
async function folderTour() {
  const files = [],
    taken = new Set(),
    put = (b, name, orig) => {
      // Ids from an imported file can hold anything, so a name keeps only safe characters,
      // at most 64 of them, and stays unique if two clean up the same way, case included,
      // since macOS and Windows don't tell File.jpg from file.jpg.
      const ext =
        EXT[(b.type || '').split(';')[0]] ||
        (/\.([a-z0-9]{2,5})$/i.exec(orig || '') || [])[1]?.toLowerCase() ||
        (name.startsWith('audio/') ? 'mp3' : 'jpg');
      const j = name.indexOf('/') + 1, // after the folder this file goes in
        id = name
          .slice(j)
          .replace(/[^\w-]/g, '_')
          .slice(0, 64),
        base = name.slice(0, j) + id;
      let path = base + '.' + ext;
      for (let k = 2; taken.has(path.toLowerCase()); k++) path = base + '-' + k + '.' + ext;
      taken.add(path.toLowerCase());
      files.push({ name: path, data: b });
      return path;
    };
  const [css, three, app, data] = await Promise.all([
      fetchText('style.css'),
      fetchText('vendor/three.min.js'),
      fetchText('app.js'),
      toPortable(project, true, put),
    ]),
    // A new query string on every export, so visitors don't keep last version's code.
    v = Date.now().toString(36),
    html = `<!DOCTYPE html><html lang="${LANG}" dir="${isRTL() ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${ZIP_CSP}"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(project.title)}</title><link rel="icon" href="${esc(FAVICON)}"><link rel="stylesheet" href="tour/style.css?v=${v}"><noscript><style>#xload{display:none}</style></noscript></head><body><div id="xload" role="status"><b dir="auto">${esc(project.title)}</b><i></i><span>${esc(t('view.loading'))}</span></div><div id="root" class="view">${SHELL}</div><script src="tour/three.min.js?v=${v}"><\/script><script src="tour/data.js?v=${v}"><\/script><script src="tour/app.js?v=${v}"><\/script></body></html>`;
  files.unshift(
    { name: 'index.html', data: html },
    { name: 'tour/style.css', data: css },
    { name: 'tour/three.min.js', data: three },
    { name: 'tour/app.js', data: app },
    {
      name: 'tour/data.js',
      data: `window.__TOUR__=${JSON.stringify(data).replace(/</g, '\\u003c')};`,
    },
    // Both languages, since whoever unpacks the folder may not read the tour's.
    { name: 'README.txt', data: I18N.en['zip.readme'] + '\n\n' + I18N.ar['zip.readme'] + '\n' },
    // GitHub Pages would otherwise run Jekyll, which drops files whose names start with _.
    { name: '.nojekyll', data: '' }
  );
  return files;
}
$('expz').onclick = async () => {
  if (!scenes.length) {
    toast(t('msg.needOneScene'));
    return;
  }
  toast(t('msg.preparing'), 600000);
  busy(1);
  try {
    let last = -1;
    const zip = await zipBlob(await folderTour(), (i, n) => {
        // In steps of ten, so a screen reader isn't read every file.
        const p = Math.floor((i / n) * 10) * 10;
        if (p != last) toast(t('msg.zipProgress', { p: (last = p) }), 600000);
      }),
      bytes = saveFile(fileName('.zip'), zip, 'application/zip');
    editCount = 0;
    toast(t('msg.zipDone', { mb: (bytes / 1048576).toFixed(1) }), 12000);
  } catch (e) {
    toast(t(e.message == 'zip-limit' ? 'msg.zipLimit' : 'msg.exportFail'), 12000);
  }
  busy(-1);
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
    const out = await portableProject();
    saveFile(fileName('.json'), JSON.stringify(out), 'application/json');
    editCount = 0;
    toast(t('msg.projSaved') + (out.hdLeft ? ' ' + t('msg.hdLeft') : ''), out.hdLeft ? 12000 : 0);
  } catch (x) {
    toast(t('msg.projSaveFail'));
  }
};
// An imported file is untrusted. Keep only well-formed fields with the expected types,
// so nothing unexpected reaches the markup or an exported tour.
const SHAPES = ['arrow', 'spot', 'ring', 'dot', 'pin', 'star', 'info', 'none', 'img'];
const num = (v, fallback) => (Number.isFinite(+v) && v !== null && v !== '' ? +v : fallback);
const clamp01 = v => Math.min(1, Math.max(0, v));
const isDataImage = v => typeof v == 'string' && v.startsWith('data:image/');
const cleanHotspot = h => {
  const out = {
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
  };
  // Optional, and left out at their defaults so older files and older builds match.
  const rot = (((Math.round(num(h.rot, 0)) % 360) + 540) % 360) - 180; // -180 to 179
  if (rot) out.rot = rot;
  const ts = Math.min(2, Math.max(0.6, num(h.ts, 1)));
  if (ts != 1) out.ts = ts;
  if (h.box === false) out.box = false;
  if (h.fix === true) out.fix = true;
  if (h.lp == 't' || h.lp == 'l' || h.lp == 'r') out.lp = h.lp;
  if (h.hov === true) out.hov = true;
  if (h.fl === true && out.shape != 'none') out.fl = true; // kept off the horizon by cleanScene
  // A custom icon is named by its id in the project's icon list; the import checks it exists.
  if (out.shape == 'img') {
    if (typeof h.icon == 'string' && h.icon) out.icon = h.icon;
    else out.shape = 'arrow';
  }
  return out;
};
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
  if (isDataImage(s.hd)) out.hd = s.hd;
  // A clip, as the editor takes it: audio, 8 MB at most, with a delay of up to 30 s.
  const a = s.snd;
  if (a && typeof a.src == 'string' && /^data:audio\//.test(a.src) && a.src.length < 1.1e7) {
    out.snd = { src: a.src, name: String(a.name ?? '').slice(0, 120) };
    if (a.loop === true) out.snd.loop = true;
    const dl = Math.round(Math.min(30, Math.max(0, num(a.delay, 0))));
    if (dl) out.snd.delay = dl;
  }
  if (s.n != null && Number.isFinite(+s.n)) out.n = +s.n;
  const f0 = num(s.f0, NaN);
  if (f0 >= FOV_MIN && f0 <= FOV_MAX) out.f0 = f0;
  if (Array.isArray(s.lq) && s.lq.length == 4 && s.lq.every(v => Number.isFinite(+v))) {
    const q = new THREE.Quaternion().fromArray(s.lq.map(Number));
    // A unit quaternion, give or take rounding; anything else would collapse the scene.
    if (Math.abs(q.length() - 1) < 0.01)
      out.lq = q
        .normalize()
        .toArray()
        .map(v => Math.round(v * 1e6) / 1e6);
  }
  out.hs.forEach(h => floorClamp(h, out.lq));
  if (s.pp && typeof s.pp == 'object')
    out.pp = { x: clamp01(num(s.pp.x, 0.5)), y: clamp01(num(s.pp.y, 0.5)) };
  if (typeof s.taken == 'string' && TAKEN.test(s.taken)) out.taken = s.taken;
  if (s.gps && typeof s.gps == 'object') {
    const lat = num(s.gps.lat, NaN),
      lon = num(s.gps.lon, NaN);
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) out.gps = { lat, lon };
  }
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
      ...(raw.walk !== false && raw.tr === 'fade' && { tr: 'fade' }),
      ...((raw.autoSpd === 0.5 || raw.autoSpd === 2) && { autoSpd: raw.autoSpd }),
      meta: !!raw.meta,
      ...(raw.hd === true && { hd: true }),
      ...(raw.click === true && { click: true }),
      eurl: typeof raw.eurl == 'string' ? raw.eurl : '',
      scenes: (Array.isArray(raw.scenes) ? raw.scenes : [])
        .filter(s => s && isDataImage(s.img))
        .map(cleanScene),
    };
    if (!d.scenes.length) throw new Error('empty');
    if (raw.nadir && isDataImage(raw.nadir.img))
      d.nadir = { img: raw.nadir.img, r: Math.min(50, Math.max(8, num(raw.nadir.r, 25))) };
    if (raw.plan && isDataImage(raw.plan.img)) d.plan = { img: raw.plan.img };
    if (raw.cover && isDataImage(raw.cover.img)) d.cover = { img: raw.cover.img, t: Date.now() };
    if (raw.logo && isDataImage(raw.logo.img)) d.logo = cleanLogo(raw.logo);
    const icons = (Array.isArray(raw.icons) ? raw.icons : [])
      // Only what readIcon() makes: a PNG of at most 256 px, a few hundred KB at most.
      .filter(
        ic =>
          ic &&
          typeof ic.id == 'string' &&
          ic.id &&
          typeof ic.img == 'string' &&
          ic.img.startsWith('data:image/png;') &&
          ic.img.length <= ICON_MAX_CHARS
      )
      .slice(0, 200)
      .map(ic => ({
        id: ic.id,
        name: String(ic.name ?? '').slice(0, 60),
        img: ic.img,
        ar: Math.min(10, Math.max(0.1, num(ic.ar, 1))),
      }));
    if (icons.length) d.icons = icons;
    for (const s of d.scenes)
      for (const h of s.hs)
        if (h.shape == 'img' && !icons.some(ic => ic.id == h.icon)) {
          h.shape = 'arrow';
          delete h.icon;
        }
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
      if (s.hd) {
        s.hdBlob = dataToBlob(s.hd);
        s.hd = objURL(s.hdBlob);
      }
      if (s.snd) {
        s.snd.blob = dataToBlob(s.snd.src);
        s.snd.src = objURL(s.snd.blob);
      }
    }
    if (d.audio) {
      d.audio.blob = dataToBlob(d.audio.src);
      d.audio.src = objURL(d.audio.blob);
    }
    if (d.plan) {
      d.plan.blob = dataToBlob(d.plan.img);
      d.plan.img = objURL(d.plan.blob);
    }
    if (d.cover) {
      d.cover.blob = dataToBlob(d.cover.img);
      d.cover.img = objURL(d.cover.blob);
    }
    d.title = d.title || t('def.imported');
    await flush();
    const nid = uid() + uid();
    setProject(nid, d);
    d.scenes.forEach(s => dirtyScenes.add(s.id));
    audioDirty = !!d.audio;
    planDirty = !!d.plan;
    coverDirty = !!d.cover;
    storedSceneIds = new Set();
    storedSnd = new Map();
    await flush();
    closeLib();
    toast(t('msg.imported'));
    if (!(await storageKept())) toast(t('msg.imported') + ' ' + t('msg.notPersisted'), 14000);
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
  stopFade();
  sphereMat.map = fadeMesh.material.map = null;
  for (const k in textures) dropTexture(k);
  for (const k in texLoads) delete texLoads[k];
  urgentIds.clear();
  resetHist();
  $('pdesc').value = project.desc || '';
  current = -1;
  selId = placing = null;
  placingPlan = false;
  setPlanBig(false);
  mode = 'edit';
  applyMigration(d);
  storedSceneIds = new Set(scenes.map(s => s.id));
  storedSnd = new Map(scenes.filter(s => s.snd).map(s => [s.id, s.snd.blob]));
  editCount = 0;
  $('ptitle').value = project.title || '';
  syncAuto();
  $('trn').value = transition();
  $('hdon').checked = !!project.hd;
  $('ca').checked = !!project.click;
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
      const h = s.hd && (await dbOp('get', 'h:' + id + ':' + s.id).catch(() => null));
      if (h instanceof Blob) await dbOp('put', 'h:' + nid + ':' + s.id, h);
      const sa = s.snd && (await dbOp('get', 'sa:' + id + ':' + s.id).catch(() => null));
      if (sa instanceof Blob) await dbOp('put', 'sa:' + nid + ':' + s.id, sa);
    }
    const a = await dbOp('get', 'a:' + id).catch(() => null);
    if (a instanceof Blob) await dbOp('put', 'a:' + nid, a);
    const pl = await dbOp('get', 'pl:' + id).catch(() => null);
    if (pl instanceof Blob) await dbOp('put', 'pl:' + nid, pl);
    const cv = await dbOp('get', 'cv:' + id).catch(() => null);
    if (cv instanceof Blob) await dbOp('put', 'cv:' + nid, cv);
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
    for (const s of d?.scenes || []) {
      await dbOp('del', 'b:' + id + ':' + s.id).catch(() => {});
      await dbOp('del', 'h:' + id + ':' + s.id).catch(() => {});
      await dbOp('del', 'sa:' + id + ':' + s.id).catch(() => {});
    }
    await dbOp('del', 'a:' + id).catch(() => {});
    await dbOp('del', 'pl:' + id).catch(() => {});
    await dbOp('del', 'cv:' + id).catch(() => {});
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
        toast(
          t('msg.projFileSaved') + (out.hdLeft ? ' ' + t('msg.hdLeft') : ''),
          out.hdLeft ? 12000 : 0
        );
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
// ───────────── scene grid ─────────────
// Every scene as a thumbnail over the whole stage, with a search field. It is how a visitor
// finds one scene among 150, and with previous and next in the bar it is how a keyboard
// reaches every scene, since the hotspots on the panorama can't take focus. The grid is one
// tab stop that the arrow keys move through. Choosing a scene jumps there without a walk.
let gridFrom = null;
const gridCells = () => [...$('sgl').children].filter(b => !b.hidden);
function openGrid(from) {
  const L = $('sgl');
  gridFrom = from;
  L.innerHTML = scenes
    .map(
      (s, i) =>
        `<button data-i="${i}" tabindex="-1"${i == current ? ' class="on" aria-current="true"' : ''}><span class="no" dir="ltr">${i + 1}</span>${s.th ? `<img src="${esc(s.th)}" alt="" loading="lazy" draggable="false">` : '<span class="ph"></span>'}<span class="nm" dir="auto">${esc(s.name)}</span></button>`
    )
    .join('');
  $('sgf').value = '';
  filterGrid();
  $('sgm').hidden = false;
  gridFocus(L.children[current] || L.firstElementChild, true);
}
function closeGrid() {
  if ($('sgm').hidden) return;
  $('sgm').hidden = true;
  $('sgl').innerHTML = '';
  // The bar may have been redrawn meanwhile; its grid button stands in for the one pressed.
  const f = gridFrom?.isConnected ? gridFrom : $('sb').querySelector('[data-a="grid"]');
  gridFrom = null;
  f?.focus({ preventScroll: true });
}
function pickGrid(i) {
  closeGrid();
  if (i != current && !walking) jumpTo(i);
}
function filterGrid() {
  const q = $('sgf').value,
    m = sceneMatcher(q);
  let hits = 0;
  [...$('sgl').children].forEach((b, i) => {
    b.hidden = !m(scenes[i], i);
    hits += !b.hidden;
  });
  $('sge').hidden = hits > 0;
  $('sgn').textContent = q.trim()
    ? t('nav.matches', { n: hits, t: scenes.length })
    : t('lib.scenes', { n: scenes.length });
  // The tab stop moves to the first match when its own cell is filtered out.
  const c = gridCells();
  if (c.length && !c.some(b => b.tabIndex == 0)) {
    $('sgl')
      .querySelectorAll('[tabindex="0"]')
      .forEach(b => (b.tabIndex = -1));
    c[0].tabIndex = 0;
  }
}
// Makes b the grid's tab stop and focuses it, centred or just brought into view. The list is
// scrolled by hand: scrollIntoView() would also scroll a page that embeds the tour.
function gridFocus(b, centre) {
  if (!b) return;
  const L = $('sgl');
  L.querySelectorAll('[tabindex="0"]').forEach(x => (x.tabIndex = -1));
  b.tabIndex = 0;
  b.focus({ preventScroll: true });
  const y = b.offsetTop,
    h = b.offsetHeight,
    pad = 16;
  if (centre) L.scrollTop = y - (L.clientHeight - h) / 2;
  else if (y - pad < L.scrollTop) L.scrollTop = y - pad;
  else if (y + h + pad > L.scrollTop + L.clientHeight) L.scrollTop = y + h + pad - L.clientHeight;
}
$('sgf').oninput = filterGrid;
$('sgx').onclick = closeGrid;
$('sgl').onclick = e => {
  const b = e.target.closest('button');
  if (b) pickGrid(+b.dataset.i);
};
$('sgm').onclick = e => {
  if (e.target == $('sgm')) closeGrid();
};
$('sgm').addEventListener('keydown', e => {
  const f = $('sgf'),
    a = document.activeElement,
    c = gridCells(),
    stop = c.find(b => b.tabIndex == 0);
  if (e.key == 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    // The first Escape in a search field with text clears it, as it does elsewhere.
    if (a == f && f.value) {
      f.value = '';
      filterGrid();
    } else closeGrid();
    return;
  }
  // Focus stays in the dialog: close, search, then the grid.
  if (e.key == 'Tab') {
    const ring = [$('sgx'), f, stop].filter(Boolean),
      k = ring.indexOf(a);
    e.preventDefault();
    ring[k < 0 ? 0 : (k + (e.shiftKey ? ring.length - 1 : 1)) % ring.length].focus();
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (a == f) {
    // Down goes into the grid; Enter opens the first match of a search.
    if (e.key == 'ArrowDown' && stop) {
      e.preventDefault();
      gridFocus(stop);
    } else if (e.key == 'Enter' && f.value.trim() && c.length) {
      e.preventDefault();
      pickGrid(+c[0].dataset.i);
    }
    return;
  }
  const i = c.indexOf(a);
  if (i < 0) return;
  let cols = 1;
  while (cols < c.length && c[cols].offsetTop == c[0].offsetTop) cols++;
  const rtl = isRTL(),
    go = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: cols, ArrowUp: -cols }[
      e.key
    ];
  let k;
  if (go != null) k = i + go;
  else if (e.key == 'Home') k = 0;
  else if (e.key == 'End') k = c.length - 1;
  else {
    // Typing a letter goes to the search field, which takes the letter.
    if (e.key.length == 1 && e.key != ' ') f.focus();
    return;
  }
  e.preventDefault();
  if (k < 0) {
    if (e.key == 'ArrowUp') f.focus();
    return;
  }
  // Down from the row above a short last row lands on its last cell.
  if (k >= c.length) k = c[c.length - 1].offsetTop > a.offsetTop ? c.length - 1 : i;
  gridFocus(c[k]);
});

// ───────────── walkthrough transition ─────────────
let worldTurn = 0,
  walking = false;
const ease = k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
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
// ── cross-fade ──
// A jump, and a link taken without the walk, swap the scene at once and lay the last panorama
// over it, turned so that it shows the frame that was on screen, then fade it out. The new
// scene's hotspots fade in meanwhile (hsFade, applied in the render loop). The zoom eases to
// the new scene's start zoom, unless reduced motion is asked for or the visitor zooms.
const easeCubic = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  fadeQ = new THREE.Quaternion(),
  camQ = new THREE.Quaternion(),
  camE = new THREE.Euler(0, 0, 0, 'YXZ');
let fading = 0, // the fade in progress, or 0
  fadeSeq = 0, // numbers fades, so a fade cut short never touches the next
  hsFade = 1;
// The project's transition between scenes: 'walk', 'fade' or 'none'. A headset never walks
// or fades, since the motion would fill the visitor's whole field of view.
const transition = () => (project.walk === false ? 'none' : project.tr == 'fade' ? 'fade' : 'walk');
// A link's cross-fade lasts 500 ms and a jump's 350, less under reduced motion.
const fadeMs = jump => (reduceMotion.matches ? (jump ? 150 : 250) : jump ? 350 : 500);
// A jump, from the scene bar, the grid or the plan, cross-fades in the tour unless the project
// has no transitions. The editor's scene list stays instant, for speed while authoring.
const jumpTo = i =>
  showScene(i, { fade: mode == 'view' && transition() != 'none' && fadeMs(true) });
function stopFade() {
  if (!fading) return;
  fading = 0;
  hsFade = 1;
  setFov(fov); // a zoom cut short ends where it was heading
  fadeMesh.visible = false;
  fadeMesh.material.map = null;
  fadeMesh.quaternion.identity();
  fadeGroup.quaternion.identity();
}
function crossFade(ms, f0) {
  const id = (fading = ++fadeSeq),
    f1 = fov;
  // The camera the next frame will draw with: gyro sets the pitch itself.
  camE.set(gyro && gyroReady ? camera.rotation.x : pitch, yaw, 0);
  fadeGroup.quaternion.multiplyQuaternions(camQ.setFromEuler(camE), fadeQ);
  fadeMesh.material.opacity = 1;
  fadeMesh.visible = true;
  hsFade = 0;
  const zoom = !reduceMotion.matches && Math.abs(f1 - f0) > 0.1;
  if (zoom) setFov(f0);
  return animate(ms, k => {
    if (fading != id) return;
    const e = easeCubic(k);
    fadeMesh.material.opacity = 1 - e;
    hsFade = e;
    if (zoom && fov == f1) setFov(f0 + (f1 - f0) * e);
    if (k == 1) stopFade();
  });
}
async function ensureTexture(s, urgent) {
  try {
    await loadTexture(s, urgent);
    return true;
  } catch (e) {
    return false;
  }
}
// Where the visitor faces on arriving in scene s from scene from through hotspot h, as a
// panorama u. heading is the u they face in the scene they are leaving. In order:
// - both scenes have a north set: keep the compass heading;
// - s has a link back to from: that link points behind the visitor, so face the opposite
//   way, turned by as much as they were looking away from h. Return links are common and
//   need no setup, so most tours keep their sense of direction without a north;
// - otherwise: the start angle of s.
function arrivalHeading(from, s, h, heading) {
  if (from.n != null && s.n != null) return s.n + (heading - from.n);
  const back = s.hs.find(x => x.type == 'link' && x.to == from.id);
  if (back) return back.u + 0.5 + (heading - h.u);
  return s.u0 || 0;
}
async function walkTo(i, h) {
  if (walking || i == current) return;
  const s = scenes[i],
    from = scenes[current];
  walking = true;
  walkTarget = s.id;
  stopFade();
  $('pop').hidden = true;
  try {
    if (!(await ensureTexture(s, true))) {
      walking = false;
      return showScene(i);
    }
    if (!gyro) {
      const d = sphereToVec(h.u, h.v, 1).applyQuaternion(sceneQuat()),
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
    const heading = worldTurn - yaw / (2 * PI),
      nextTurn = arrivalHeading(from, s, h, heading) + yaw / (2 * PI),
      // The next scene opens at its own start zoom; the push-in heads for it, so the zoom
      // carries on smoothly through the cross-fade.
      f0 = fov,
      f1 = s.f0 || FOV0;
    fadeGroup.rotation.y = 2 * PI * nextTurn + PI / 2;
    fadeMesh.quaternion.fromArray(s.lq || NO_TILT);
    fadeMesh.material.map = textures[s.id];
    fadeMesh.material.needsUpdate = true;
    fadeMesh.material.opacity = 0;
    fadeMesh.visible = true;
    hotspotGroup.visible = false;
    await animate(650, k => {
      fadeMesh.material.opacity = ease(k);
      setFov(f0 - 8 + (f1 - f0 - 22) * k);
    });
    sphereMat.map = textures[s.id];
    sphereMat.needsUpdate = true;
    worldTurn = nextTurn;
    world.rotation.y = fadeGroup.rotation.y;
    level.quaternion.copy(fadeMesh.quaternion);
    fov = f1;
    current = i;
    selId = null;
    buildHotspots();
    hotspotGroup.visible = true;
    fadeMesh.visible = false;
    ui();
    await animate(550, k => setFov(fov - 30 * (1 - ease(k))));
  } finally {
    setFov(fov);
    fadeMesh.quaternion.identity();
    fadeMesh.visible = false;
    fadeMesh.material.map = null;
    hotspotGroup.visible = true;
    walking = false;
    walkTarget = null;
  }
}
// walk stays a boolean, false for no transition, so a build that predates tr still reads it;
// tr: 'fade' is left out unless chosen.
$('trn').onchange = e => {
  const v = e.target.value;
  project.walk = v != 'none';
  if (v == 'fade') project.tr = 'fade';
  else delete project.tr;
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
  const x = raycaster.intersectObjects(mode == 'view' ? liveHotspots() : hsTargets(), false);
  return x.length ? x[0].object.userData.h : null;
};
// What catches the pointer: icons (on the floor, the sprite over the decal) and labels.
const hsTargets = () => hotspotGroup.children.filter(c => c !== c.userData.e.dc);
// What the tour shows to point at: a label shown on hover is nothing while it is hidden.
const shownTargets = () => hsTargets().filter(c => c !== c.userData.e.lb || c.userData.e.a > 0.5);
// In the tour, a plain text note can't be clicked, so it mustn't catch a click or a gaze meant
// for a hotspot behind it.
const liveHotspots = () => shownTargets().filter(c => !inert(c.userData.h));
const pickXR = (o, d) => {
  raycaster.set(o, d);
  const x = raycaster.intersectObjects(
    vrPanel.visible ? [...liveHotspots(), vrPanelBody, vrPanelClose] : liveHotspots(),
    false
  );
  return x.length ? x[0].object : null;
};
// A text-only note with nothing more to say is a label on the scene, not a button: in the
// tour it doesn't react to the pointer or to gaze, since a popup would only repeat it.
const inert = h => !!h && h.type == 'info' && h.shape == 'none' && !(h.text || '').trim();
// ── click anywhere ──
// With the project's "click anywhere" on, a click in the tour that misses every hotspot takes
// the link that lies most nearly in its direction, through the usual walk. Directions are
// compared in the scene, so level correction counts, with heights squeezed to half
// (AIM_SQUASH): how far below the horizon a floor arrow sits mostly says how far off it is (a
// metre away it is 55° down, five metres 17°), while its bearing is where the visitor means
// to go. A link more than 60° from the click (AIM_COS) is not taken; that is about the edge of
// a 16:9 screen at the default zoom, so the walk turns toward something the visitor can see.
// Adding a pull toward the floor instead, dot(p, ray) + dot(p, down), leans every click
// halfway down and accepts a link some 77° off: a click straight ahead can then take a floor
// arrow at the visitor's side, and an arrow under the tripod wins almost any click.
const AIM_SQUASH = 0.5,
  AIM_COS = 0.5,
  aimQ = new THREE.Quaternion(),
  aimRay = new THREE.Vector3(),
  aimDir = new THREE.Vector3();
function aimedLink(ray) {
  sceneQuat(aimQ);
  aimRay
    .copy(ray)
    .setY(ray.y * AIM_SQUASH)
    .normalize();
  let best = null,
    top = AIM_COS;
  // Each hotspot once, from its anchor, however many objects draw it.
  for (const { h, ic, lb } of hsParts) {
    if (h.type != 'link' || !scenes.some(s => s.id == h.to)) continue;
    aimDir.copy((ic || lb).position).applyQuaternion(aimQ);
    const c = aimDir
      .setY(aimDir.y * AIM_SQUASH)
      .normalize()
      .dot(aimRay);
    if (c > top) {
      top = c;
      best = h;
    }
  }
  return best;
}
// What a click at e takes: the hotspot under it, or in the tour with click anywhere on, the
// link it aims at. A plain note under the pointer takes nothing, since it is there to be read.
// A label hidden until hover is not there for the visitor, so a click on it aims; the floor's
// pick sprite stands for its decal. While a scene loads, the hotspots shown are still the last
// scene's, and take nothing.
function clickTarget(e, aim = true) {
  if (hotspotsOf != scenes[current]?.id) return null;
  const h = hotspotAt(e);
  if (h || !aim || !project.click || mode != 'view') return h;
  return raycaster.intersectObjects(shownTargets(), false).length
    ? null
    : aimedLink(raycaster.ray.direction);
}
function activate(h) {
  if (inert(h)) return;
  if (h.type == 'link') {
    const k = scenes.findIndex(s => s.id == h.to),
      tr = renderer.xr.isPresenting ? 'none' : transition();
    // Reduced motion and the fade both cross-fade without turning, keeping the walk's heading.
    if (k < 0) return;
    if (tr == 'none') showScene(k);
    else if (tr == 'walk' && !reduceMotion.matches) walkTo(k, h);
    else if (!walking && k != current)
      showScene(k, { fade: fadeMs(false), via: h, from: scenes[current] });
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
        e: hsParts.find(x => x.h === h),
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
    if (hsDrag.m >= 6 && hsDrag.e) {
      hsDrag.moved = true;
      const r = glCanvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          -((e.clientY - r.top) / r.height) * 2 + 1
        ),
        camera
      );
      Object.assign(hsDrag.h, vecToUV(raycaster.ray.direction));
      floorClamp(hsDrag.h);
      placeHotspot(hsDrag.e);
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
    // With click anywhere on, the link a click would take grows as if hovered.
    hovered = pointers.size > 1 ? null : clickTarget(e);
    glCanvas.style.cursor = placing ? 'crosshair' : hovered ? 'pointer' : 'grab';
  }
});
glCanvas.addEventListener('pointerleave', () => {
  if (!drag && !hsDrag) hovered = null;
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
  if (mode == 'view') {
    // Only the main button aims; a pinch never gets here, since it clears drag. Touch has no
    // hover, so the first tap right on a hotspot whose label shows on hover shows it, as
    // hovering would, and a second tap within PEEK_MS opens it; a pen that hovers has already
    // shown it. A link taken by click anywhere is walked to at once: it grew under the pointer
    // before the click, and the visitor aimed at the way, not at the hotspot.
    const g = clickTarget(e, e.button == 0),
      hid =
        g &&
        e.pointerType != 'mouse' &&
        g !== hovered &&
        hoverLabel(g) &&
        hsParts.some(x => x.h === g && x.lb) &&
        hotspotAt(e) === g;
    if (hid && peek?.h !== g) peek = { h: g, until: performance.now() + PEEK_MS };
    else {
      peek = null;
      if (g) activate(g);
    }
    return;
  }
  const h = hotspotAt(e);
  if (placing) {
    const p = vecToUV(raycaster.ray.direction);
    let moved = false;
    if (placing == 'move') moved = floorClamp(Object.assign(selHotspot(), p));
    else {
      const o = scenes.find(s => s.id != scenes[current].id),
        look = { ...hsLook[placing] };
      // The last look may name an icon of a project that is no longer open.
      if (look.shape == 'img' && !projectIcon(look.icon)) delete look.shape;
      if (look.shape != 'img') delete look.icon;
      const n = {
        id: uid(),
        type: placing,
        label: '',
        text: '',
        to: placing == 'link' ? o?.id : undefined,
        shape: placing == 'info' ? 'info' : 'arrow',
        color: '#f59e0b',
        size: 1,
        ...look,
        ...p,
      };
      moved = floorClamp(n);
      scenes[current].hs.push(n);
      selId = n.id;
    }
    placing = null;
    buildHotspots();
    ui();
    save();
    if (moved) toast(t('msg.floorClamp'));
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
    fov = Math.max(FOV_MIN, Math.min(FOV_MAX, fov + e.deltaY * 0.04));
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
  // A trigger pulled at empty space does nothing, click anywhere or not. In a headset nothing
  // would show which link it was about to take, the visitor would be moved without a walk,
  // and the controller's ray already makes a hotspot easy to aim at.
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
  // The level correction, seen from the scene: turn into the panorama's frame, tilt, turn back.
  turnQuat.setFromAxisAngle(UP, world.rotation.y);
  nadirGroup.quaternion.copy(turnQuat).multiply(level.quaternion).multiply(turnQuat.invert());
  if (!xr) {
    // Auto-rotate waits AUTO_IDLE ms after the last input or anything that stops it, then
    // eases up to speed over AUTO_RAMP ms.
    if (autoHeld()) autoAt = time;
    else {
      const r = Math.min(1, Math.max(0, (time - autoAt - AUTO_IDLE) / AUTO_RAMP));
      yaw -= dt * AUTO_SPEED * (project.autoSpd || 1) * ease(r);
    }
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
  // An icon and its label are one target, so the dwell carries on across them.
  if ((gz?.userData.h || gz) !== (gazeTarget?.userData.h || gazeTarget)) gazeTime = 0;
  gazeTarget = gz;
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
  // A hotspot set to keep its size shrinks in the scene as the view zooms in, by as much as
  // the panorama grows, so it stays the size it has at the default zoom.
  const keep = xr ? 1 : Math.tan((camera.fov * PI) / 360) / Math.tan((FOV0 * PI) / 360);
  if (peek && time > peek.until) peek = null;
  // The floor's up, in the panorama's frame: the level correction tilts the photo to it.
  const up = floorUp.copy(UP).applyQuaternion(floorQ.copy(level.quaternion).invert()),
    fade = reduceMotion.matches ? 1 : Math.min(1, dt * 12),
    grow = 1 - Math.exp(-dt * 14);
  hsParts.forEach(e => {
    const h = e.h,
      gazed = gazeTarget?.userData.h === h,
      on = gazed || h === hovered || h === peek?.h,
      to = on ? 1.2 : 1;
    // Grows toward its target with a 70 ms time constant, alike at any frame rate.
    e.g = reduceMotion.matches ? to : e.g + (to - e.g) * grow;
    const k =
      fit * (h.size || 1) * (h.fix ? keep : 1) * e.g * (gazed ? 1 + (gazeTime / need) * 0.3 : 1);
    let vs = 1;
    if (e.dc) {
      vs = layDecal(e, up);
      const w = e.iw * k * FLOOR_K;
      e.dc.scale.set(w, w, 1);
      e.ic.scale.set(w, w * Math.max(vs, 0.35), 1);
    } else if (e.ic) e.ic.scale.set(e.iw * k, e.iw * k, 1);
    const im = e.dc || e.ic;
    if (im) im.material.opacity = hsFade;
    if (e.lb) {
      // Always shown in the editor, where the author needs to see what they are placing.
      const show = mode == 'edit' || on || !hoverLabel(h) ? 1 : 0;
      e.a += (show - e.a) * fade;
      if (Math.abs(show - e.a) < 0.01) e.a = show;
      e.lb.material.opacity = e.a * hsFade;
      e.lb.visible = e.a * hsFade > 0;
      e.lb.scale.set((e.lW / HS_PX) * k, (e.lH / HS_PX) * k, 1);
      placeLabel(e, vs);
    }
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
  ctx.fillText(oneLine(h.label) || t('hs.info'), ax, 110, 780);
  ctx.font = '400 40px system-ui,Tahoma,Arial';
  ctx.fillStyle = '#e5e7eb';
  // Each line the author typed starts a new line here too, and long ones wrap.
  const lines = wrapLines(ctx, h.text, 900);
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
  // As many neighbours as fit in the budget beside the current scene, so preloading one
  // never pushes out another.
  let room = TEX_BUDGET - sceneCost(s);
  for (const n of [...new Set((s.hs || []).filter(h => h.type == 'link').map(h => h.to))]
    .map(id => scenes.find(x => x.id == id))
    .filter(Boolean)) {
    const c = sceneCost(n);
    if (c > room) continue;
    room -= c;
    ensureTexture(n);
  }
}
let undoStack = [],
  undoPos = -1,
  snapTimer,
  restoring = false;
const sceneKey = () =>
  JSON.stringify(scenes.map(s => ({ ...s, img: 0, th: 0, blob: 0, hd: 0, hdBlob: 0 })));
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
  if (EMBED || mode != 'edit' || !$('libm').hidden || !(e.ctrlKey || e.metaKey)) return;
  const tg = e.target.tagName;
  if (tg == 'INPUT' || tg == 'TEXTAREA' || tg == 'SELECT') return;
  const k = e.key.toLowerCase();
  if (k == 'z') {
    e.preventDefault();
    e.shiftKey ? redo() : undo();
  } else if (k == 'y') {
    e.preventDefault();
    redo();
  } else if (k == 'c' && selHotspot() && !String(getSelection())) {
    // Text the user selected on the page copies as usual.
    e.preventDefault();
    copyHotspot();
  } else if (k == 'v' && hsClip && scenes[current]) {
    e.preventDefault();
    pasteHotspot();
  } else if (k == 'd' && selHotspot()) {
    e.preventDefault();
    duplicateHotspot();
  }
});
// Delete or Backspace removes the selected hotspot, from the panorama or the hotspot list
// but not from a text field. Undo brings it back.
addEventListener('keydown', e => {
  if (EMBED || mode != 'edit' || !$('libm').hidden || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key != 'Delete' && e.key != 'Backspace') return;
  const tg = e.target;
  if (!(tg == document.body || tg == glCanvas || tg.closest?.('#hlist, #hprops button'))) return;
  if (!selHotspot()) return;
  e.preventDefault();
  deleteHotspot();
});
$('pdesc').oninput = e => {
  project.desc = e.target.value;
  save();
};
$('sgo').onclick = () => {
  $('start').hidden = true;
  gestured = true;
  startAudio();
  syncClip();
};
// ───────────── nadir patch, audio, floor plan, embed code ─────────────
async function shrinkCanvas(f, max, bg) {
  const im = await createImageBitmap(f),
    k = Math.min(1, max / Math.max(im.width, im.height)),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');
  canvas.width = Math.round(im.width * k);
  canvas.height = Math.round(im.height * k);
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
  im.close();
  return canvas;
}
async function shrinkImage(f, max, type) {
  return (await shrinkCanvas(f, max)).toDataURL(type, 0.88);
}
// A plan is mostly thin lines and small text, which JPEG smears and PNG keeps sharp at a
// modest size. A scanned or photographic plan makes a large PNG, so it falls back to JPEG.
// Transparent areas become white, as they would on paper.
const PLAN_MAX_PX = 4096,
  PLAN_PNG_MAX_BYTES = 3e6;
async function readPlan(f) {
  const c = await shrinkCanvas(f, PLAN_MAX_PX, '#fff'),
    png = await canvasBlob(c, 'image/png');
  if (png && png.size <= PLAN_PNG_MAX_BYTES) return png;
  const jpg = await canvasBlob(c, 'image/jpeg', 0.9);
  if (!jpg) throw new Error('encode');
  return jpg;
}
let nadirMesh = null,
  nadirSrc = '',
  audioEl = null,
  audioSrc = '',
  muted = false,
  planOpen = false,
  placingPlan = false,
  planSrc = '';
// The patch covers the tripod, which sits at the photo's own nadir. It doesn't turn with the
// scene, so a logo on it keeps its orientation, but it tilts with the scene's level
// correction (nadirGroup, set every frame) so it stays over the tripod.
const nadirGroup = new THREE.Group(),
  turnQuat = new THREE.Quaternion();
scene3d.add(nadirGroup);
function syncNadir() {
  const n = project.nadir;
  if (!n) {
    if (nadirMesh) {
      nadirGroup.remove(nadirMesh);
      nadirMesh = null;
    }
    nadirSrc = '';
    return;
  }
  if (nadirSrc != n.img) {
    nadirSrc = n.img;
    if (nadirMesh) {
      nadirGroup.remove(nadirMesh);
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
      nadirGroup.add(nadirMesh);
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
  $('mutei').setAttribute('href', muted ? '#i-mute' : '#i-volume');
  $('mute').setAttribute('aria-label', t(muted ? 'act.unmuteAria' : 'act.muteAria'));
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
    audioEl.volume = (a.vol ?? 0.6) * duck;
  }
}
function startAudio() {
  // Where the volume can't be lowered, the music waits for a scene's clip to finish.
  if (audioEl && !muted && audioEl.paused && mode == 'view' && (duck == 1 || volumeWorks()))
    audioEl.play().catch(() => {});
}
// ── scene audio ──
// A scene can have its own clip: it starts when the visitor enters the scene, after an
// optional delay, and stops when they leave. Browsers only play sound after the visitor has
// touched or clicked the page, so nothing starts before that, nor behind the start screen.
// While a clip plays the music is lowered to DUCK of its volume, with a short fade, and
// comes back when the clip ends or the visitor moves on. The mute button silences both.
const DUCK = 0.25,
  DUCK_MS = 400;
let duck = 1, // the music's share of its own volume
  duckTimer = 0,
  clip = null, // the current scene's clip: { id, snd, state: 'wait' | 'play' | 'done', timer }
  volOK = null,
  gestured = false;
const clipEl = new Audio();
// Safari on iOS ignores volume: it reads back as 1 whatever is set.
function volumeWorks() {
  if (volOK == null) {
    const a = new Audio();
    a.volume = 0.5;
    volOK = a.volume == 0.5;
  }
  return volOK;
}
function fadeMusic(to) {
  clearInterval(duckTimer);
  if (!volumeWorks()) {
    duck = to;
    if (audioEl) to < 1 ? audioEl.pause() : startAudio();
    return;
  }
  const from = duck,
    t0 = performance.now();
  // A timer rather than animation frames, which stop while the tab is in the background.
  duckTimer = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / DUCK_MS);
    duck = from + (to - from) * k;
    if (audioEl) audioEl.volume = (project.audio?.vol ?? 0.6) * duck;
    if (k == 1) clearInterval(duckTimer);
  }, 30);
}
function endClip() {
  if (!clip) return;
  clearTimeout(clip.timer);
  clip = null;
  clipEl.onended = null;
  clipEl.pause();
  clipEl.removeAttribute('src');
  clipEl.load(); // let go of the file
  fadeMusic(1);
}
function playClip(c) {
  c.timer = 0;
  if (clip !== c || muted) return;
  c.state = 'play';
  clipEl.src = c.snd.src;
  clipEl.loop = !!c.snd.loop;
  clipEl.onended = () => {
    if (clip !== c) return;
    c.state = 'done';
    fadeMusic(1);
  };
  fadeMusic(DUCK);
  clipEl.play().catch(() => {
    if (clip !== c) return;
    c.state = 'done';
    fadeMusic(1);
  });
}
// Brings the clip in line with the scene on screen, the mode and the mute button.
function syncClip() {
  const s = scenes[current],
    on =
      mode == 'view' &&
      s?.snd &&
      $('start').hidden &&
      (gestured || navigator.userActivation?.hasBeenActive);
  if (!on || clip?.id != s.id || clip.snd !== s.snd) {
    endClip();
    if (!on) return;
    clip = { id: s.id, snd: s.snd, state: 'wait', timer: 0 };
  }
  if (muted) {
    // Paused where it is; a clip still waiting for its delay starts the wait again.
    clearTimeout(clip.timer);
    clip.timer = 0;
    clipEl.pause();
    return;
  }
  if (clip.state == 'wait' && !clip.timer) {
    const c = clip;
    c.timer = setTimeout(() => playClip(c), (s.snd.delay || 0) * 1000);
  } else if (clip.state == 'play' && clipEl.paused) {
    fadeMusic(DUCK);
    clipEl.play().catch(() => {});
  }
}
function renderPlan() {
  const pl = project.plan;
  if (!(pl && planOpen) && planBig) return setPlanBig(false);
  $('plan').hidden = !(pl && planOpen);
  $('plan').classList.toggle('big', planBig);
  $('plan').classList.toggle('placing', placingPlan);
  const k = planBig ? 'act.planSmall' : 'act.planBig';
  $('pexp').title = t(k);
  $('pexp').setAttribute('aria-label', t(k));
  $('pexpi').setAttribute('href', planBig ? '#i-shrink' : '#i-expand');
  if (!pl) return;
  if (planSrc != pl.img) {
    planSrc = pl.img;
    $('pimg').src = pl.img;
  }
  // The enlarged plan names the current scene beside its marker; the others show their
  // name on hover.
  $('pdots').innerHTML = scenes
    .map((s, i) =>
      s.pp
        ? `<button class="pd ${i == current ? 'on' : ''}" data-i="${i}" style="left:${s.pp.x * 100}%;top:${s.pp.y * 100}%" title="${esc(s.name)}" aria-label="${esc(s.name)}">${i == current ? `<span dir="auto">${esc(s.name)}</span>` : ''}</button>`
        : ''
    )
    .join('');
  if (planBig) planFit(false);
}
// ── enlarged plan: zoom and pan ──
// The plan fills the stage and #pbox is moved with a transform: x and y in pixels from the
// top-left of #plan, z the zoom over the size that fits. Markers are scaled by 1/z in CSS,
// so they stay the same size on screen while the drawing grows.
let planBig = false,
  planView = { x: 0, y: 0, z: 1 },
  planFitW = 0,
  planMoved = false;
const planPointers = new Map();
let planPinch = null,
  planPan = null;
function planZMax() {
  const w = $('pimg').naturalWidth || PLAN_MAX_PX;
  // Up to two screen pixels per plan pixel, and never less than 4×.
  return Math.max(4, ((w / (planFitW || 1)) * 2) / (devicePixelRatio || 1));
}
function planApply() {
  const p = $('plan'),
    b = $('pbox'),
    W = p.clientWidth,
    H = p.clientHeight,
    w = planFitW * planView.z,
    h = b.offsetHeight * planView.z;
  // Centred at the fitted size. Zoomed in, the drawing can move as long as it still covers
  // the middle of the stage: a marker near the edge of the sheet can be brought to the
  // centre, and the point under the cursor or between two fingers stays put while zooming.
  if (planView.z <= 1) {
    planView.x = (W - w) / 2;
    planView.y = (H - h) / 2;
  } else {
    planView.x = Math.min(W / 2, Math.max(W / 2 - w, planView.x));
    planView.y = Math.min(H / 2, Math.max(H / 2 - h, planView.y));
  }
  b.style.transform = `translate(${planView.x}px, ${planView.y}px) scale(${planView.z})`;
  b.style.setProperty('--pz', planView.z);
}
// Sizes the plan to fit the stage. reset returns to the whole drawing; otherwise the
// current zoom is kept and only re-clamped.
function planFit(reset) {
  const p = $('plan'),
    im = $('pimg'),
    W = p.clientWidth,
    H = p.clientHeight,
    ar = im.naturalWidth && im.naturalHeight ? im.naturalWidth / im.naturalHeight : 1.4;
  if (!W || !H) return;
  planFitW = Math.min(W, H * ar);
  $('pbox').style.width = planFitW + 'px';
  if (reset) planView = { x: 0, y: 0, z: 1 };
  planView.z = Math.min(planZMax(), Math.max(1, planView.z));
  planApply();
}
// Zooms to z around a point given in pixels from the top-left of #plan.
function planZoomAt(z, cx, cy) {
  z = Math.min(planZMax(), Math.max(1, z));
  const k = z / planView.z;
  planView.x = cx - (cx - planView.x) * k;
  planView.y = cy - (cy - planView.y) * k;
  planView.z = z;
  planApply();
}
function planZoomBy(f) {
  const p = $('plan');
  planZoomAt(planView.z * f, p.clientWidth / 2, p.clientHeight / 2);
}
function setPlanBig(on) {
  if (on == planBig) return;
  planBig = on;
  planMoved = false;
  // Placing happens on the enlarged plan only, so closing it ends a placement too.
  if (!on) placingPlan = false;
  planPointers.clear();
  planPinch = planPan = null;
  const b = $('pbox');
  if (!on) {
    b.style.transform = b.style.width = '';
    b.style.removeProperty('--pz');
  }
  renderPlan();
  if (on) {
    planFit(true);
    $('pexp').focus({ preventScroll: true });
  }
}
$('pimg').addEventListener('load', () => planBig && planFit(true));
new ResizeObserver(() => planBig && planFit(false)).observe($('plan'));
$('pexp').onclick = () => setPlanBig(!planBig);
$('pzi').onclick = () => planZoomBy(1.6);
$('pzo').onclick = () => planZoomBy(1 / 1.6);
addEventListener('keydown', e => {
  if (e.key == 'Escape' && planBig) setPlanBig(false);
});
// Pixels from the inside of the border, where the transform of #pbox starts.
const planPoint = e => {
  const p = $('plan'),
    r = p.getBoundingClientRect();
  return { x: e.clientX - r.left - p.clientLeft, y: e.clientY - r.top - p.clientTop };
};
$('plan').addEventListener('pointerdown', e => {
  planMoved = false;
  if (!planBig || e.target.closest('#pctl')) return;
  planPointers.set(e.pointerId, planPoint(e));
  if (planPointers.size == 2) {
    const [a, b] = [...planPointers.values()];
    planPan = null;
    planPinch = {
      d: Math.hypot(a.x - b.x, a.y - b.y) || 1,
      z: planView.z,
      m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    };
  } else planPan = { ...planPoint(e), id: e.pointerId };
});
$('plan').addEventListener('pointermove', e => {
  if (!planPointers.has(e.pointerId)) return;
  const q = planPoint(e);
  planPointers.set(e.pointerId, q);
  if (planPinch && planPointers.size == 2) {
    const [a, b] = [...planPointers.values()],
      m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    planView.x += m.x - planPinch.m.x;
    planView.y += m.y - planPinch.m.y;
    planPinch.m = m;
    planZoomAt((planPinch.z * Math.hypot(a.x - b.x, a.y - b.y)) / planPinch.d, m.x, m.y);
    planMoved = true;
  } else if (planPan && planPan.id == e.pointerId) {
    const dx = q.x - planPan.x,
      dy = q.y - planPan.y;
    // A press that wanders a few pixels is still a click on a marker or a placement.
    if (!planMoved && Math.hypot(dx, dy) < 6) return;
    if (!planMoved) {
      planMoved = true;
      try {
        $('plan').setPointerCapture(e.pointerId);
      } catch (x) {}
    }
    planView.x += dx;
    planView.y += dy;
    planPan.x = q.x;
    planPan.y = q.y;
    planApply();
  }
});
const endPlanPointer = e => {
  planPointers.delete(e.pointerId);
  if (planPointers.size < 2) planPinch = null;
  if (planPan?.id == e.pointerId) planPan = null;
};
$('plan').addEventListener('pointerup', endPlanPointer);
$('plan').addEventListener('pointercancel', endPlanPointer);
$('plan').addEventListener(
  'wheel',
  e => {
    if (!planBig) return;
    e.preventDefault();
    const q = planPoint(e);
    planZoomAt(planView.z * Math.exp(-e.deltaY * 0.0022), q.x, q.y);
  },
  { passive: false }
);
$('plan').addEventListener('dblclick', e => {
  if (!planBig || e.target.closest('button')) return;
  const q = planPoint(e);
  planView.z > 1.01 ? planFit(true) : planZoomAt(3, q.x, q.y);
});
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
  $('mute').hidden = !project.audio && !scenes.some(s => s.snd);
  $('pbtn').hidden = !project.plan;
  if (document.activeElement != $('nsz')) $('nsz').value = project.nadir?.r || 25;
  if (document.activeElement != $('eurl')) $('eurl').value = project.eurl || '';
  $('ecode').value = embedCode();
  syncLogo();
  syncCover();
  if (audioEl) {
    mode == 'view' ? startAudio() : audioEl.pause();
  }
  syncClip();
  syncSceneAudio();
}
const onGesture = () => {
  gestured = true;
  startAudio();
  syncClip();
};
addEventListener('pointerdown', onGesture);
addEventListener('keydown', onGesture);
$('mute').onclick = () => {
  muted = !muted;
  if (audioEl) {
    muted ? audioEl.pause() : startAudio();
  }
  syncAudio();
  syncClip();
};
$('pbtn').onclick = () => {
  planOpen = !planOpen;
  if (!planOpen) placingPlan = false;
  renderPlan();
};
$('pdots').onclick = e => {
  const b = e.target.closest('button');
  if (!b || planMoved || placingPlan) return;
  e.stopPropagation();
  setPlanBig(false);
  if (!walking) jumpTo(+b.dataset.i);
};
// Placing a scene works on the enlarged plan, where a marker can be put down precisely.
// On the small plan a click enlarges it.
$('pbox').onclick = e => {
  if (planMoved) return;
  if (!placingPlan) {
    if (!planBig && !e.target.closest('button')) setPlanBig(true);
    return;
  }
  if (!scenes[current]) return;
  const r = $('pimg').getBoundingClientRect(),
    c = v => Math.min(1, Math.max(0, v));
  scenes[current].pp = {
    x: c((e.clientX - r.left) / r.width),
    y: c((e.clientY - r.top) / r.height),
  };
  placingPlan = false;
  toast(t('msg.planSet'));
  save();
  setPlanBig(false);
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
  if (planBig) renderPlan();
  else setPlanBig(true);
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
// The scene's clip in the editor: upload, remove, loop, delay and a button to listen to it.
// Removing a clip doesn't revoke its URL, since undo can bring the clip back.
let saPrev = null; // { id, el } while the author listens to a clip
function stopListening() {
  if (!saPrev) return;
  saPrev.el.pause();
  saPrev = null;
  syncSceneAudio();
}
function syncSceneAudio() {
  if (EMBED) return;
  const s = scenes[current],
    a = s?.snd;
  if (saPrev && (mode != 'edit' || saPrev.id != s?.id || saPrev.snd !== a)) stopListening();
  $('sactl').hidden = !a;
  $('sarm').disabled = !a;
  if (!a) return;
  $('saname').textContent = a.name;
  $('saloop').checked = !!a.loop;
  if (document.activeElement != $('sadl')) $('sadl').value = a.delay || 0;
  $('sadlv').value = t('f.sec', { n: a.delay || 0 });
  $('saplay').setAttribute('aria-pressed', !!saPrev);
  $('saplayi').setAttribute('href', saPrev ? '#i-stop' : '#i-play');
  setText($('saplayt'), t(saPrev ? 'act.stop' : 'act.listen'));
}
// Options change by replacing the object, so undo snapshots keep their own.
const setSnd = o => {
  const s = scenes[current];
  if (!s?.snd) return;
  s.snd = { ...s.snd, ...o };
  for (const k in o) if (!o[k]) delete s.snd[k]; // loop and delay are left out at their defaults
  save();
  syncSceneAudio();
};
$('safile').onchange = e => {
  const f = e.target.files[0],
    s = scenes[current];
  e.target.value = '';
  if (!f || !s) return;
  if (f.size > 8e6) {
    toast(t('msg.audioBig'));
    return;
  }
  // Some systems hand over audio with no type; it is played and served as audio all the same.
  const b = /^audio\//.test(f.type) ? f : new Blob([f], { type: 'audio/mpeg' });
  s.snd = { ...s.snd, src: objURL(b), blob: b, name: f.name.slice(0, 120) };
  save();
  syncExtras();
  toast(t('msg.sceneAudioAdded'));
};
$('sarm').onclick = () => {
  const s = scenes[current];
  if (!s?.snd) return;
  delete s.snd;
  save();
  syncExtras();
};
$('saloop').onchange = e => setSnd({ loop: e.target.checked });
$('sadl').oninput = e => setSnd({ delay: +e.target.value });
$('saplay').onclick = () => {
  const s = scenes[current];
  if (saPrev) return stopListening();
  if (!s?.snd) return;
  saPrev = { id: s.id, snd: s.snd, el: new Audio(s.snd.src) };
  saPrev.el.loop = !!s.snd.loop;
  saPrev.el.onended = stopListening;
  saPrev.el.play().catch(stopListening);
  syncSceneAudio();
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
  busy(1); // encoding a large plan takes a moment, longest on a phone
  const pid = projectId;
  try {
    const blob = await readPlan(f);
    // The user may have opened another project while it was encoding.
    if (pid != projectId) throw new Error('moved');
    freeURL(project.plan?.img);
    project.plan = { img: objURL(blob), blob };
    planDirty = true;
    planOpen = true;
    save();
    syncExtras();
  } catch (x) {
    if (x.message != 'moved') toast(t('msg.imgFail'));
  }
  busy(-1);
};
// Removing the plan also drops every scene's place on it, and undo brings back only the places,
// so it takes a second click like deleting a scene.
$('prm').onclick = () => {
  const b = $('prm');
  if (!project.plan) return;
  if (b.dataset.c != '1') {
    b.dataset.c = '1';
    b.textContent = t('act.confirmDel');
    setTimeout(() => {
      b.dataset.c = '';
      b.textContent = t('act.remove');
    }, 3000);
    return;
  }
  b.dataset.c = '';
  b.textContent = t('act.remove');
  freeURL(project.plan?.img);
  delete project.plan;
  scenes.forEach(s => delete s.pp);
  planOpen = placingPlan = false;
  planDirty = true;
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
// ───────────── cover ─────────────
// The cover is a picture of the current view, taken by rendering the scene again at 16:9 into
// an off-screen target, without hotspots. It is the background of an exported tour's start
// screen and the project's picture in the library, both of which otherwise show the first
// panorama squeezed flat.
const COVER_W = 1280,
  COVER_H = 720;
async function captureCover() {
  if (!scenes[current]) return;
  const pid = projectId,
    rt = new THREE.WebGLRenderTarget(COVER_W, COVER_H),
    cam = camera.clone(),
    shown = hotspotGroup.visible;
  rt.texture.encoding = THREE.sRGBEncoding;
  cam.aspect = COVER_W / COVER_H;
  cam.updateProjectionMatrix();
  const px = new Uint8Array(COVER_W * COVER_H * 4);
  hotspotGroup.visible = false;
  try {
    renderer.setRenderTarget(rt);
    renderer.render(scene3d, cam);
    renderer.readRenderTargetPixels(rt, 0, 0, COVER_W, COVER_H, px);
  } finally {
    renderer.setRenderTarget(null);
    hotspotGroup.visible = shown;
    rt.dispose();
  }
  // WebGL reads rows from the bottom up.
  const c = document.createElement('canvas'),
    ctx = c.getContext('2d'),
    im = ctx.createImageData(COVER_W, COVER_H),
    row = COVER_W * 4;
  c.width = COVER_W;
  c.height = COVER_H;
  for (let y = 0; y < COVER_H; y++)
    im.data.set(px.subarray((COVER_H - 1 - y) * row, (COVER_H - y) * row), y * row);
  ctx.putImageData(im, 0, 0);
  const blob = await canvasBlob(c, 'image/jpeg', 0.85);
  if (!blob) throw new Error('encode');
  // Another project may have been opened while the picture was encoding.
  if (pid != projectId) return false;
  freeURL(project.cover?.img);
  project.cover = { img: objURL(blob), blob, t: Date.now() };
  coverDirty = true;
  save();
  syncCover();
  return true;
}
function syncCover() {
  if (EMBED) return;
  const c = project.cover,
    im = $('cvimg');
  im.hidden = !c;
  if (c) im.src = c.img;
  else im.removeAttribute('src');
  $('cvrm').disabled = !c;
}
if (!EMBED) {
  $('cvset').onclick = () => {
    captureCover().then(
      ok => ok && toast(t('msg.coverSet')),
      () => toast(t('msg.imgFail'))
    );
  };
  $('cvrm').onclick = () => {
    freeURL(project.cover?.img);
    delete project.cover;
    coverDirty = true;
    save();
    syncCover();
  };
}
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
async function readLogo(f, max = LOGO_MAX_PX) {
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
    k = Math.min(1, max / Math.max(w, h)),
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
      fov = Math.max(FOV_MIN, Math.min(FOV_MAX, (pinch.f * pinch.d) / d));
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
      fov = Math.max(FOV_MIN, fov - 5);
      camera.fov = fov;
      camera.updateProjectionMatrix();
      break;
    case '-':
    case '_':
      fov = Math.min(FOV_MAX, fov + 5);
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
          if (old.plan) {
            try {
              old.plan = { blob: dataToBlob(old.plan.img) };
              old.plan.img = objURL(old.plan.blob);
              planDirty = true;
            } catch (e) {
              delete old.plan;
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
          applyMigration(d);
          storedSceneIds = new Set(scenes.map(s => s.id));
          storedSnd = new Map(scenes.filter(s => s.snd).map(s => [s.id, s.snd.blob]));
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
  syncAuto();
  $('trn').value = transition();
  $('hdon').checked = !!project.hd;
  $('ca').checked = !!project.click;
  resetHist();
  if (EMBED && scenes.length) {
    $('stt').textContent = project.title || '';
    $('std').textContent = project.desc || '';
    $('start').style.backgroundImage =
      `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.7)),url("${project.cover?.img || scenes[0].img}")`;
    $('sgo').disabled = true;
    $('sgo').textContent = t('view.loading');
    $('start').hidden = false;
    // A folder tour opened from disk: browsers such as Chrome refuse to hand a file:// image
    // to WebGL, so every scene would fail. Say why, in both languages, and how to open it.
    if (location.protocol == 'file:' && !/^data:/.test(scenes[0].img)) {
      $('sgo').hidden = true;
      $('std').textContent = t('view.fileProto');
      const o = isRTL() ? 'en' : 'ar',
        p = document.createElement('p');
      p.lang = o;
      p.dir = o == 'ar' ? 'rtl' : 'ltr';
      p.textContent = I18N[o]['view.fileProto'];
      $('std').after(p);
      return;
    }
  }
  ui();
  resize();
  if (scenes.length)
    showScene(0).then(() => {
      $('sgo').disabled = false;
      $('sgo').textContent = t('view.start');
    });
})();
