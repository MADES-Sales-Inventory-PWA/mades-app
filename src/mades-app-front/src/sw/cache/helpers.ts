declare const self: ServiceWorkerGlobalScope;

export async function precacheUrl(cache: Cache, url: string): Promise<void> {
  try {
    const response = await fetch(url, { cache: 'reload' });
    if (response.ok || response.type === 'opaque') {
      await cache.put(url, response);
    }
  } catch {
    // Ignore failed precache entries and keep installing remaining assets.
  }
}

export async function matchCachedRequest(request: Request, url: URL): Promise<Response | undefined> {
  const directMatch = await caches.match(request);
  if (directMatch) {
    return directMatch;
  }

  if (url.origin === self.location.origin) {
    const byPathMatch = await caches.match(url.pathname, { ignoreSearch: true });
    if (byPathMatch) {
      return byPathMatch;
    }
  }

  return undefined;
}
