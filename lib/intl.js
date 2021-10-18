export function formatDate(date) {
  if (!date) return 'N/A';

  // TODO - make timezone adjustable
  return (
    new Intl.DateTimeFormat('ru-RU', {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      timeZone: 'Europe/Moscow'
    }).format(new Date(date)) + ' MSK'
  );
}
