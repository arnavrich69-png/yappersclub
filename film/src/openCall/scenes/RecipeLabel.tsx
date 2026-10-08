// Scenes 4 and 5: the recipe packet, finished. Brand at the top, the flavour band, the thread across
// the grid line, the ingredients with the voice still missing, बस तू बाकी है. Space is left under
// the thread on the left for the blank tag. On the yank the whole sheet is pulled away to the left
// like a tablecloth: a short drag, then gone in under a quarter of a second, never blurred.

import React from 'react';
import {C} from '../../brand';
import {LabelText, ModakText} from '../../components/Type';
import {TiedImli} from '../../wrapper/TiedImli';
import {FlavourBand} from '../parts/FlavourBand';
import {IngredientsPanel} from '../parts/IngredientsPanel';
import {LabelSheet} from '../parts/LabelSheet';
import {caretOn} from '../tag';
import {HIT} from '../timing';

/** Frames the sheet takes to leave once the thread snaps. */
const YANK_FRAMES = 7;

/** Where the sheet is on `frame`: in place, being pulled away, or gone (null). */
const yankPose = (frame: number): string | null => {
  const k = frame - HIT.yank;
  if (k < 0) return '';
  if (k >= YANK_FRAMES - 1) return null;
  const s = (k + 1) / YANK_FRAMES;
  // Accelerating to the left, the free right side lifting a little as it goes.
  return `translate(${(-1500 * Math.pow(s, 2.2)).toFixed(1)} ${(-30 * s * s).toFixed(1)}) rotate(${(-5 * s).toFixed(2)} 0 960)`;
};

export const RecipeLabel: React.FC<{frame: number}> = ({frame}) => {
  const pose = yankPose(frame);
  if (pose === null) return null;
  return (
    <g transform={pose}>
      <LabelSheet uid="recipe">
        <g transform="translate(540 360) scale(0.42) translate(-540 -540)">
          <TiedImli uid="recipe-imli" />
        </g>
        <FlavourBand />
        <IngredientsPanel caret={caretOn(frame) && frame < HIT.yank} />
        <ModakText x={540} y={1290} size={150} text="बस तू बाकी है" />
        <LabelText x={540} y={1440} size={40} weight={900} tracking={0.14} anchor="middle" fill={C.cream} text="ONE INGREDIENT MISSING: YOU" />
        <LabelText x={540} y={1598} size={26} weight={800} tracking={0.14} anchor="middle" text="NET WT: ONE VOICE · BEST BEFORE: 17.10.2026" />
      </LabelSheet>
    </g>
  );
};
