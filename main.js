function appendMainScript() {
  if (!document.querySelector('[ppp-state]')) {
    const script = document.createElement('script');

    script.src = 'ppp.js';
    script.type = 'module';
    script.setAttribute('ppp-state', 'processed');
    document.body.append(script);
  }
}

window.addEventListener('load', async () => {
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
});

window.customElements.define(
  'ppp-loader',
  class extends HTMLElement {
    connectedCallback() {
      this.attachShadow({ mode: 'open' }).appendChild(
        document.getElementById('ppp-loader').content.cloneNode(true)
      );

      this.setText('Приложение загружается, подождите...');
      globalThis.loader = this;

      this.input = this.shadowRoot.querySelector('input');
      this.onInput = this.onInput.bind(this);

      this.input.addEventListener('input', this.onInput);
    }

    onInput(e) {
      localStorage.setItem('ppp-service-machine-url', e.target.value.trim());
    }

    disconnectedCallback() {
      this.input.removeEventListener('input', this.onInput);
    }

    showInput(text) {
      this.input.value = text;
      this.input.removeAttribute('hidden');
    }

    setText(text) {
      this.shadowRoot.querySelector('.text').textContent = text;
    }
  }
);
