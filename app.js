const $=id=>document.getElementById(id),PI=Math.PI,R=500,SHELL=$('root').innerHTML;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9),EMB=window.__TOUR__,TX={};
// Status toast. Defined early because the storage layer calls it on failure.
let msgT,msgHold=5200;
function toast(t,ms){msgHold=ms||5200;const m=$('msg');if(m)m.textContent=t}
let P=EMB||{title:'جولتي الافتراضية',scenes:[]},S=P.scenes,cur=-1,sel=null,placing=null,mode=EMB?'view':'edit',yaw=0,pitch=0,fov=75,drag=null,hov=null,dw=null,dp=0,t0=0,st;
const SCHEMA=1;
const idb=()=>new Promise((r,j)=>{const q=indexedDB.open('vrtour',1);
  q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains('k'))q.result.createObjectStore('k')};
  q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error||new Error('idb'))});
// Rejects on failure. An earlier version resolved on error, so a full disk
// silently discarded the user's work with no warning at all.
const dbOp=(m,k,v)=>idb().then(d=>new Promise((res,rej)=>{
  let tx;try{tx=d.transaction('k',m=='get'?'readonly':'readwrite')}catch(e){return rej(e)}
  const o=tx.objectStore('k'),q=m=='get'?o.get(k):m=='put'?o.put(v,k):o.delete(k);
  q.onsuccess=()=>res(q.result);
  q.onerror=ev=>{ev.preventDefault&&ev.preventDefault();rej(q.error||tx.error||new Error('db:'+m))};
  tx.onabort=()=>rej(tx.error||new Error('db-abort:'+m));
}));
// Images: blob: URLs in memory, binary Blobs on disk (no base64 33% overhead).
function dataToBlob(u){
  const i=u.indexOf(','),h=u.slice(0,i),bin=atob(u.slice(i+1)),n=bin.length,a=new Uint8Array(n);
  for(let x=0;x<n;x++)a[x]=bin.charCodeAt(x);
  return new Blob([a],{type:(h.match(/:(.*?);/)||[,'application/octet-stream'])[1]});
}
const toDataURL=b=>new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(f.result);f.onerror=()=>rej(f.error);f.readAsDataURL(b)});
const canvasBlob=(c,t,q)=>new Promise(r=>c.toBlob(r,t,q));
const objURL=b=>URL.createObjectURL(b);
const freeURL=u=>{if(typeof u=='string'&&u.startsWith('blob:'))URL.revokeObjectURL(u)};

