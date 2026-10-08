// The brand tokens, read straight from brand/tokens.json so the film can never drift from the
// rules. BRAND-RULES.md is the law; this file only gives the values friendly names.

import tokens from '../../brand/tokens.json';

export const C = {
  imli: tokens.colors.imliOrange,
  haldi: tokens.colors.haldiYellow,
  cream: tokens.colors.cream,
  ink: tokens.colors.ink,
  tamarind: tokens.colors.tamarindBrown,
  wrapperDark: tokens.colors.wrapperDark,
  wrapperLight: tokens.colors.wrapperLight,
  thread: tokens.colors.thread.base,
  threadDark: tokens.colors.thread.dark,
  threadLight: tokens.colors.thread.light,
  strand: tokens.colors.thread.strand,
} as const;

export const THREAD = {
  twistDeg: tokens.thread.twistAngleDeg,
  tilePx: tokens.thread.patternTilePx,
  thickness: tokens.thread.thicknessPx,
  shadowOffsetRatio: tokens.thread.shadow.offsetRatioOfThickness,
  gridY9x16: tokens.thread.gridHeightPx.storyOrReel1080x1920,
} as const;

export const HALFTONE = tokens.label.halftone;

export const FRAME = {width: 1080, height: 1920, fps: 30} as const;
