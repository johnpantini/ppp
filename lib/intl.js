export function formatDate(date) {
  if (!date) return 'N/A';

  return new Intl.DateTimeFormat('ru-RU', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZone: 'Europe/Moscow'
  }).format(new Date(date));
}
