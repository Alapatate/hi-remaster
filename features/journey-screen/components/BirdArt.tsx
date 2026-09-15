import * as React from 'react';
import { Image, type ImageSourcePropType } from 'react-native';

/**
 * Illustrations of the journey birds (`assets/images/birds`), keyed by
 * `Bird.id`. The PNGs are transparent with some margin around the bird, so the
 * image is drawn close to the full size of the round frame it sits in (the
 * trail node, the detail sheet, the unlock popup, the profile avatar).
 */
const ART: Record<string, ImageSourcePropType> = {
  blackGrouse: require('@/assets/images/birds/Black grouse.png'),
  robin: require('@/assets/images/birds/Robin.png'),
  blackbird: require('@/assets/images/birds/Blackbird.png'),
  woodcock: require('@/assets/images/birds/Woodcock.png'),
  raven: require('@/assets/images/birds/Raven.png'),
  curlew: require('@/assets/images/birds/Great Curlew.png'),
  gardenWarbler: require('@/assets/images/birds/Garden Warbler.png'),
};

export function BirdArt({ id, size }: { id: string; size: number }) {
  return (
    <Image
      source={ART[id] ?? ART.robin}
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}
