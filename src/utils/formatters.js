/**
 * Formats a timestamp into a human-readable date string.
 */
export function formatDate(timestamp) {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Formats a timestamp into a date + time string.
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats an amount into a currency string.
 */
export function formatCurrency(amount, currencyCode = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

/**
 * Formats an entity ID to "XX-XXXXX" format (2 letters + 5 digits).
 */
export function formatId(id, type = 'driver') {
  if (!id) return '—';
  const prefix = type === 'driver' ? 'DR' : 'RD';
  const num = id.replace(/[^0-9]/g, '');
  return `${prefix}-${num.padStart(5, '0')}`;
}

/**
 * Formats a rating value.
 */
export function formatRating(rating) {
  return typeof rating === 'number' ? rating.toFixed(1) : '0.0';
}

/**
 * Formats a timestamp into a relative time string (e.g. "2 hours ago").
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return formatDate(timestamp);
}
