import * as React from 'react';
import { isHlsUrl, parseHlsVariants, type HlsVariant } from '../lib/hls';

/** Loads the available HLS quality variants for a video URL (empty for non-HLS). */
export function useHlsVariants(url?: string): HlsVariant[] {
  const [variants, setVariants] = React.useState<HlsVariant[]>([]);

  React.useEffect(() => {
    if (!url || !isHlsUrl(url)) {
      setVariants([]);
      return;
    }
    let active = true;
    parseHlsVariants(url).then((v) => {
      if (active) setVariants(v);
    });
    return () => {
      active = false;
    };
  }, [url]);

  return variants;
}
