const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();

const ensureProtocol = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `https://${url}`;
};

const normalizeUrl = (url) => ensureProtocol(url).replace(/\/+$/, '');

const productionFallbackApiUrl = 'https://ecombackend-tcey.onrender.com';

export const API_BASE_URL = normalizeUrl(
    rawApiUrl || (import.meta.env.PROD ? productionFallbackApiUrl : 'http://localhost:5000')
);
