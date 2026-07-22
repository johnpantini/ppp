export default function (i18n) {
  i18n.extend({
    $brokerIbPage: {
      twsHost: 'Хост TWS',
      twsHostDescription: 'Хост Trader Workstation.',
      twsPort: 'Порт TWS',
      twsPortDescription: 'Порт Trader Workstation.',
      gatewayUrlTitle: 'Ссылка на шлюз TWS API',
      gatewayUrlDescription:
        'Конечная точка, которая будет использована для взаимодействия с IB. Можно установить по сервису типа Aspirant Worker (шаблон «Шлюз TWS API»):',
      gatewayLink: 'Ссылка на шлюз',
      takeLinkFromService: 'Взять ссылку из сервиса',
      noGatewayConnection: 'Нет связи со шлюзом.',
      gatewayTimeRequestFailed: 'Шлюз не выполнил запрос времени.',
      gatewayTimeRequestError: 'Шлюз ответил ошибкой на запрос времени.'
    }
  });
}
