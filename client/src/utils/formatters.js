export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatDateInput = (date) =>
  new Date(date).toISOString().split('T')[0];

export const formatCurrency = (amount) =>
  amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount) : '—';

export const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(date);
};

export const getStatusConfig = (status) => {
  const configs = {
    applied:      { label: 'Applied',      color: 'var(--primary)',  bg: 'var(--primary-light)', emoji: '📨' },
    phone_screen: { label: 'Phone Screen', color: 'var(--warning)',  bg: 'var(--warning-light)', emoji: '📞' },
    interview:    { label: 'Interview',    color: 'var(--purple)',   bg: 'var(--purple-light)',  emoji: '🎯' },
    offer:        { label: 'Offer',        color: 'var(--success)',  bg: 'var(--success-light)', emoji: '🎉' },
    rejected:     { label: 'Rejected',     color: 'var(--danger)',   bg: 'var(--danger-light)',  emoji: '❌' },
    withdrawn:    { label: 'Withdrawn',    color: 'var(--text-muted)', bg: 'var(--bg-hover)',    emoji: '↩️' },
  };
  return configs[status] || configs.applied;
};