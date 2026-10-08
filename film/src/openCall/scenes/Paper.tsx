// Scenes 2 to 5: the paper. The camera pans off the dark stage onto an imli wrapper; the thread is
// lifted into Tansen's tree over it and तानसेन की इमली prints in. When the tied imli lands at the
// top, the wrapper becomes the recipe packet: the border draws itself in, the flavour band drops,
// the ingredients panel unrolls from the thread and is written a row a beat, बस तू बाकी है lands with
// a thud. On the yank the whole sheet is pulled away to the left like a tablecloth, never blurred.

import React from 'react';
import {C} from '../../brand';
import {LabelText, ModakText} from '../../components/Type';
import {inOutCubic, inQuad, releaseResponse, span} from '../../utils/easing';
import {panAt} from '../camera';
import {FlavourBand} from '../parts/FlavourBand';
import {IngredientsPanel} from '../parts/IngredientsPanel';
import {LabelSheet} from '../parts/LabelSheet';
import {PrintMask} from '../parts/PrintMask';
import {caretOn} from '../tag';
import {HIT, seconds} from '../timing';
import {LandedImli} from './Opening';

/** Frames the sheet takes to leave once the thread snaps. */
const YANK_FRAMES = 7;

/** Where the paper is on `frame`: arriving with the pan, in place, pulled away, or gone (null). */
const paperPose = (frame: number): string | null => {
  if (frame < HIT.panStart) return null;
  const k = frame - HIT.yank;
  if (k >= YANK_FRAMES - 1) return null;
  if (k >= 0) {
    const s = (k + 1) / YANK_FRAMES;
    // Accelerating to the left, the free right side lifting a little as it goes.
    return `translate(${(-1500 * Math.pow(s, 2.2)).toFixed(1)} ${(-30 * s * s).toFixed(1)}) rotate(${(-5 * s).toFixed(2)} 0 960)`;
  }
  const pan = panAt(frame);
  return pan < 1080 ? `translate(${(1080 - pan).toFixed(1)} 0)` : '';
};

/** तानसेन की इमली and its line: printed in on Re, printed out again as the imli is tied. */
const LegendWords: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.title || frame >= HIT.knot + 8) return null;
  const p = Math.min(span(frame, HIT.title, HIT.title + 14, inOutCubic), 1 - span(frame, HIT.knot, HIT.knot + 8, inOutCubic));
  return (
    <g>
      {p < 1 ? <PrintMask id="legend-print" p={p} /> : null}
      <g mask={p < 1 ? 'url(#legend-print)' : undefined}>
        <ModakText x={540} y={1150} size={124} text="तानसेन की इमली" />
        <LabelText
          x={540}
          y={1260}
          size={36}
          weight={900}
          tracking={0.12}
          anchor="middle"
          fill={C.cream}
          text="GWALIOR SAYS IT SWEETENED HIS VOICE"
          shown={Math.max(0, seconds(frame - HIT.english2) * 60)}
        />
      </g>
    </g>
  );
};

/** The flavour band drops onto the packet and squashes as it lands. */
const BAND_AT = HIT.label + 6;
const BandDrop: React.FC<{frame: number}> = ({frame}) => {
  const k = frame - BAND_AT;
  if (k < 0) return null;
  if (k >= 30) return <FlavourBand />;
  const y = k < 6 ? -220 * (1 - inQuad(k / 6)) : 0;
  const sq = k < 6 ? 0 : 0.14 * releaseResponse(seconds(k - 6), 6, 0.35);
  return (
    <g transform={`translate(0 ${y.toFixed(1)}) translate(540 554) scale(${(1 + sq * 0.5).toFixed(4)} ${(1 - sq).toFixed(4)}) translate(-540 -554)`}>
      <FlavourBand />
    </g>
  );
};

/** बस तू बाकी है lands like a weight: a fast drop, a heavy squash, a slow settle. */
const Headline: React.FC<{frame: number}> = ({frame}) => {
  const k = frame - HIT.headline;
  if (k < 0) return null;
  const word = <ModakText x={540} y={1290} size={150} text="बस तू बाकी है" />;
  if (k >= 30) return word;
  const y = k < 6 ? -900 * (1 - inQuad(k / 6)) : 0;
  const sq = k < 6 ? 0 : 0.12 * releaseResponse(seconds(k - 6), 5, 0.35);
  return (
    <g transform={`translate(0 ${y.toFixed(1)}) translate(540 1290) scale(${(1 + sq * 0.7).toFixed(4)} ${(1 - sq).toFixed(4)}) translate(-540 -1290)`}>
      {word}
    </g>
  );
};

export const Paper: React.FC<{frame: number}> = ({frame}) => {
  const pose = paperPose(frame);
  if (pose === null) return null;
  const border = frame < HIT.label ? 0 : span(frame, HIT.label, HIT.label + 14, inOutCubic);
  return (
    <g transform={pose}>
      <LabelSheet uid="recipe" border={border}>
        <LegendWords frame={frame} />
        <LandedImli frame={frame} />
        <BandDrop frame={frame} />
        <IngredientsPanel caret={caretOn(frame) && frame < HIT.yank} frame={frame} timing={{unroll: HIT.panel, rows: [...HIT.rows]}} />
        <Headline frame={frame} />
        {frame >= HIT.headline + 8 ? (
          <LabelText
            x={540}
            y={1440}
            size={40}
            weight={900}
            tracking={0.14}
            anchor="middle"
            fill={C.cream}
            text="ONE INGREDIENT MISSING: YOU"
            shown={Math.max(0, seconds(frame - HIT.headline - 8) * 60)}
          />
        ) : null}
        {frame >= HIT.headline + 20 ? (
          <LabelText
            x={540}
            y={1598}
            size={26}
            weight={800}
            tracking={0.14}
            anchor="middle"
            text="NET WT: ONE VOICE · BEST BEFORE: 17.10.2026"
            shown={Math.max(0, seconds(frame - HIT.headline - 20) * 60)}
          />
        ) : null}
      </LabelSheet>
    </g>
  );
};
