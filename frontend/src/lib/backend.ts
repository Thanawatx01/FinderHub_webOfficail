export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    const clientConfigured = process.env.NEXT_PUBLIC_API_URL;

    if (clientConfigured && !clientConfigured.includes('backend')) {
      return clientConfigured;
    }

    const { protocol, hostname } = window.location;
    const defaultPort = process.env.NEXT_PUBLIC_API_PORT || '4000';
    return `${protocol}//${hostname}:${defaultPort}`;
  }

  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:4000'
  );
}

