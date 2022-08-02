export async function extension({ ppp, baseExtensionUrl, metaUrl, extension }) {
  const [
    { LiquidEquitiesPage },
    { html, requireComponent },
    { search },
    { ref },
    { pageStyles }
  ] = await Promise.all([
    import(`${baseExtensionUrl}/shared/liquid-equities-page.js`),
    import(`${ppp.rootUrl}/shared/template.js`),
    import(`${ppp.rootUrl}/desktop/${ppp.theme}/icons/search.js`),
    import(`${ppp.rootUrl}/shared/element/templating/ref.js`),
    import(`${ppp.rootUrl}/desktop/${ppp.theme}/page.js`)
  ]);

  (
    await import(
      `${baseExtensionUrl}/i18n/${ppp.locale}/liquid-equities-page.i18n.js`
    )
  ).default(ppp.dict);

  await Promise.all([
    requireComponent(
      'ppp-tabs',
      `${ppp.rootUrl}/${ppp.appType}/${ppp.theme}/tabs.js`
    ),
    requireComponent(
      'ppp-tab',
      `${ppp.rootUrl}/${ppp.appType}/${ppp.theme}/tabs.js`
    ),
    requireComponent(
      'ppp-tab-panel',
      `${ppp.rootUrl}/${ppp.appType}/${ppp.theme}/tabs.js`
    ),
    requireComponent(
      'ppp-badge',
      `${ppp.rootUrl}/${ppp.appType}/${ppp.theme}/badge.js`
    )
  ]);

  const liquidEquitiesPageTemplate = (context, definition) => html`
    <template>
      <${'ppp-page'}>
        <span slot="header">
          Маржинальные инструменты со ставками риска
        </span>
        <ppp-tabs activeid="alor-ksur" ${ref('tabs')}
                  @change="${(x, c) => x.handleTabChange(c)}">
          <ppp-tab id="alor-ksur">Алор КСУР</ppp-tab>
          <ppp-tab id="alor-kpur">Алор КПУР</ppp-tab>
          <ppp-tab id="alor-ksur-turbo">Алор КСУР с Турбо</ppp-tab>
          <ppp-tab id="alor-kpur-turbo">Алор КПУР с Турбо</ppp-tab>
          <ppp-tab id="tinkoff">Тинькофф</ppp-tab>
          <ppp-tab-panel id="alor-ksur-panel"></ppp-tab-panel>
          <ppp-tab-panel id="alor-kpur-panel"></ppp-tab-panel>
          <ppp-tab-panel id="alor-ksur-turbo-panel"></ppp-tab-panel>
          <ppp-tab-panel id="alor-kpur-turbo-panel"></ppp-tab-panel>
          <ppp-tab-panel id="tinkoff-panel"></ppp-tab-panel>
        </ppp-tabs>
        <${'ppp-text-field'}
          class="global-search-input"
          type="search"
          placeholder="Поиск"
          @input="${(x, c) => (x.searchText = c.event.target.value)}"
        >
          ${search({
            slot: 'end'
          })}
        </ppp-text-field>
        <${'ppp-table'}
          sticky
          :columns="${() => [
            {
              label: 'Тикер'
            },
            {
              label: 'Название'
            },
            {
              label: 'Тип'
            },
            {
              label: 'ISIN'
            },
            {
              label: 'Валюта'
            },
            {
              label: 'Доступно в short'
            },
            {
              label: 'Ставка риска long, %'
            },
            {
              label: 'Ставка риска short, %'
            },
            {
              label: 'Плечо в long'
            },
            {
              label: 'Плечо в short'
            }
          ]}"
          :rows="${(x) =>
            x.instruments
              .filter((datum) => {
                if (!x.searchText) return true;

                return new RegExp(x.searchText, 'ig').test(
                  [datum.ticker, datum.name, datum.isin].join(' ')
                );
              })
              .map((datum) => {
                return {
                  datum,
                  cells: [
                    datum.ticker,
                    datum.name,
                    x.t(`$extensions.liquidEquities.type.${datum.type}`),
                    datum.isin ?? '-',
                    datum.currency ?? '-',
                    html`
                      <ppp-badge
                        appearance="${datum.isShortPossible ? 'green' : 'red'}"
                      >
                        ${datum.isShortPossible ? 'Да' : 'Нет'}
                      </ppp-badge>
                    `,
                    datum.rateLong === 0 ? '-' : datum.rateLong.toFixed(2),
                    datum.rateShort === 0 ? '-' : datum.rateShort.toFixed(2),
                    datum.rateLong === 0
                      ? '-'
                      : `x${(100 / datum.rateLong).toFixed(2)}`,
                    datum.rateShort === 0
                      ? '-'
                      : `x${(100 / datum.rateShort).toFixed(2)}`
                  ]
                };
              })}"
        >
        </ppp-table>
        <span slot="actions"></span>
      </ppp-page>
    </template>
  `;

  // noinspection JSUnusedGlobalSymbols
  return LiquidEquitiesPage.compose({
    baseName: `liquid-equities-${extension._id}-page`,
    template: liquidEquitiesPageTemplate,
    styles: pageStyles
  });
}
