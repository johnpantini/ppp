function appendMainScript() {
  const script = document.createElement('script');

  script.src = 'ppp.js';
  script.type = 'module';
  document.body.append(script);
}

window.addEventListener('load', async () => {
  if (typeof window.__TAURI__ !== 'undefined') {
    const lastVisitedUrl =
      localStorage.getItem('ppp-last-visited-url') ?? '?page=cloud-services';

    if (window.location.search !== lastVisitedUrl) {
      return window.location.replace(
        `${window.location.origin}/desktop${lastVisitedUrl}`
      );
    }
  }

  const globalProxyUrlInput = document.body.querySelector('.global-proxy-url');

  globalProxyUrlInput.value =
    localStorage.getItem('ppp-global-proxy-url') ?? '';

  globalProxyUrlInput.addEventListener('input', (e) => {
    localStorage.setItem('ppp-global-proxy-url', e.target.value.trim());
  });

  const registration = await navigator.serviceWorker.register('ppp-sw.js');

  if (navigator.serviceWorker.controller === null) {
    await navigator.serviceWorker.ready;
    registration.active.postMessage('reclaim');
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      appendMainScript
    );
  } else {
    appendMainScript();
  }
});

window.customElements.define(
  'ppp-loader',
  class extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: 'open' }).appendChild(
        document.getElementById('ppp-loader').content.cloneNode(true)
      );
    }
  }
);
