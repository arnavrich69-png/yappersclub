// Geometry of the tied imli, copied from logo/dhwanikul-mark.svg (a 1080 x 1080 canvas, candy
// centred at 540, 540). Every part keeps the designer's numbers so the opening frame of a film is
// the logo, exactly. Parts are kept separate so each one can move on its own.

import type {V} from '../utils/math';

export const MARK = {
  size: 1080,
  center: [540, 540] as V,
  outline: 8.04,

  wrapper: {
    left: 'M306.4,407.4 C256.6,478.1 256.6,487.0 238.5,460.4 L80.2,339.1 L80.2,339.1 L102.8,379.3 L80.2,419.5 L102.8,459.6 L80.2,499.8 L102.8,540.0 L80.2,580.2 L102.8,620.4 L80.2,660.5 L102.8,700.7 L80.2,740.9 L238.5,619.6 C256.6,593.0 256.6,601.9 306.4,672.6 Z',
    right: 'M773.6,407.4 C823.4,478.1 823.4,487.0 841.5,460.4 L999.8,339.1 L999.8,339.1 L977.2,379.3 L999.8,419.5 L977.2,459.6 L999.8,499.8 L977.2,540.0 L999.8,580.2 L977.2,620.4 L999.8,660.5 L977.2,700.7 L999.8,740.9 L841.5,619.6 C823.4,593.0 823.4,601.9 773.6,672.6 Z',
    /** Fold lines from the neck to the zigzag edge: [neck y, edge point, dark?]. Left side; right mirrors x. */
    folds: [
      [520.7, [102.8, 379.3], true],
      [525.5, [84.7, 419.5], false],
      [530.4, [102.8, 459.6], true],
      [535.2, [84.7, 499.8], false],
      [540.0, [102.8, 540.0], true],
      [544.8, [84.7, 580.2], false],
      [549.6, [102.8, 620.4], true],
      [554.5, [84.7, 660.5], false],
      [559.3, [102.8, 700.7], true],
    ] as [number, V, boolean][],
    foldNeckX: 231.8,
    /** Where each wrapper end pinches into the neck (pivot for crinkles and flutters). */
    neck: {left: [262, 540] as V, right: [818, 540] as V},
  },

  wraps: {
    width: 36.88,
    left: [
      [[241.6, 451.8], [250.8, 628.2]],
      [[265.7, 451.8], [274.9, 628.2]],
      [[289.8, 451.8], [299.0, 628.2]],
    ] as [V, V][],
    right: [
      [[790.2, 451.8], [799.4, 628.2]],
      [[814.3, 451.8], [823.5, 628.2]],
      [[838.4, 451.8], [847.7, 628.2]],
    ] as [V, V][],
  },

  /** Two loose ends per knot, quadratic curves from the knot: A swings in, B swings out and carries a yellow strand. */
  ends: {
    left: {
      knot: [267.0, 636.9] as V,
      a: {ctrl: [258.5, 670.0] as V, tip: [238.3, 704.2] as V, width: 15.42},
      b: {ctrl: [274.4, 667.3] as V, tip: [302.0, 699.3] as V, width: 14.02, yellowCore: 4.5},
    },
    right: {
      knot: [815.6, 636.9] as V,
      a: {ctrl: [807.1, 670.0] as V, tip: [786.9, 704.2] as V, width: 15.42},
      b: {ctrl: [823.0, 667.3] as V, tip: [850.6, 699.3] as V, width: 14.02, yellowCore: 4.5},
    },
  },

  knots: {
    left: {
      rim: {x: 243.5, y: 606.4, w: 43.4, h: 41.3, rx: 17.5},
      fill: {x: 246.0, y: 608.9, w: 38.5, h: 36.4, rx: 15.8},
      crossing: 'M254.7,609.9 C267.0,621.2 263.5,636.9 276.4,645.7',
    },
    right: {
      rim: {x: 792.1, y: 606.4, w: 43.4, h: 41.3, rx: 17.5},
      fill: {x: 794.6, y: 608.9, w: 38.5, h: 36.4, rx: 15.8},
      crossing: 'M803.3,609.9 C815.6,621.2 812.1,636.9 825.1,645.7',
    },
  },

  body: {x: 299.0, y: 328.5, w: 481.9, h: 422.9, rx: 101.5, stroke: 12.29},
  letter: {shadow: [29.51, 29.51] as V, stroke: 26.56},
  halftone: {grid: 7, r: 1.7, opacity: 0.16, rotate: 18},
  /** The logo's thread thickness basis for the roundness filter. */
  roundBasis: 30,
} as const;

export type Side = 'left' | 'right';
