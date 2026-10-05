const assetBaseUrl = import.meta.env.VITE_ASSET_URL || 'http://localhost:5000';

export const assetUrl = (path, fallback = null) =>
  path ? new URL(path, assetBaseUrl).href : fallback;
