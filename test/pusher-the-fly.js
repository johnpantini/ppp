async function formatter(event, message) {
  /**
   * Функция форматирования сообщения.
   *
   * @param {string} event - Название события в канале Pusher.
   * - null: если форматируются сообщения из истории.
   * @param {json} message - Сообщение от Pusher.
   * @returns {object} formatted - Данные отформатированного сообщения.
   * @returns {string} formatted.id - Уникальный идентификатор.
   * @returns {array} [formatted.symbols] - Тикеры, относящиеся к сообщению.
   * @returns {string} [formatted.iconLayout] - Вёрстка для иконки.
   * @returns {string} [formatted.iconFallback] - Текст для отображения, если иконки нет.
   * @returns {string} [formatted.indicator] - Индикатор (вертикальная полоса слева).
   * @returns {string} [formatted.leftTitle] - Заголовок (слева).
   * @returns {string} [formatted.leftSubtitle] - Подзаголовок (слева).
   * @returns {string} [formatted.rightTitle] - Заголовок (справа).
   * @returns {string} [formatted.rightSubtitle] - Подзаголовок (справа).
   */

  if (
    event &&
    event !==
      `[%#(await ppp.user.functions.findOne({collection:'services'},{removed:{$not:{$eq:true}},name:'The Fly SPBEX'},{_id:1}))?._id%]:insert`
  )
    return;

  let rightTitle = '🐝';

  switch (message.topic) {
    case 'events':
      rightTitle = '📅';

      break;
    case 'recomm':
      rightTitle = '👍👎';

      break;
    case 'recDowngrade':
      rightTitle = '⬇️';

      break;
    case 'recUpgrade':
      rightTitle = '⬆️';

      break;
    case 'periodicals':
      rightTitle = '📰';

      break;
    case 'options':
      rightTitle = '🅾️';

      break;
    case 'general_news':
      rightTitle = '🌎';

      break;
    case 'hot_stocks':
      rightTitle = '🔥';

      break;
    case 'earnings':
      rightTitle = '💰';

      break;
    case 'syndic':
      break;
    case 'technical_analysis':
      rightTitle = '💹';

      break;
  }

  const symbols = message.tickers?.split?.(',') ?? [];
  let instrument = this.instrument;

  if (!this.instrument && symbols.length === 1) {
    instrument = await this.instrumentTrader?.findInstrumentInCache?.(
      symbols[0]
    );
  }

  if (instrument && instrument.symbol.startsWith('$')) instrument = void 0;

  const { formatDateWithOptions } = await import(
    `${ppp.rootUrl}/shared/intl.js`
  );

  return {
    id: message.ppp_counter,
    iconLayout: `<div slot="icon" style="${
      instrument?.isin
        ? `background-image:url(${
            'static/instruments/' + instrument.isin + '.svg'
          })`
        : ''
    }"></div>`,
    iconFallback: `<span slot="icon-fallback">${
      instrument?.symbol?.[0] ?? '🐝'
    }</span>`,
    symbols,
    leftTitle: `<span slot="title-left" title="${message.title}">${message.title}</span>`,
    leftSubtitle: `<div slot="subtitle-left" title="${symbols.join(
      ' '
    )}">${symbols.join('<span class="dot-divider">•</span>')}</div>`,
    rightTitle: `<span slot="title-right">${rightTitle}</span>`,
    rightSubtitle: `<span slot="subtitle-right">${formatDateWithOptions(
      new Date(
        Date.parse(
          message.date.replace('GMT-8', 'GMT-5').replace('GMT-7', 'GMT-4')
        )
      ),
      {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }
    )}</span>`
  };
}

async function history() {
  /**
   * Функция исторических данных.
   *
   */

  // const serviceCredentials = [%#JSON.stringify(await (async () => {
  //   const [service] = await ppp.user.functions.aggregate({collection:'services'}, [
  //     {
  //       $match: {
  //         name: 'The Fly SPBEX'
  //       }
  //     },
  //     {
  //       $lookup: {
  //         from: 'apis',
  //         localField: 'supabaseApiId',
  //         foreignField: '_id',
  //         as: 'supabaseApi'
  //       }
  //     },
  //     {
  //       $unwind: '$supabaseApi'
  //     }
  //   ]);
  //
  //   return {
  //     api: await ppp.decrypt(service.supabaseApi),
  //     tableName: `parsed_records_${service._id}`
  //   }
  // })())%];

  let symbolToFilter;

  if (this.instrument && this.instrumentTrader) {
    symbolToFilter = this.instrumentTrader.getSymbol(this.instrument);
  }

  const query = `select ppp_counter, title, tickers, topic, date, priority from ${
    serviceCredentials.tableName
  } ${
    symbolToFilter ? `where tickers ~* '\\y${symbolToFilter}\\y'` : ''
  } order by ppp_counter desc limit 10;`;

  const { hostname } = new URL(serviceCredentials.api.url);

  const [results] =
    (
      await (
        await fetch(
          new URL('pg', ppp.keyVault.getKey('service-machine-url')).toString(),
          {
            method: 'POST',
            body: JSON.stringify({
              query,
              connectionString: `postgres://${
                serviceCredentials.api.user
              }:${encodeURIComponent(
                serviceCredentials.api.password
              )}@db.${hostname}:${serviceCredentials.api.port}/${
                serviceCredentials.api.db
              }`
            })
          }
        )
      ).json()
    ).results ?? [];

  const fieldIndices = {};

  results.fields.forEach((f, index) => {
    fieldIndices[f.fieldName] = index;
  });

  return results.rows.map((r) => {
    return {
      ppp_counter: r[fieldIndices['ppp_counter']],
      title: r[fieldIndices['title']],
      tickers: r[fieldIndices['tickers']],
      topic: r[fieldIndices['topic']],
      date: r[fieldIndices['date']],
      priority: r[fieldIndices['priority']]
    };
  });
}
