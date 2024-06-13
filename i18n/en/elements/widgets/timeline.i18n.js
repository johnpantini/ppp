export default function (i18n) {
  i18n.extend({
    $timeLineWidget: {
      stockCount: '%{smart_count} share of |||| %{smart_count} shares of',
      bondCount:
        '%{smart_count} облигации |||| %{smart_count} облигаций |||| %{smart_count} облигаций',
      etfCount:
        '%{smart_count} фонда |||| %{smart_count} фондов |||| %{smart_count} фондов',
      futureCount:
        '%{smart_count} фьючерса |||| %{smart_count} фьючерсов |||| %{smart_count} фьючерсов',
      currencyCount:
        '%{smart_count} единицы валюты |||| %{smart_count} единиц валюты |||| %{smart_count} единиц валюты',
      otherCount:
        '%{smart_count} бумаги |||| %{smart_count} бумаг |||| %{smart_count} бумаг',
      lotCount: '%{smart_count} lot |||| %{smart_count} lots',
      lotAtPrice: '%{lotCount} @ %{price}',
      buyOperation: 'Bought %{tradedCount} %{instrumentFullName}',
      sellOperation: 'Sold %{tradedCount} %{instrumentFullName}'
    }
  });
}
