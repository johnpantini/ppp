function appendMainScript() {
  if (!document.querySelector('[ppp-state]')) {
    const script = document.createElement('script');

    script.src = 'ppp.js';
    script.type = 'module';
    document.body.append(script);
  }
}

window.addEventListener('load', async () => {
  const serviceMachineInput = document.body.querySelector(
    '.service-machine-url'
  );

  serviceMachineInput.value =
    localStorage.getItem('ppp-service-machine-url') ?? '';

  serviceMachineInput.addEventListener('input', (e) => {
    localStorage.setItem('ppp-service-machine-url', e.target.value.trim());
  });

  const registration = await navigator.serviceWorker.register('ppp-sw.js');

  if (navigator.serviceWorker.controller === null) {
    await navigator.serviceWorker.ready;

    registration.active.postMessage('reclaim');

    navigator.serviceWorker.addEventListener('controllerchange', async () => {
      appendMainScript();
    });
  } else {
    appendMainScript();
  }

  await navigator.serviceWorker.ready;

  registration.active.postMessage({
    type: 'version',
    version: localStorage.getItem('ppp-version') ?? ''
  });
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
