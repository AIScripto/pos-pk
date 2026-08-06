const LOCAL_SERVER_URL = 'http://localhost:3500';

const configuredServerUrl = import.meta.env.VITE_SERVER_URL;
const configuredApiUrl = import.meta.env.VITE_API_URL;

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const getDynamicServerUrl = (): string => {
  if (configuredServerUrl && (!configuredServerUrl.includes('localhost') || isLocalhost)) {
    return configuredServerUrl;
  }
  if (typeof window !== 'undefined' && !isLocalhost) {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:4001`;
  }
  return LOCAL_SERVER_URL;
};

export const SERVER_URL = getDynamicServerUrl();

export const API_URL = ((): string => {
  if (configuredApiUrl && configuredApiUrl.startsWith('/')) {
    return configuredApiUrl;
  }
  if (configuredApiUrl && (!configuredApiUrl.includes('localhost') || isLocalhost)) {
    return configuredApiUrl;
  }
  if (typeof window !== 'undefined' && !isLocalhost) {
    return `${window.location.protocol}//${window.location.hostname}:4001/api/v1`;
  }
  return `${SERVER_URL}/api/v1`;
})();
