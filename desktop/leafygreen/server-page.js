import { ServerPage } from '../../shared/server-page.js';
import { html } from '../../shared/template.js';
import { ref } from '../../shared/element/templating/ref.js';
import { pageStyles } from './page.js';
import { SERVER_TYPES } from '../../shared/const.js';

export const serverPageTemplate = (context, definition) => html`
  <template>
    <form novalidate>
      <${'ppp-page'}>
        <span slot="header">
          ${(x) => (x.document.name ? `Сервер - ${x.document.name}` : 'Сервер')}
        </span>
        <section>
          <div class="label-group">
            <h5>Название сервера</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <${'ppp-text-field'}
              placeholder="Название"
              value="${(x) => x.document.name}"
              ${ref('name')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Адрес</h5>
            <p>Укажите имя хоста или IP-адрес сервера.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="url"
              placeholder="127.0.0.1"
              value="${(x) => x.document.hostname}"
              ${ref('hostname')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Порт</h5>
            <p>Укажите SSH-порт сервера.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              type="number"
              placeholder="22"
              value="${(x) => x.document.port ?? '22'}"
              ${ref('port')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Имя пользователя</h5>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="root"
              value="${(x) => x.document.username ?? 'root'}"
              ${ref('username')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Тип авторизации</h5>
          </div>
          <div class="input-group">
            <${'ppp-radio-group'}
              orientation="vertical"
              value="${(x) => x.document.authType ?? 'password'}"
              @change="${(x) => x.scratchSet('authType', x.authType.value)}"
              ${ref('authType')}
            >
              <${'ppp-radio'} value="password">По паролю</ppp-radio>
              <ppp-radio value="key">По приватному ключу</ppp-radio>
            </ppp-radio-group>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Ключ или пароль</h5>
            <p>Данные сохраняются в зашифрованном виде.</p>
          </div>
          <div class="input-group">
            <div style="display: ${(x) =>
              !x.scratch.authType ||
              x.scratch.authType === SERVER_TYPES.PASSWORD
                ? 'initial'
                : 'none'}">
              <ppp-text-field
                type="password"
                placeholder="Введите пароль"
                value="${(x) => x.document.password}"
                ${ref('password')}
              ></ppp-text-field>
            </div>
            <div style="display: ${(x) =>
              x.scratch.authType === SERVER_TYPES.KEY ? 'initial' : 'none'}">
              <${'ppp-text-area'}
                monospace
                placeholder="Введите ключ"
                value="${(x) => x.document.key}"
                ${ref('key')}
              ></ppp-text-area>
              <${'ppp-button'}
                class="margin-top"
                @click="${(x) => x.loadPrivateKey()}"
                appearance="primary"
              >
                Загрузить из файла
              </ppp-button>
              <input
                @change="${(x, c) => x.handleFileSelection(c)}"
                type="file"
                style="display: none;"
                ${ref('fileInput')}
              />
            </div>
          </div>
        </section>
        <div class="folding">
          <div class="folding-header" @click="${(x, c) =>
            c.event.target.parentNode.classList.toggle('folding-open')}"
          >
            <div class="folding-header-toggle">
              <img slot="logo" draggable="false" alt="Toggle"
                   src="static/fa/angle-down.svg"/>
            </div>
            <div class="folding-header-text">Дополнительно</div>
          </div>
          <div class="folding-content">
            <section>
              <div class="label-group">
                <h5>Команды перед сохранением</h5>
                <${'ppp-banner'} class="inline margin-top" appearance="warning">
                  Поддерживаются только RHEL-совместимые операционные системы.
                </ppp-banner>
                <p>
                  Произвольные команды, которые можно использовать в отладочных
                  целях. Не сохраняются в базе данных.
                </p>
              </div>
              <div class="input-group">
                <${'ppp-text-area'}
                  monospace
                  placeholder="Введите команды"
                  ${ref('extraCommands')}
                ></ppp-text-area>
              </div>
            </section>
          </div>
        </div>
      </ppp-page>
    </form>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export default ServerPage.compose({
  template: serverPageTemplate,
  styles: pageStyles
});
