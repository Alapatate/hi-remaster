export type HlsVariant = {
  bandwidth: number;
  height: number;
  url: string;
  label: string;
};

function resolveUrl(base: string, relative: string): string {
  if (relative.startsWith('http://') || relative.startsWith('https://')) return relative;
  return base.substring(0, base.lastIndexOf('/') + 1) + relative;
}

/** Parse the variant streams from an HLS master playlist. Returns [] on failure or non-HLS. */
export async function parseHlsVariants(masterUrl: string): Promise<HlsVariant[]> {
  try {
    const res = await fetch(masterUrl);
    const text = await res.text();
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
  } catch {
    return [];
  }
}
