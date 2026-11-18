// Focus a hidden proxy input synchronously inside the user's tap so mobile
// browsers open the keyboard, then navigate to Home where SearchBar takes over focus.
export function openSearchWithKeyboard(navigate) {
  if (typeof document !== 'undefined') {
    window.__searchProxy?.remove();
    const proxy = document.createElement('input');
    proxy.type = 'text';
    proxy.setAttribute('aria-hidden', 'true');
    proxy.setAttribute('enterkeyhint', 'search');
    proxy.tabIndex = -1;
    // Must be "visible" to the browser (not display:none / 0 size) or mobile won't open the keyboard
    proxy.style.cssText =
      'position:fixed;top:0;left:0;width:40px;height:40px;opacity:0.01;font-size:16px;border:0;padding:0;z-index:-1;';
    document.body.appendChild(proxy);
    proxy.focus({ preventScroll: true });
    window.__searchProxy = proxy;
    // Safety cleanup in case the Home search bar never takes over focus
    setTimeout(() => releaseSearchProxy(), 5000);
  }
  // Preload the lazy Home chunk so the search bar mounts quickly after navigation
  import('../pages/HomePage');
  navigate('/', { state: { autoFocus: true } });
}

export function releaseSearchProxy() {
  if (window.__searchProxy) {
    window.__searchProxy.remove();
    window.__searchProxy = null;
  }
}
