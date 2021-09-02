import { html } from '../../../lib/template.js';

import { plus } from '../icons/plus.js';
import { charts } from '../icons/charts.js';
import { laptop } from '../icons/laptop.js';
import { settings } from '../icons/settings.js';
import { support } from '../icons/support.js';
import { arrowLeft } from '../icons/arrow-left.js';

export const appTemplate = (context, definition) => html`
  <template>
    <div class="holder">
      <div class="app-container">
        <${'ppp-side-nav'} ?data-expanded="${(x) => x.expanded}">
          <${'ppp-side-nav-item'}
            disabled
            @click="${(x) => x.handleMyBalanceClick()}"
          >
            <span class="balance-icon" slot="start">💰</span>
            <span slot="title">
              <span class="balance">0,00</span>&nbsp;₽
            </span>
          </ppp-side-nav-item>
          <ppp-side-nav-item
            disabled
            @click="${(x) => x.handleNewTerminalClick()}"
          >
            ${plus({
              slot: 'start',
              cls: 'action-icon'
            })}
            <span slot="title">Новый терминал</span>
          </ppp-side-nav-item>
          <${'ppp-side-nav-group'}>
            ${charts({
              slot: 'start'
            })}
            <span slot="title">Торговля</span>
            <ppp-side-nav-item disabled slot="items">
              <span slot="title">Виджеты</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item disabled slot="items">
              <span slot="title">Аналитика</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item disabled slot="items">
              <span slot="title">Настройки</span>
            </ppp-side-nav-item>
          </ppp-side-nav-group>
          <ppp-side-nav-group>
            ${laptop({
              slot: 'start'
            })}
            <span slot="title">PPP</span>
            <ppp-side-nav-item disabled slot="items">
              <span slot="title">Обзор</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item disabled slot="items">
              <span slot="title">Оплата</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item disabled slot="items">
              <span slot="title">Настройки</span>
            </ppp-side-nav-item>
          </ppp-side-nav-group>
          <ppp-side-nav-group>
            ${settings({
              slot: 'start'
            })}
            <span slot="title">Параметры</span>
            <ppp-side-nav-item slot="items">
              <span slot="title">Облачные сервисы</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item disabled slot="items">
              <span slot="title">Ключи Warden</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item slot="items">
              <span slot="title">Обновления</span>
            </ppp-side-nav-item>
          </ppp-side-nav-group>
          <ppp-side-nav-group>
            ${support({
              slot: 'start'
            })}
            <span slot="title">Помощь</span>
            <ppp-side-nav-item slot="items">
              <span slot="title">Инструкции</span>
            </ppp-side-nav-item>
          </ppp-side-nav-group>
          <ppp-side-nav-item
            style="margin-top: 16px"
            @click="${(x) => x.handleSignOutClick()}"
          >
            ${arrowLeft({
              slot: 'start',
              cls: 'action-icon'
            })}
            <span slot="title">Выйти</span>
          </ppp-side-nav-item>
        </ppp-side-nav>
        <div class="page-content">
      </div>
    </div>
  </template>
`;
