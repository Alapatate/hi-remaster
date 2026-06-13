import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const SCREEN_PADDING = 20;
export const GRID_GAP = 12;

/** Width of one exercise card in the 2-column builder grid. */
export const CARD_WIDTH = (SCREEN_WIDTH - SCREEN_PADDING * 2 - GRID_GAP) / 2;
