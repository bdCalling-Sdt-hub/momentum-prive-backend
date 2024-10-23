export function formatDate(date: Date | null): string | null {
  if (!date) return null;

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
