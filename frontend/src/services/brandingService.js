import api from '../api/axiosClient';

const assetBase =
  import.meta.env.VITE_ASSET_URL || new URL(api.defaults.baseURL, window.location.origin).origin;
const absoluteLogoUrl = (url) => (url ? new URL(url, assetBase).href : null);

export const brandingService = {
  getLogo: async () => absoluteLogoUrl((await api.get('/settings/logo')).data.data.url),
  getHero: async () => absoluteLogoUrl((await api.get('/settings/hero')).data.data.url),
  uploadLogo: async (file) => {
    const body = new FormData();
    body.append('logo', file, 'brand-logo.svg');
    return absoluteLogoUrl((await api.post('/settings/logo', body)).data.data.url);
  },
  removeLogo: async () => {
    await api.delete('/settings/logo');
  },
  uploadHero: async (file) => {
    const body = new FormData();
    body.append('image', file, 'hero-background.webp');
    return absoluteLogoUrl((await api.post('/settings/hero', body)).data.data.url);
  },
  removeHero: async () => {
    await api.delete('/settings/hero');
  },
  getManagedImage: async (slot) =>
    absoluteLogoUrl((await api.get(`/settings/images/${slot}`)).data.data.url),
  uploadManagedImage: async (slot, file) => {
    const body = new FormData();
    body.append('image', file, `${slot}-image.webp`);
    return absoluteLogoUrl((await api.post(`/settings/images/${slot}`, body)).data.data.url);
  },
  removeManagedImage: async (slot) => {
    await api.delete(`/settings/images/${slot}`);
  },
};
