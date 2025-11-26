export function getBaseImageUrl() {
  // Return the API base (including '/api' if present). Frontend stores API URL
  // in VITE_API_URL and backend serves uploads under '/api/uploads'. Using
  // the full API base ensures saved image paths like '/uploads/...' resolve
  // to '<API_BASE>/uploads/...', e.g. 'http://localhost:5000/api/uploads/...'
  const apiUrl = import.meta?.env?.VITE_API_URL;
  if (typeof apiUrl === 'string' && apiUrl.length) return apiUrl;
  return 'http://localhost:5000/api';
}

export function getFullImageUrl(relativePath) {
  if (!relativePath) return '';
  // If already absolute, return as-is
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  const base = getBaseImageUrl();
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  // Ensure there is no double-slash when joining
  return `${base.replace(/\/$/, '')}${path}`;
}
