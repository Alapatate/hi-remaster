export type HlsVariant = {
  bandwidth: number;
  height: number;
  url: string;
  label: string;
};

export function isHlsUrl(url: string): boolean {
  return url.toLowerCase().includes('.m3u8');
}

/**
 * Trim, and only encode when necessary. Re-serializing a valid URL via `new URL().href`
 * can mutate signed query tokens and produce iOS 404s.
 */
export function normalizeVideoUrl(url: string): string {
  const trimmed = url.trim();
  if (!/\s/.test(trimmed)) return trimmed;
  try {
    return encodeURI(trimmed);
  } catch {
    return trimmed;
  }
}

/**
 * Resolve a (possibly relative) playlist URI against the playlist's own URL.
 * Signed query tokens on the master are copied onto relative children — Android's
 * ExoPlayer often still plays without this; AVPlayer 404s.
 */
export function resolveUrl(base: string, relative: string): string {
  if (relative.startsWith('http://') || relative.startsWith('https://')) return relative;
  try {
    const resolved = new URL(relative, base);
    const baseUrl = new URL(base);
    if (!resolved.search && baseUrl.search) {
      resolved.search = baseUrl.search;
    }
    return resolved.href;
  } catch {
    return base.substring(0, base.lastIndexOf('/') + 1) + relative;
  }
}

export function parseHlsVariantsFromPlaylist(text: string, masterUrl: string): HlsVariant[] {
  if (!text.includes('#EXT-X-STREAM-INF')) return [];

  const lines = text.split('\n').map((l) => l.trim());
  const variants: HlsVariant[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('#EXT-X-STREAM-INF')) continue;
    const info = lines[i];
    const urlLine = lines[i + 1];
    if (!urlLine || urlLine.startsWith('#')) continue;

    const bwMatch = info.match(/BANDWIDTH=(\d+)/);
    const resMatch = info.match(/RESOLUTION=(\d+)x(\d+)/);
    if (!bwMatch) continue;

    const bandwidth = parseInt(bwMatch[1], 10);
    const height = resMatch ? parseInt(resMatch[2], 10) : 0;
    const url = resolveUrl(masterUrl, urlLine);
    const label = height ? `${height}p` : `${Math.round(bandwidth / 1000)} kbps`;

    variants.push({ bandwidth, height, url, label });
  }

  variants.sort((a, b) => b.bandwidth - a.bandwidth);

  const seen = new Set<string>();
  return variants.filter((v) => {
    if (seen.has(v.label)) return false;
    seen.add(v.label);
    return true;
  });
}

/** Parse the variant streams from an HLS master playlist. Returns [] on failure or non-HLS. */
export async function parseHlsVariants(masterUrl: string): Promise<HlsVariant[]> {
  try {
    const res = await fetch(masterUrl);
    const text = await res.text();
    return parseHlsVariantsFromPlaylist(text, res.url || masterUrl);
  } catch {
    return [];
  }
}

export type PlayableVideo = {
  uri: string;
  variants: HlsVariant[];
  contentType?: 'hls';
};

async function resolveHls(url: string): Promise<PlayableVideo> {
  const res = await fetch(url);
  const finalUrl = normalizeVideoUrl(res.url || url);
  const text = await res.text();
  const variants = parseHlsVariantsFromPlaylist(text, finalUrl);
  // After a redirect the path often loses `.m3u8`. AVPlayer keys off the
  // extension, so prefer a variant that still has it.
  const uri = isHlsUrl(finalUrl)
    ? finalUrl
    : (variants.find((v) => isHlsUrl(v.url))?.url ?? finalUrl);
  return { uri, variants, contentType: 'hls' };
}

/**
 * Follow redirects and (for HLS) parse the playlist *before* AVPlayer sees the URL.
 *
 * iOS resolves relative HLS URIs against the *pre-redirect* URL, so a 302 from
 * Appwrite/CDN to the real file makes every segment 404 ("requested URL was not
 * found on this server"). Android's ExoPlayer uses the post-redirect URL.
 */
export async function resolvePlayableVideo(url: string): Promise<PlayableVideo> {
  const normalized = normalizeVideoUrl(url);

  try {
    if (isHlsUrl(normalized)) {
      return await resolveHls(normalized);
    }

    const head = await fetch(normalized, { method: 'HEAD' });
    const finalUrl = normalizeVideoUrl(head.url || normalized);
    const mime = (head.headers.get('content-type') || '').toLowerCase();
    if (mime.includes('mpegurl') || mime.includes('m3u8') || isHlsUrl(finalUrl)) {
      return await resolveHls(finalUrl);
    }
    return { uri: finalUrl, variants: [] };
  } catch {
    return {
      uri: normalized,
      variants: [],
      contentType: isHlsUrl(normalized) ? 'hls' : undefined,
    };
  }
}

export function buildVideoSource(uri: string, title: string, contentType?: 'hls') {
  const hls = contentType === 'hls' || isHlsUrl(uri);
  return {
    uri,
    ...(hls ? { contentType: 'hls' as const } : {}),
    metadata: { title },
  };
}