let IDX=[],curId=null,dirty=new Set(),lastSids=new Set(),audioDirty=false,saveErr=false,edits=0,warned=false;
const save=()=>{if(EMB||!curId)return;clearTimeout(st);st=setTimeout(flush,400);snap();edits++};
async function thumb(src){try{const im=new Image();im.src=src;await im.decode();const c=document.createElement('canvas');c.width=320;c.height=160;c.getContext('2d').drawImage(im,0,0,320,160);return c.toDataURL('image/jpeg',.7)}catch(e){return null}}
// Project document without image bytes, so autosave stays a few KB per write.
function docOf(Q){
  const d={...Q,v:SCHEMA,scenes:(Q.scenes||[]).map(({img,blob,...r})=>r)};
  if(Q.audio)d.audio={name:Q.audio.name,vol:Q.audio.vol}; else delete d.audio;
  return d;
}
function saveFailed(e){
  saveErr=true;
  const q=e&&(e.name=='QuotaExceededError'||e.name=='NotEnoughSpace'||/quota|space/i.test(e.message||''));
  toast(q?'⚠️ امتلأت مساحة التخزين في المتصفح — لم يُحفظ عملك. اضغط «حفظ المشروع» الآن لتنزيله على جهازك قبل إغلاق الصفحة.'
         :'⚠️ تعذّر الحفظ التلقائي في هذا المتصفح (قد يكون وضع تصفّح خاص). اضغط «حفظ المشروع» لتنزيل عملك.',12000);
}
async function flush(){
  clearTimeout(st);if(EMB||!curId)return;const id=curId,Q=P;
  try{
    for(const sid of [...dirty]){
      const s=Q.scenes.find(x=>x.id==sid);
      if(s&&s.blob)await dbOp('put','b:'+id+':'+sid,s.blob);
      dirty.delete(sid);
    }
    if(audioDirty){
      if(Q.audio&&Q.audio.blob)await dbOp('put','a:'+id,Q.audio.blob); else await dbOp('del','a:'+id).catch(()=>{});
      audioDirty=false;
    }
    await dbOp('put','p:'+id,docOf(Q));
    const live=new Set(Q.scenes.map(s=>s.id));
    for(const sid of lastSids)if(!live.has(sid))await dbOp('del','b:'+id+':'+sid).catch(()=>{});
    lastSids=live;
    let e=IDX.find(x=>x.id==id);if(!e){e={id};IDX.push(e)}
    e.title=Q.title||'بدون عنوان';e.n=Q.scenes.length;e.t=Date.now();
    const f=Q.scenes[0];if(!f){e.th=null;e.thid=null}else if(e.thid!=f.id){e.thid=f.id;e.th=f.th||await thumb(f.img)}
    await dbOp('put','idx',IDX);await dbOp('put','last',id);
    if(saveErr){saveErr=false;toast('✅ عاد الحفظ التلقائي للعمل.')}
    quotaWatch();remind();
  }catch(x){saveFailed(x)}
}
// Warn before the quota fills rather than at the moment a write fails.
async function quotaWatch(){
  if(warned||!navigator.storage?.estimate)return;
  try{const{usage,quota}=await navigator.storage.estimate();
    if(quota&&usage/quota>.8){warned=true;
      toast(`⚠️ استهلكت ${Math.round(usage/quota*100)}% من مساحة المتصفح. صدّر مشاريعك المهمة كملفات على جهازك.`,10000)}
  }catch(e){}
}
// Load a project and rehydrate its images as blob: URLs.
// Projects stored in the pre-Blob format are migrated on read.
async function loadProj(id){
  const doc=await dbOp('get','p:'+id);if(!doc)return null;
  doc.scenes=Array.isArray(doc.scenes)?doc.scenes:[];
  for(const s of doc.scenes){
    if(typeof s.img=='string'&&s.img.startsWith('data:')){   // legacy inline data: URL
      try{s.blob=dataToBlob(s.img);s.img=objURL(s.blob);dirty.add(s.id)}catch(e){s.blob=null;s.img=''}
    }else{
      const b=await dbOp('get','b:'+id+':'+s.id).catch(()=>null);
      if(b instanceof Blob){s.blob=b;s.img=objURL(b)}else{s.blob=null;s.img=''}
    }
    if(!Array.isArray(s.hs))s.hs=[];
  }
  doc.scenes=doc.scenes.filter(s=>s.img);
  if(doc.audio){
    if(typeof doc.audio.src=='string'&&doc.audio.src.startsWith('data:')){
      try{doc.audio.blob=dataToBlob(doc.audio.src);doc.audio.src=objURL(doc.audio.blob);audioDirty=true}catch(e){delete doc.audio}
    }else{
      const b=await dbOp('get','a:'+id).catch(()=>null);
      if(b instanceof Blob){doc.audio.blob=b;doc.audio.src=objURL(b)}else delete doc.audio;
    }
  }
  return doc;
}
function revokeProj(Q){(Q?.scenes||[]).forEach(s=>freeURL(s.img));freeURL(Q?.audio?.src)}
// ───────────── renderer ─────────────
const rd=new THREE.WebGLRenderer({antialias:true});rd.setPixelRatio(Math.min(devicePixelRatio,2));rd.outputEncoding=THREE.sRGBEncoding;rd.xr.enabled=true;rd.xr.setReferenceSpaceType('local');
const el=rd.domElement;$('stage').prepend(el);
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(75,1,.1,2000);cam.rotation.order='YXZ';sc.add(cam);
const world=new THREE.Group();sc.add(world);
const gm=new THREE.SphereGeometry(R,64,40);gm.scale(-1,1,1);
const mat=new THREE.MeshBasicMaterial(),sphere=new THREE.Mesh(gm,mat);world.add(sphere);
const hs=new THREE.Group();world.add(hs);
const V=(u,v,r)=>{const p=2*PI*u,t=PI*v;return new THREE.Vector3(Math.cos(p)*Math.sin(t),Math.cos(t),Math.sin(p)*Math.sin(t)).multiplyScalar(r)};
const uv=d=>{d=d.clone().applyAxisAngle(new THREE.Vector3(0,1,0),-world.rotation.y).normalize();return{u:(Math.atan2(d.z,d.x)/(2*PI)+1)%1,v:Math.acos(d.y)/PI}};
const fit=()=>{const w=$('stage').clientWidth,h=$('stage').clientHeight;if(!w||!h)return;rd.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()};
new ResizeObserver(fit).observe($('stage'));
// ───────────── hotspot sprites ─────────────
function icon(x,sh,c){
  x.lineCap=x.lineJoin='round';x.lineWidth=10;x.strokeStyle='#fff';x.fillStyle=c;x.beginPath();
  if(sh=='ring'){x.arc(0,0,64,0,7);x.lineWidth=18;x.strokeStyle=c;x.stroke();x.lineWidth=5;x.strokeStyle='#fff';x.beginPath();x.arc(0,0,76,0,7);x.stroke()}
  else if(sh=='dot'){x.arc(0,0,40,0,7);x.fill();x.stroke()}
  else if(sh=='pin'){x.moveTo(0,70);x.bezierCurveTo(-80,-5,-62,-70,0,-70);x.bezierCurveTo(62,-70,80,-5,0,70);x.fill();x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(0,-18,18,0,7);x.fill()}
  else if(sh=='star'){for(let i=0;i<10;i++){const r=i%2?32:72,a=i*PI/5-PI/2;x.lineTo(r*Math.cos(a),r*Math.sin(a))}x.closePath();x.fill();x.stroke()}
  else{x.arc(0,0,68,0,7);x.fill();x.stroke();x.strokeStyle=x.fillStyle='#fff';
    if(sh=='info'){x.font='800 84px Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.fillText('i',0,4)}
    else{x.lineWidth=14;x.beginPath();x.moveTo(-28,16);x.lineTo(0,-20);x.lineTo(28,16);x.stroke()}}
}
function mkHS(h){
  const c=document.createElement('canvas');c.width=512;c.height=320;const x=c.getContext('2d');x.translate(256,100);
  if(mode=='edit'&&sel==h.id){x.setLineDash([14,12]);x.lineWidth=6;x.strokeStyle='#fff';x.beginPath();x.arc(0,0,98,0,7);x.stroke();x.setLineDash([])}
  icon(x,h.shape,h.color);x.setTransform(1,0,0,1,0,0);
  if(h.label){x.font='700 40px system-ui,Tahoma,Arial';x.textAlign='center';x.textBaseline='alphabetic';const w=Math.min(500,x.measureText(h.label).width+40);x.fillStyle='rgba(0,0,0,.6)';x.fillRect(256-w/2,208,w,60);x.fillStyle='#fff';x.fillText(h.label,256,252,w-30)}
  const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,depthTest:false,transparent:true}));sp.center.set(.5,1-100/320);sp.renderOrder=10;return sp;
}
function buildHS(){
  hs.children.slice().forEach(c=>{c.material.map.dispose();c.material.dispose()});hs.clear();dw=hov=null;
  (S[cur]?.hs||[]).forEach(h=>{const sp=mkHS(h);sp.position.copy(V(h.u,h.v,380));sp.userData.h=h;hs.add(sp)});preload();
}
// ───────────── scene loading ─────────────
async function go(i){
  const s=S[i];if(!s)return;cur=i;sel=null;placing=null;$('pop').hidden=true;hideVP();
  if(!TX[s.id]){busy(1);try{const im=new Image();im.src=s.img;await im.decode();const t=new THREE.Texture(im);t.encoding=THREE.sRGBEncoding;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;t.needsUpdate=true;TX[s.id]=t}catch(e){busy(-1);return}busy(-1)}
  if(cur!=i)return;
  mat.map=TX[s.id];mat.needsUpdate=true;ub=s.u0||0;world.rotation.y=2*PI*ub+PI/2;yaw=0;pitch=s.p0||0;if(gyro)calib();buildHS();ui();
}
async function addFiles(fs){
  let first=-1;$('msg').textContent='';
  for(const f of fs){
    if(!f.type.startsWith('image/'))continue;
    try{const im=await createImageBitmap(f),flat=Math.abs(im.width/im.height-2)>.15,c=document.createElement('canvas'),x=c.getContext('2d');
      if(flat){const W=4096,H=2048,s=Math.min(W/4/im.width,H*.7/im.height),w=im.width*s,h=im.height*s;c.width=W;c.height=H;x.fillStyle='#111';x.fillRect(0,0,W,H);x.drawImage(im,(W-w)/2,(H-h)/2,w,h);$('msg').textContent='تنبيه: إحدى الصور ليست بانوراما 360°، وُضعت كلوحة مسطحة في وسط المشهد.'}
      else{const k=Math.min(1,4096/im.width);c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);x.drawImage(im,0,0,c.width,c.height)}
      const bl=await canvasBlob(c,'image/jpeg',.86),sid=uid();
      S.push({id:sid,name:f.name.replace(/\.[^.]+$/,''),img:objURL(bl),blob:bl,th:mkTh(c),u0:flat?.5:0,p0:0,hs:[]});
      dirty.add(sid);if(first<0)first=S.length-1;
    }catch(e){$('msg').textContent='تعذر قراءة إحدى الصور.'}
  }
  save();if(first>=0)go(first);else ui();
}
// ───────────── ui ─────────────
const H=()=>S[cur]?.hs.find(h=>h.id==sel);
function renderScenes(){
  const m=d=>S.map((s,i)=>d?`<button data-i="${i}" draggable="true" class="sth ${i==cur?'on':''}">${s.th?`<img src="${esc(s.th)}" alt="" draggable="false">`:'<span class="ph"></span>'}<span>${esc(s.name)}</span></button>`:`<button data-i="${i}" class="${i==cur?'on':''}">${esc(s.name)}</button>`).join('');
  $('scenes').innerHTML=m(1);$('sb').innerHTML=S.length>1?m(0):'';$('title').textContent=S[cur]?.name||'';$('title').hidden=!S[cur];
  const sh=$('shint');if(sh)sh.hidden=S.length<2;
}
function renderList(){
  $('hlist').innerHTML=(S[cur]?.hs||[]).map(h=>`<button data-id="${h.id}" class="${h.id==sel?'on':''}">${h.type=='link'?'⇢':'ℹ'} ${esc(h.label||(h.type=='link'?'انتقال':'معلومات'))}</button>`).join('');
}
const upd=o=>{Object.assign(H(),o);buildHS();renderList();save()};
const on=(id,ev,f)=>{const e=$(id);if(e)e.addEventListener(ev,f)};
function renderProps(){
  const h=H(),p=$('hprops');$('hint2').textContent=placing?'اضغط على البانوراما لتحديد المكان':'';
  if(!h){p.innerHTML='';return}
  const shp=[['arrow','سهم'],['ring','حلقة'],['dot','نقطة'],['pin','دبوس'],['star','نجمة'],['info','معلومات']];
  p.innerHTML=`<label>العنوان<input id="pl" value="${esc(h.label)}"></label>`+
  (h.type=='link'?`<label>الوجهة<select id="pt">${S.filter(s=>s.id!=S[cur].id).map(s=>`<option value="${s.id}" ${s.id==h.to?'selected':''}>${esc(s.name)}</option>`).join('')}</select></label>`
    :`<label>النص<textarea id="px" rows="3">${esc(h.text)}</textarea></label>`)+
  `<label>الشكل<select id="ps">${shp.map(([k,n])=>`<option value="${k}" ${k==h.shape?'selected':''}>${n}</option>`).join('')}</select></label>
  <label>اللون<input id="pc" type="color" value="${h.color}"></label>
  <label>الحجم<input id="pz" type="range" min=".5" max="2.5" step=".1" value="${h.size}"></label>
  <p id="hint3">اسحب النقطة في الصورة لتغيير مكانها</p><button id="pd" class="dng">حذف النقطة</button>`;
  on('pl','input',e=>upd({label:e.target.value}));on('pt','change',e=>upd({to:e.target.value}));on('px','input',e=>upd({text:e.target.value}));
  on('ps','change',e=>upd({shape:e.target.value}));on('pc','input',e=>upd({color:e.target.value}));on('pz','input',e=>upd({size:+e.target.value}));
  on('pm','click',()=>{placing='move';renderProps()});
  on('pd','click',()=>{S[cur].hs=S[cur].hs.filter(x=>x.id!=sel);sel=null;buildHS();ui();save()});
}
function ui(){
  $('root').classList.toggle('view',mode=='view');$('empty').hidden=S.length>0;
  $('sset').hidden=$('hsec').hidden=!S[cur];$('cmp').hidden=S[cur]?.n==null;$('back').hidden=!(mode=='view'&&!EMB);
  if(S[cur]&&document.activeElement!=$('sname'))$('sname').value=S[cur].name;
  renderScenes();renderList();renderProps();extras();setTimeout(fit,0);
}
[$('scenes'),$('sb')].forEach(e=>e.onclick=ev=>{const b=ev.target.closest('button');if(b)go(+b.dataset.i)});
$('hlist').onclick=e=>{const b=e.target.closest('button');if(b){sel=b.dataset.id;placing=null;buildHS();ui()}};
$('file').onchange=e=>{addFiles([...e.target.files]);e.target.value=''};
$('stage').ondragover=e=>e.preventDefault();$('stage').ondrop=e=>{e.preventDefault();addFiles([...e.dataTransfer.files])};
$('ptitle').oninput=e=>{P.title=e.target.value;save()};$('auto').onchange=e=>{P.auto=e.target.checked;save()};
$('sname').oninput=e=>{S[cur].name=e.target.value;renderScenes();save()};
$('sstart').onclick=()=>{const d=new THREE.Vector3();cam.getWorldDirection(d);const r=uv(d);S[cur].u0=r.u;S[cur].p0=PI/2-r.v*PI;save();go(cur);$('msg').textContent='تم حفظ زاوية البداية لهذا المشهد.'};
let dc=0;$('sdel').onclick=()=>{
  if(!dc){dc=1;$('sdel').textContent='تأكيد الحذف؟';setTimeout(()=>{dc=0;$('sdel').textContent='حذف المشهد'},3000);return}
  dc=0;$('sdel').textContent='حذف المشهد';const id=S[cur].id;delete TX[id];S.splice(cur,1);S.forEach(s=>s.hs=s.hs.filter(h=>h.to!=id));
  save();if(S.length)go(Math.min(cur,S.length-1));else{cur=-1;mat.map=null;mat.needsUpdate=true;buildHS();ui()}
};
$('addl').onclick=()=>{if(S.length<2)$('msg').textContent='أضف مشهداً ثانياً قبل إنشاء نقطة انتقال.';else{placing='link';sel=null;buildHS();renderList();renderProps()}};
$('addi').onclick=()=>{placing='info';sel=null;buildHS();renderList();renderProps()};
$('prev').onclick=()=>{mode='view';sel=placing=null;buildHS();ui()};
$('back').onclick=()=>{mode='edit';buildHS();ui()};
const getTxt=async u=>{const r=await fetch(u);if(!r.ok)throw new Error(u);return r.text()};
function saveFile(name,data,mime){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type:mime}));a.href=url;a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove()},5000)}
const fname=ext=>((P.title||'tour').replace(/[\\\/:*?"<>|]+/g,'_').trim()||'tour')+ext;
// Portable form of a project: images become base64 here only, for export and
// for saving a .json file. Never for storage.
async function portable(Q){
  const out=docOf(Q);out.scenes=[];
  for(const s of Q.scenes){const{blob,...r}=s;out.scenes.push({...r,img:blob?await toDataURL(blob):s.img})}
  if(Q.audio)out.audio={name:Q.audio.name,vol:Q.audio.vol,src:Q.audio.blob?await toDataURL(Q.audio.blob):Q.audio.src};
  return out;
}
const fullJSON=()=>portable(P);
$('exp').onclick=async()=>{
  if(!S.length){toast('أضف مشهداً واحداً على الأقل قبل التصدير.');return}
  toast('جارٍ تجهيز الملف…',60000);
  try{
    const [css,three,app,data]=await Promise.all([getTxt('style.css'),getTxt('vendor/three.min.js'),getTxt('app.js'),fullJSON()]);
    const html=`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(P.title)}</title><style>${css}</style></head><body><div id="root" class="view">${SHELL}</div><script>${three}<\/script><script>window.__TOUR__=${JSON.stringify(data).replace(/</g,'\\u003c')};${app}<\/script></body></html>`;
    saveFile(fname('.html'),html,'text/html');edits=0;
    toast(`✅ تم تنزيل الجولة المستقلة (${(html.length/1048576).toFixed(1)} ميجابايت).`);
  }catch(e){toast('تعذّر التصدير. شغّل الموقع عبر https (مثل GitHub Pages) أو خادم محلي — التصدير لا يعمل عند فتح الملف مباشرة بـ file://',9000)}
};
let dg=-1;
function mv(a,b){if(a==b||b<0||b>=S.length)return;const id=S[cur].id,[s]=S.splice(a,1);S.splice(b,0,s);cur=S.findIndex(x=>x.id==id);save();ui()}
$('scenes').ondragstart=e=>{const b=e.target.closest('button');if(b){dg=+b.dataset.i;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',String(dg))}};
$('scenes').ondragover=e=>{if(dg>=0)e.preventDefault()};
$('scenes').ondrop=e=>{e.preventDefault();const b=e.target.closest('button');if(b&&dg>=0)mv(dg,+b.dataset.i);dg=-1};
$('mvb').onclick=()=>mv(cur,cur-1);$('mva').onclick=()=>mv(cur,cur+1);
$('snorth').onclick=()=>{const s=S[cur];s.n=((ub-yaw/(2*PI))%1+1)%1;save();ui();$('msg').textContent='تم تحديد الشمال لهذا المشهد، وتظهر البوصلة في الزاوية.'};
$('cmp').onclick=()=>{const s=S[cur];if(s&&s.n!=null)yaw=2*PI*(ub-s.n)};
$('psave').onclick=async()=>{
  if(!S.length){toast('لا يوجد ما يُحفظ بعد.');return}
  toast('جارٍ تجهيز ملف المشروع…',60000);
  try{saveFile(fname('.json'),JSON.stringify(await fullJSON()),'application/json');edits=0;
    toast('✅ تم تنزيل ملف المشروع على جهازك. احتفظ به كنسخة احتياطية.')}
  catch(x){toast('تعذّر تجهيز ملف المشروع.')}
};
$('pfile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
  toast('جارٍ الاستيراد…',60000);
  try{const d=JSON.parse(await f.text());
    if(d.v&&d.v>SCHEMA)throw new Error('newer');
    d.scenes=(Array.isArray(d.scenes)?d.scenes:[]).filter(s=>typeof s.img=='string'&&s.img.startsWith('data:image/')).map(s=>({...s,hs:Array.isArray(s.hs)?s.hs:[]}));
    if(!d.scenes.length)throw new Error('empty');
    for(const s of d.scenes){s.blob=dataToBlob(s.img);s.img=objURL(s.blob)}
    if(d.audio&&typeof d.audio.src=='string'&&d.audio.src.startsWith('data:')){d.audio.blob=dataToBlob(d.audio.src);d.audio.src=objURL(d.audio.blob)}else delete d.audio;
    d.title=d.title||'مشروع مستورد';
    await flush();const nid=uid()+uid();
    setProj(nid,d);d.scenes.forEach(s=>dirty.add(s.id));audioDirty=!!d.audio;lastSids=new Set();
    await flush();closeLib();
    toast('✅ تم استيراد المشروع إلى المكتبة وفتحه.')}
  catch(x){toast(x.message=='newer'?'هذا الملف من إصدار أحدث من التطبيق. حدّث الصفحة ثم أعد المحاولة.':'ملف المشروع غير صالح أو لا يحتوي على أي مشهد.')}};
// ───────────── project library ─────────────
const safeName=t=>(String(t||'tour').replace(/[\\\/:*?"<>|]+/g,'_').trim()||'tour');
function closeLib(){const m=$('libm');if(m)m.hidden=true}
function setProj(id,d){
  if(P!==d)revokeProj(P);
  curId=id;P=d;S=P.scenes;for(const k in TX)delete TX[k];resetHist();$('pdesc').value=P.desc||'';cur=-1;sel=placing=null;mode='edit';
  dirty=new Set();audioDirty=false;lastSids=new Set(S.map(s=>s.id));edits=0;
  $('ptitle').value=P.title||'';$('auto').checked=!!P.auto;$('wk').checked=P.walk!==false;$('msg').textContent='';
  if(S.length)go(0);else{mat.map=null;mat.needsUpdate=true;buildHS();ui()}
}
async function openProj(id){
  if(id==curId)return;await flush();
  try{const d=await loadProj(id);if(d){setProj(id,d);await dbOp('put','last',id)}else toast('تعذّر فتح المشروع.')}
  catch(e){toast('تعذّر فتح المشروع من التخزين.')}
}
async function newProj(){await flush();setProj(uid()+uid(),{v:SCHEMA,title:'مشروع جديد',scenes:[]});await flush();closeLib()}
async function dupProj(id){
  await flush();const d=await dbOp('get','p:'+id);if(!d)return;
  const nid=uid()+uid(),e=IDX.find(x=>x.id==id)||{};
  try{
    for(const s of (d.scenes||[])){const b=await dbOp('get','b:'+id+':'+s.id).catch(()=>null);if(b instanceof Blob)await dbOp('put','b:'+nid+':'+s.id,b)}
    const a=await dbOp('get','a:'+id).catch(()=>null);if(a instanceof Blob)await dbOp('put','a:'+nid,a);
    const n=JSON.parse(JSON.stringify(d));n.title=(d.title||'')+' (نسخة)';
    await dbOp('put','p:'+nid,n);IDX.push({...e,id:nid,title:n.title,t:Date.now()});await dbOp('put','idx',IDX);
    toast('✅ تم تكرار المشروع.');
  }catch(x){saveFailed(x)}
}
async function delProj(id){
  try{
    const d=await dbOp('get','p:'+id).catch(()=>null);
    for(const s of (d?.scenes||[]))await dbOp('del','b:'+id+':'+s.id).catch(()=>{});
    await dbOp('del','a:'+id).catch(()=>{});
    await dbOp('del','p:'+id);
    IDX=IDX.filter(x=>x.id!=id);await dbOp('put','idx',IDX);
  }catch(x){saveFailed(x);return}
  if(id==curId){curId=null;clearTimeout(st);if(IDX.length)await openProj(IDX[0].id);else await newProj()}
}
function renderLib(){
  const L=[...IDX].sort((a,b)=>b.t-a.t);
  $('libg').innerHTML=L.length?L.map(e=>`<div class="pc ${e.id==curId?'on':''}" data-id="${esc(e.id)}">${e.th?`<img src="${esc(e.th)}" alt="">`:'<div class="ph"></div>'}<div class="in"><b>${esc(e.title)}</b><small>${e.n||0} مشهد · ${new Date(e.t).toLocaleDateString('en-GB')}</small><div class="row"><button data-a="open">${e.id==curId?'المفتوح حالياً':'فتح'}</button><button data-a="dup">تكرار</button></div><div class="row"><button data-a="exp">تصدير ملف</button><button data-a="del" class="dng">حذف</button></div></div></div>`).join(''):'<p>لا توجد مشاريع بعد.</p>';
}
if(!EMB){
  $('lib').onclick=()=>{renderLib();$('libm').hidden=false};
  $('libx').onclick=closeLib;$('libn').onclick=newProj;
  $('libm').onclick=e=>{if(e.target==$('libm'))closeLib()};
  addEventListener('keydown',e=>{if(e.key=='Escape')closeLib()});
  addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
  $('libg').onclick=async ev=>{
    const b=ev.target.closest('button');if(!b)return;const id=b.closest('.pc').dataset.id,a=b.dataset.a;
    if(a=='open'){await openProj(id);closeLib();return}
    if(a=='dup')await dupProj(id);
    else if(a=='exp'){
      await flush();toast('جارٍ تجهيز الملف…',60000);
      try{
        let out;
        if(id==curId)out=await fullJSON();
        else{const d=await loadProj(id);if(!d)throw new Error('missing');out=await portable(d);revokeProj(d)}
        saveFile(safeName(out.title)+'.json',JSON.stringify(out),'application/json');
        toast('✅ تم تنزيل ملف المشروع على جهازك.');
      }catch(x){toast('تعذّر تصدير هذا المشروع.')}
    }
    else if(a=='del'){if(b.dataset.c!='1'){b.dataset.c='1';b.textContent='تأكيد الحذف؟';setTimeout(()=>{b.dataset.c='';b.textContent='حذف'},3000);return}await delProj(id)}
    renderLib();
  };
}
// ───────────── walkthrough transition ─────────────
let ub=0,walking=false;
const Yax=new THREE.Vector3(0,1,0),ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
const m2=new THREE.Mesh(gm,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthTest:false,depthWrite:false}));m2.visible=false;m2.renderOrder=5;
const w2=new THREE.Group();w2.add(m2);sc.add(w2);
const setFov=v=>{cam.fov=Math.max(25,v);cam.updateProjectionMatrix()};
const anim=(ms,f)=>new Promise(r=>{const t=performance.now(),s=n=>{const k=Math.min(1,(n-t)/ms);f(k);k<1?requestAnimationFrame(s):r()};requestAnimationFrame(s)});
async function tex(s){if(!TX[s.id]){try{const im=new Image();im.src=s.img;await im.decode();const t=new THREE.Texture(im);t.encoding=THREE.sRGBEncoding;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;t.needsUpdate=true;TX[s.id]=t}catch(e){return false}}return true}
async function walk(i,h){
  if(walking||i==cur)return;const s=S[i],o=S[cur];walking=true;$('pop').hidden=true;
  try{
    if(!await tex(s)){walking=false;return go(i)}
    if(!gyro){
      const d=V(h.u,h.v,1).applyAxisAngle(Yax,world.rotation.y),ty=Math.atan2(-d.x,-d.z),tp=Math.max(-.3,Math.min(.3,Math.asin(d.y)*.6)),y0=yaw,p0=pitch,dy=Math.atan2(Math.sin(ty-y0),Math.cos(ty-y0));
      await anim(450,k=>{k=ease(k);yaw=y0+dy*k;pitch=p0+(tp-p0)*k;setFov(fov-8*k)});
    }
    const u=ub-yaw/(2*PI),ut=o.n!=null&&s.n!=null?s.n+(u-o.n):(s.u0||0),ub2=ut+yaw/(2*PI);
    w2.rotation.y=2*PI*ub2+PI/2;m2.material.map=TX[s.id];m2.material.needsUpdate=true;m2.material.opacity=0;m2.visible=true;hs.visible=false;
    await anim(650,k=>{m2.material.opacity=ease(k);setFov(fov-8-22*k)});
    mat.map=TX[s.id];mat.needsUpdate=true;ub=ub2;world.rotation.y=w2.rotation.y;cur=i;sel=null;buildHS();hs.visible=true;m2.visible=false;ui();
    await anim(550,k=>setFov(fov-30*(1-ease(k))));
  }finally{setFov(fov);m2.visible=false;hs.visible=true;walking=false}
}
$('wk').onchange=e=>{P.walk=e.target.checked;save()};
// ───────────── gyroscope ─────────────
let gyro=false,haveG=false,calibN=false,yawOff=0;
const gq=new THREE.Quaternion(),gq1=new THREE.Quaternion(-Math.sqrt(.5),0,0,Math.sqrt(.5)),gq0=new THREE.Quaternion(),gzv=new THREE.Vector3(0,0,1),ge=new THREE.Euler(),gf=new THREE.Vector3();
const gdir=()=>gf.set(0,0,-1).applyQuaternion(gq);
function calib(){if(haveG){const f=gdir();yawOff=yaw-Math.atan2(-f.x,-f.z)}}
function onori(e){if(e.alpha==null)return;const r=THREE.MathUtils.degToRad,o=r(screen.orientation?.angle??window.orientation??0);
  ge.set(r(e.beta),r(e.alpha),-r(e.gamma),'YXZ');gq.setFromEuler(ge).multiply(gq1).multiply(gq0.setFromAxisAngle(gzv,-o));haveG=true;if(calibN){calibN=false;calib()}}
const gnote=t=>{$('gy').textContent=t;setTimeout(()=>{$('gy').textContent='جيروسكوب'},2500)};
function goff(){gyro=false;removeEventListener('deviceorientation',onori);$('gy').classList.remove('on')}
if(window.DeviceOrientationEvent&&navigator.maxTouchPoints>0)$('gy').hidden=false;
$('gy').onclick=async()=>{
  if(gyro){goff();return}
  try{
    if(typeof DeviceOrientationEvent.requestPermission=='function'&&await DeviceOrientationEvent.requestPermission()!='granted'){gnote('لم يُمنح الإذن');return}
    haveG=false;calibN=true;gyro=true;addEventListener('deviceorientation',onori);$('gy').classList.add('on');
    setTimeout(()=>{if(gyro&&!haveG){goff();gnote('الحساس غير متاح')}},1500);
  }catch(e){goff();gnote('الحساس غير متاح')}
};
// ───────────── pointer interaction ─────────────
const rc=new THREE.Raycaster();rc.camera=cam;
const at=e=>{const r=el.getBoundingClientRect();rc.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),cam);const x=rc.intersectObjects(hs.children,false);return x.length?x[0].object.userData.h:null};
const pick=(o,d)=>{rc.set(o,d);const x=rc.intersectObjects(vp.visible?[...hs.children,vpp,vpx]:hs.children,false);return x.length?x[0].object:null};
function act(h){
  if(h.type=='link'){const k=S.findIndex(s=>s.id==h.to);if(k>=0)(P.walk!==false&&!rd.xr.isPresenting?walk(k,h):go(k))}
  else if(rd.xr.isPresenting)showVP(h);else{const p=$('pop');p.innerHTML=`<b>${esc(h.label)}</b><p>${esc(h.text)}</p><button>إغلاق</button>`;p.hidden=false;p.querySelector('button').onclick=()=>p.hidden=true}
}
el.addEventListener('pointerdown',e=>{if(walking)return;
  if(mode=='edit'&&!placing){const h=at(e);if(h){hd={h,sp:hs.children.find(c=>c.userData.h===h),x:e.clientX,y:e.clientY,m:0,moved:false};sel=h.id;el.setPointerCapture(e.pointerId);return}}
  drag={x:e.clientX,y:e.clientY,m:0};el.setPointerCapture(e.pointerId);el.style.cursor='grabbing'});
el.addEventListener('pointermove',e=>{
  if(hd){hd.m+=Math.abs(e.clientX-hd.x)+Math.abs(e.clientY-hd.y);hd.x=e.clientX;hd.y=e.clientY;
    if(hd.m>=6&&hd.sp){hd.moved=true;const r=el.getBoundingClientRect();rc.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),cam);const p=uv(rc.ray.direction);hd.h.u=p.u;hd.h.v=p.v;hd.sp.position.copy(V(p.u,p.v,380));el.style.cursor='grabbing'}return}
  if(drag){const k=cam.fov/el.clientHeight*PI/180,dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(gyro)yawOff+=dx*k;else{yaw+=dx*k;pitch=Math.max(-1.5,Math.min(1.5,pitch+dy*k))}drag.m+=Math.abs(dx)+Math.abs(dy);drag.x=e.clientX;drag.y=e.clientY}
  else{hov=at(e);el.style.cursor=placing?'crosshair':hov?'pointer':'grab'}
});
el.addEventListener('pointerup',e=>{
  if(hd){const d=hd;hd=null;el.style.cursor='grab';if(d.moved)save();buildHS();ui();return}
  const was=drag;drag=null;el.style.cursor='grab';if(!was||was.m>=6)return;
  const h=at(e);
  if(mode=='view'){if(h)act(h);return}
  if(placing){
    const p=uv(rc.ray.direction);
    if(placing=='move')Object.assign(H(),p);
    else{const o=S.find(s=>s.id!=S[cur].id),n={id:uid(),type:placing,label:'',text:'',to:o?.id,shape:placing=='info'?'info':'arrow',color:'#f59e0b',size:1,...p};S[cur].hs.push(n);sel=n.id}
    placing=null;buildHS();ui();save();return;
  }
  sel=h?h.id:null;buildHS();ui();
});
el.addEventListener('wheel',e=>{e.preventDefault();fov=Math.max(40,Math.min(95,fov+e.deltaY*.04));cam.fov=fov;cam.updateProjectionMatrix()},{passive:false});
// ───────────── webxr ─────────────
for(let i=0;i<2;i++){
  const c=rd.xr.getController(i);
  c.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-4)]),new THREE.LineBasicMaterial({color:0xffffff})));
  c.addEventListener('selectstart',()=>{const m=new THREE.Matrix4().extractRotation(c.matrixWorld),o=new THREE.Vector3().setFromMatrixPosition(c.matrixWorld),d=new THREE.Vector3(0,0,-1).applyMatrix4(m),x=pick(o,d);if(x){if(x.userData.vp)hideVP();else act(x.userData.h)}});
  sc.add(c);
}
if(navigator.xr)navigator.xr.isSessionSupported('immersive-vr').then(ok=>{if(ok)$('vr').hidden=false}).catch(()=>{});
$('vr').onclick=async()=>{try{mode='view';ui();const s=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local','local-floor']});await rd.xr.setSession(s)}catch(e){$('msg').textContent='تعذر تشغيل وضع VR.'}};
rd.setAnimationLoop(t=>{
  const dt=Math.min((t-t0)/1000,.1);t0=t;const xr=rd.xr.isPresenting;
  sphere.visible=!!mat.map;   // untextured MeshBasicMaterial is white; hide it so the empty state stays readable
  if(!xr){if(P.auto&&mode=='view'&&!drag&&!gyro)yaw-=dt*.08;if(gyro&&haveG){const f=gdir();yaw=yawOff+Math.atan2(-f.x,-f.z);pitch=Math.asin(Math.max(-1,Math.min(1,f.y)))}cam.rotation.set(pitch,yaw,0);const s=S[cur];if(s&&s.n!=null)$('cg').setAttribute('transform',`rotate(${-(ub-yaw/(2*PI)-s.n)*360})`)}
  let gz=null;if(xr){const o=new THREE.Vector3(),d=new THREE.Vector3();cam.getWorldPosition(o);cam.getWorldDirection(d);gz=pick(o,d)}
  if(gz!==dw){dw=gz;dp=0}
  const hz=gz&&gz.userData.h,need=hz&&hz.type=='info'?3:1.6;if(gz&&(hz||gz===vpx)){dp+=dt;if(dp>need){dp=0;dw=null;hz?act(hz):hideVP()}}
  hs.children.forEach(sp=>{const h=sp.userData.h,k=(h.size||1)*(sp==dw||sp.userData.h==hov?1.2:1)*(sp==dw?1+dp/need*.3:1);sp.scale.set(70*k,43.75*k,1)});
  rd.render(sc,cam);
});
// ───────────── hotspot dragging, thumbnails ─────────────
let hd=null,thBusy=false;
el.addEventListener('pointercancel',()=>{hd=null;drag=null});
function mkTh(c){const t=document.createElement('canvas');t.width=160;t.height=80;t.getContext('2d').drawImage(c,0,0,160,80);return t.toDataURL('image/jpeg',.6)}
async function fillTh(){
  if(thBusy||EMB)return;thBusy=true;let any=false;
  try{for(const s of S){if(s.th)continue;const im=new Image();im.src=s.img;await im.decode();s.th=mkTh(im);any=true;renderScenes()}}catch(e){}
  thBusy=false;if(any){clearTimeout(st);st=setTimeout(flush,400)}
}
// ───────────── vr info panel, preload, undo/redo, start screen ─────────────
const vp=new THREE.Group();vp.visible=false;sc.add(vp);
const vpp=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1),new THREE.MeshBasicMaterial({transparent:true,depthTest:false}));vpp.renderOrder=20;vpp.userData.vp=1;
const vpx=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#b45309';x.beginPath();x.arc(64,64,60,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=10;x.lineCap='round';x.beginPath();x.moveTo(42,42);x.lineTo(86,86);x.moveTo(86,42);x.lineTo(42,86);x.stroke();
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;const m=new THREE.Mesh(new THREE.CircleGeometry(.1,32),new THREE.MeshBasicMaterial({map:t,transparent:true,depthTest:false}));m.position.set(-.7,.4,.01);m.renderOrder=21;m.userData.vp=1;return m})();
vp.add(vpp,vpx);
const hideVP=()=>{vp.visible=false};
function showVP(h){
  const c=document.createElement('canvas');c.width=1024;c.height=640;const x=c.getContext('2d');
  x.fillStyle='rgba(18,20,26,.94)';x.strokeStyle='#f59e0b';x.lineWidth=8;x.beginPath();if(x.roundRect)x.roundRect(8,8,1008,624,40);else x.rect(8,8,1008,624);x.fill();x.stroke();
  x.direction='rtl';x.textAlign='right';x.fillStyle='#fff';x.font='700 56px system-ui,Tahoma,Arial';x.fillText(h.label||'معلومات',960,110,780);
  x.font='400 40px system-ui,Tahoma,Arial';x.fillStyle='#e5e7eb';
  const lines=[];let l='';for(const w of (h.text||'').split(/\s+/)){const n=l?l+' '+w:w;if(x.measureText(n).width>900&&l){lines.push(l);l=w}else l=n}if(l)lines.push(l);
  lines.slice(0,8).forEach((s,i)=>x.fillText(i==7&&lines.length>8?s+'…':s,960,190+i*54));
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;if(vpp.material.map)vpp.material.map.dispose();vpp.material.map=t;vpp.material.needsUpdate=true;
  const o=new THREE.Vector3(),d=new THREE.Vector3();cam.getWorldPosition(o);cam.getWorldDirection(d);d.y=0;if(d.lengthSq()<1e-4)d.set(0,0,-1);d.normalize();
  vp.position.copy(o).addScaledVector(d,2.2);vp.position.y=o.y-.1;vp.lookAt(o);vp.visible=true;
}
rd.xr.addEventListener('sessionend',hideVP);
let bz=0;const busy=d=>{bz+=d;$('bar').hidden=bz<=0};
function preload(){const s=S[cur];if(!s)return;new Set((s.hs||[]).filter(h=>h.type=='link').map(h=>h.to)).forEach(id=>{const t=S.find(x=>x.id==id);if(t&&!TX[t.id])tex(t)})}
let hist=[],hp=-1,hst,restoring=false;
const lite=()=>JSON.stringify(S.map(s=>({...s,img:0,th:0,blob:0})));
const clone=s=>({...s,hs:JSON.parse(JSON.stringify(s.hs||[])),pp:s.pp&&{...s.pp}});
function updUndo(){const u=$('undo'),r=$('redo');if(u)u.disabled=hp<=0;if(r)r.disabled=hp>=hist.length-1}
function snapNow(){clearTimeout(hst);if(restoring||EMB)return;const k=lite();if(hp>=0&&hist[hp].k==k)return;hist=hist.slice(0,hp+1);hist.push({k,s:S.map(clone)});if(hist.length>60)hist.shift();hp=hist.length-1;updUndo()}
const snap=()=>{clearTimeout(hst);hst=setTimeout(snapNow,500)};
function resetHist(){clearTimeout(hst);hist=[];hp=-1;snapNow()}
function goHist(i){
  if(i<0||i>=hist.length)return;restoring=true;hp=i;const id=S[cur]?.id;
  const oth=Object.fromEntries(S.map(s=>[s.id,s.th]));P.scenes=S=hist[i].s.map(clone);S.forEach(s=>{if(!s.th&&oth[s.id])s.th=oth[s.id]});
  S.forEach(s=>{if(s.blob&&!lastSids.has(s.id))dirty.add(s.id)});   // scene restored by undo after its blob was deleted
  cur=S.findIndex(s=>s.id==id);sel=null;placing=null;restoring=false;
  clearTimeout(st);st=setTimeout(flush,400);updUndo();
  if(cur>=0){buildHS();ui()}else if(S.length)go(0);else{cur=-1;mat.map=null;mat.needsUpdate=true;buildHS();ui()}
}
const undo=()=>{snapNow();goHist(hp-1)},redo=()=>{snapNow();goHist(hp+1)};
$('undo').onclick=undo;$('redo').onclick=redo;
addEventListener('keydown',e=>{
  if(EMB||mode!='edit'||!(e.ctrlKey||e.metaKey))return;const tg=e.target.tagName;if(tg=='INPUT'||tg=='TEXTAREA'||tg=='SELECT')return;
  const k=e.key.toLowerCase();if(k=='z'){e.preventDefault();e.shiftKey?redo():undo()}else if(k=='y'){e.preventDefault();redo()}
});
$('pdesc').oninput=e=>{P.desc=e.target.value;save()};
$('sgo').onclick=()=>{$('start').hidden=true;startAudio()};
// ───────────── nadir patch, audio, floor plan, embed code ─────────────
async function shrink(f,max,type){const im=await createImageBitmap(f),k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);return c.toDataURL(type,.88)}
let npm=null,nsrc='',au=null,asrc='',muted=false,planOpen=false,placingPlan=false,psrc='';
function syncNadir(){
  const n=P.nadir;
  if(!n){if(npm){sc.remove(npm);npm=null}nsrc='';return}
  if(nsrc!=n.img){nsrc=n.img;if(npm){sc.remove(npm);npm=null}
    const im=new Image();im.onload=()=>{if(nsrc!=n.img)return;const t=new THREE.Texture(im);t.encoding=THREE.sRGBEncoding;t.needsUpdate=true;
      npm=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({map:t,transparent:true,depthTest:false,depthWrite:false}));npm.rotation.x=-PI/2;npm.renderOrder=3;sc.add(npm);syncNadir()};
    im.src=n.img;return}
  if(npm){const a=(n.r||25)*PI/180,rr=R*.97*Math.sin(a);npm.scale.set(rr,rr,1);npm.position.y=-R*.97*Math.cos(a)}
}
function syncAudio(){
  const a=P.audio;
  if(!a){if(au){au.pause();au=null;asrc=''}return}
  if(asrc!=a.src){if(au)au.pause();asrc=a.src;au=new Audio(a.src);au.loop=true;au.volume=a.vol??.6}
  $('mute').textContent=muted?'🔇':'🔊';
}
function startAudio(){if(au&&!muted&&au.paused&&mode=='view')au.play().catch(()=>{})}
function renderPlan(){
  const pl=P.plan;$('plan').hidden=!(pl&&planOpen);if(!pl)return;
  if(psrc!=pl.img){psrc=pl.img;$('pimg').src=pl.img}
  $('pdots').innerHTML=S.map((s,i)=>s.pp?`<button class="pd ${i==cur?'on':''}" data-i="${i}" style="left:${s.pp.x*100}%;top:${s.pp.y*100}%" title="${esc(s.name)}"></button>`:'').join('');
}
const embedCode=()=>{const u=(P.eurl||'').trim().replace(/"/g,'%22');return u?`<iframe src="${u}" width="100%" height="480" style="border:0" allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen" allowfullscreen loading="lazy"></iframe>`:''};
function extras(){
  syncNadir();syncAudio();renderPlan();fillTh();
  $('mute').hidden=!P.audio;$('pbtn').hidden=!P.plan;
  if(document.activeElement!=$('nsz'))$('nsz').value=P.nadir?.r||25;
  if(document.activeElement!=$('eurl'))$('eurl').value=P.eurl||'';
  $('ecode').value=embedCode();
  if(au){mode=='view'?startAudio():au.pause()}
}
addEventListener('pointerdown',startAudio);
$('mute').onclick=()=>{muted=!muted;if(au){muted?au.pause():startAudio()}syncAudio()};
$('pbtn').onclick=()=>{planOpen=!planOpen;renderPlan()};
$('pdots').onclick=e=>{const b=e.target.closest('button');if(b)go(+b.dataset.i)};
$('pbox').onclick=e=>{
  if(!placingPlan||e.target.closest('button'))return;const r=$('pimg').getBoundingClientRect(),c=v=>Math.min(1,Math.max(0,v));
  S[cur].pp={x:c((e.clientX-r.left)/r.width),y:c((e.clientY-r.top)/r.height)};placingPlan=false;$('msg').textContent='تم تحديد مكان المشهد على المخطط.';save();renderPlan();
};
$('pset').onclick=()=>{if(!P.plan){$('msg').textContent='ارفع صورة المخطط أولاً.';return}if(!S[cur])return;planOpen=true;placingPlan=true;renderPlan();$('msg').textContent='اضغط على المخطط لتحديد مكان هذا المشهد.'};
$('nfile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{P.nadir={img:await shrink(f,512,'image/png'),r:P.nadir?.r||25};save();extras()}catch(x){$('msg').textContent='تعذر قراءة الصورة.'}};
$('nrm').onclick=()=>{delete P.nadir;save();extras()};
$('nsz').oninput=e=>{if(P.nadir){P.nadir.r=+e.target.value;save();syncNadir()}};
$('afile').onchange=e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
  if(f.size>8e6){toast('ملف الصوت أكبر من 8 ميجابايت. اختر ملفاً أصغر.');return}
  freeURL(P.audio?.src);P.audio={src:objURL(f),blob:f,name:f.name,vol:.6};audioDirty=true;save();extras();toast('✅ تمت إضافة الموسيقى.')};
$('arm').onclick=()=>{freeURL(P.audio?.src);delete P.audio;audioDirty=true;save();extras()};
$('plfile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{P.plan={img:await shrink(f,1600,'image/jpeg')};planOpen=true;save();extras()}catch(x){$('msg').textContent='تعذر قراءة الصورة.'}};
$('prm').onclick=()=>{delete P.plan;S.forEach(s=>delete s.pp);planOpen=false;save();extras()};
$('eurl').oninput=e=>{P.eurl=e.target.value;save();$('ecode').value=embedCode()};
$('ecopy').onclick=async()=>{const v=$('ecode').value;if(!v){$('msg').textContent='اكتب رابط الجولة أولاً.';return}try{await navigator.clipboard.writeText(v)}catch(x){$('ecode').select();document.execCommand('copy')}$('msg').textContent='تم نسخ كود التضمين.'};
// ───────────── toasts, pinch zoom, keyboard control, backup reminder ─────────────

// Auto-dismiss. Observing #msg also covers code that writes to it directly.
(()=>{const m=$('msg');if(!m)return;
  new MutationObserver(()=>{clearTimeout(msgT);
    if(m.textContent)msgT=setTimeout(()=>{m.textContent='';msgHold=5200},msgHold);
  }).observe(m,{childList:true,characterData:true,subtree:true});
})();

// Browser storage alone is not a safe home for someone's work.
let remindAt=40;
function remind(){
  if(EMB||edits<remindAt)return;remindAt=edits+80;
  toast('💡 عملك محفوظ داخل هذا المتصفح فقط. اضغط «حفظ المشروع» لتنزيل نسخة على جهازك.',9000);
}

// Only warn on unload when autosave is known to be broken.
addEventListener('beforeunload',e=>{if(!EMB&&saveErr){e.preventDefault();e.returnValue=''}});

// Pinch to zoom. Without this, touch visitors have no way to zoom at all.
const pts=new Map();let pinch=null;
el.addEventListener('pointerdown',e=>{
  pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pts.size==2){const[a,b]=[...pts.values()];drag=null;hd=null;
    pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,f:fov}}
});
el.addEventListener('pointermove',e=>{
  if(!pts.has(e.pointerId))return;
  pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&pts.size==2){const[a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);
    if(d>0){fov=Math.max(40,Math.min(95,pinch.f*pinch.d/d));cam.fov=fov;cam.updateProjectionMatrix()}}
});
const endPt=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null};
el.addEventListener('pointerup',endPt);el.addEventListener('pointercancel',endPt);

// Keyboard control: the scene was previously unusable without a pointer.
el.tabIndex=0;
el.setAttribute('role','application');
el.setAttribute('aria-label','مشهد بانورامي ٣٦٠ — الأسهم للنظر حولك، + و − للتكبير');
el.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  const stp=.09;
  switch(e.key){
    case 'ArrowRight':yaw-=stp;break;
    case 'ArrowLeft': yaw+=stp;break;
    case 'ArrowUp':   pitch=Math.min(1.5,pitch+stp);break;
    case 'ArrowDown': pitch=Math.max(-1.5,pitch-stp);break;
    case '+':case '=':fov=Math.max(40,fov-5);cam.fov=fov;cam.updateProjectionMatrix();break;
    case '-':case '_':fov=Math.min(95,fov+5);cam.fov=fov;cam.updateProjectionMatrix();break;
    default:return;
  }
  e.preventDefault();
});

// Compass is keyboard operable.
$('cmp')?.addEventListener('keydown',e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();$('cmp').click()}});

// Remember which sections were left open.
if(!EMB)document.querySelectorAll('details.gp').forEach((d,i)=>{
  const k='vrt.sec.'+(d.id||i);
  try{const v=localStorage.getItem(k);if(v!==null)d.open=v=='1'}catch(e){}
  d.addEventListener('toggle',()=>{try{localStorage.setItem(k,d.open?'1':'0')}catch(e){}});
});

// Drop indicator while reordering scenes.
if(!EMB){const scn=$('scenes');
  scn.addEventListener('dragover',e=>{const b=e.target.closest('.sth');
    scn.querySelectorAll('.sth.dz').forEach(x=>x!==b&&x.classList.remove('dz'));b&&b.classList.add('dz')});
  const clr=()=>scn.querySelectorAll('.sth.dz').forEach(x=>x.classList.remove('dz'));
  scn.addEventListener('dragleave',clr);scn.addEventListener('drop',clr);scn.addEventListener('dragend',clr);
}

(async()=>{
  if(!EMB){try{
    IDX=(await dbOp('get','idx'))||[];
    if(!IDX.length){
      const old=await dbOp('get','p').catch(()=>null);   // single-project layout from a much older build
      if(old&&Array.isArray(old.scenes)){
        curId=uid()+uid();
        for(const s of old.scenes)if(typeof s.img=='string'&&s.img.startsWith('data:')){try{s.blob=dataToBlob(s.img);s.img=objURL(s.blob);dirty.add(s.id)}catch(e){}}
        if(typeof old.audio?.src=='string'&&old.audio.src.startsWith('data:')){try{old.audio.blob=dataToBlob(old.audio.src);old.audio.src=objURL(old.audio.blob);audioDirty=true}catch(e){delete old.audio}}
        P=old;S=P.scenes;await flush();await dbOp('del','p').catch(()=>{});
      }
    }else{
      const last=await dbOp('get','last').catch(()=>null),id=IDX.some(x=>x.id==last)?last:IDX[0].id;
      const d=await loadProj(id);
      if(d){curId=id;P=d;S=P.scenes;lastSids=new Set(S.map(s=>s.id))}
    }
    if(!curId){curId=uid()+uid();await flush()}
  }catch(e){curId=curId||uid()+uid();toast('⚠️ تعذّر الوصول إلى تخزين المتصفح (قد يكون وضع تصفّح خاص). لن يُحفظ عملك تلقائياً — استخدم «حفظ المشروع» بانتظام.',14000)}}
  $('ptitle').value=P.title;$('pdesc').value=P.desc||'';$('auto').checked=!!P.auto;$('wk').checked=P.walk!==false;resetHist();
  if(EMB&&S.length){$('stt').textContent=P.title||'';$('std').textContent=P.desc||'';$('start').style.backgroundImage=`linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.7)),url("${S[0].img}")`;$('sgo').disabled=true;$('sgo').textContent='جارٍ التحميل…';$('start').hidden=false}
  ui();fit();
  if(S.length)go(0).then(()=>{$('sgo').disabled=false;$('sgo').textContent='ابدأ الجولة'});
})();
