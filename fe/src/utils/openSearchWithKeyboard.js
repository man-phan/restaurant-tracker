// Focus a hidden proxy input synchronously inside the user's tap so mobile
// browsers open the keyboard, then navigate to Home where SearchBar takes over focus.
export function openSearchWithKeyboard(navigate) {
  if (typeof document !== 'undefined') {
    window.__searchProxy?.remove();
    const proxy = document.createElement('input');
    proxy.type = 'search';
    proxy.setAttribute('aria-hidden', 'true');
    proxy.tabIndex = -1;
    proxy.style.cssText =
      'position:fixed;top:0;left:0;opacity:0;font-size:16px;width:1px;height:1px;pointer-events:none;';
    document.body.appendChild(proxy);
    proxy.focus();
    window.__searchProxy = proxy;
    setTimeout(() => releaseSearchProxy(), 1500);
  }
  navigate('/', { state: { autoFocus: true } });
}

export function releaseSearchProxy() {
  if (window.__searchProxy) {
    window.__searchProxy.remove();
    window.__searchProxy = null;
  }
}

