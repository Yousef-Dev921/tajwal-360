// Applies the stored theme and language before the first paint, so a returning
// visitor never sees a flash of the wrong theme or the wrong text direction.
// Loaded synchronously from <head> because the CSP forbids inline scripts.
// app.js owns the dictionary, the controls and the same two storage keys.
(function(){
  const H=document.documentElement,ls=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
  const th=ls('vrt.theme');if(th=='light'||th=='dark')H.setAttribute('data-theme',th);
  const lg=ls('vrt.lang');if(lg=='en'){H.lang='en';H.dir='ltr'}
})();
