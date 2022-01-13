export function formatDate(date) {
  if (!date) return '-';

  return (
    new Intl.DateTimeFormat('ru-RU', {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    }).format(new Date(date))
  );
}
