const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();

const ensureProtocol = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `https://${url}`;
};

const stripApiSuffix = (pathname = '') => {
    const trimmedPath = pathname.replace(/\/+$/, '');

    if (!trimmedPath) {
        return '';
    }

    return trimmedPath.replace(/\/api(?:\/.*)?$/i, '');
};

const normalizeUrl = (url) => {
    const normalized = ensureProtocol(url).replace(/\/+$/, '');

    if (!normalized) {
        return '';
    }

    try {
        const parsedUrl = new URL(normalized);
        const basePath = stripApiSuffix(parsedUrl.pathname);
        return `${parsedUrl.origin}${basePath}`.replace(/\/+$/, '');
    } catch (_err) {
        return normalized;
    }
};

const productionFallbackApiUrl = 'https://ecombackend-tcey.onrender.com';

export const API_BASE_URL = normalizeUrl(
    rawApiUrl || (import.meta.env.PROD ? productionFallbackApiUrl : 'http://localhost:5000')
);
