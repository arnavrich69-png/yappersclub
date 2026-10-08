// Behind the thread in इमली क्यों?: the dark stage with the candy's light (bar 1), the imli wrapper the
// camera pans onto, Tansen's tomb printed on it, the words, and at the end the wrapper folding into
// the ध्वनि KUL label on haldi.

import React from 'react';
import {C} from '../../brand';
import {GrainFilter, HalftonePattern} from '../../components/Print';
import {LabelArt, LABEL_PLACE} from '../../label/Label';
import {LabelSheet} from '../../openCall/parts/LabelSheet';
import {PrintMask} from '../../openCall/parts/PrintMask';
import {StageArt, type Spot} from '../../performer/Stage';
import {inOutCubic, settle, span} from '../../utils/easing';
import {lerp} from '../../utils/math';
import {panAt} from '../camera';
import {Tomb} from '../parts/Tomb';
import {HIT, seconds} from '../timing';
import {EnglishLine, HeroWord} from './Words';

export const LIGHT: Spot = {cx: 540, cy: 672, r: 380, falloff: 120};
export const TOMB = {x: 790, scale: 1.1};
/** Bar 7's words stand left of the wrist. */
const KUL_TEXT_X = 380;

/** Bar 1: the dark stage, one light on the candy, the question. Slides off as the camera pans. */
export const DarkBack: React.FC<{frame: number}> = ({frame}) => {
  if (frame >= HIT.panEnd) return null;
  return (
    <g transform={`translate(${(-panAt(frame)).toFixed(1)} 0)`}>
      <clipPath id="imli-dark-edge">
        <path d={`M-100,-100 L1104,-100 ${Array.from({length: 49}, (_, i) => `L${i % 2 === 0 ? 1104 : 1080},${-100 + i * 45}`).join(' ')} L1104,2100 L-100,2100 Z`} />
      </clipPath>
      <g clipPath="url(#imli-dark-edge)">
        <g transform="scale(1.0223 1)">
          <StageArt uid="imli-dark" lit spot={LIGHT} clear={[]} />
        </g>
        <HeroWord frame={frame} id="imli-why" text="इमली क्यों?" at={HIT.hook} />
        <EnglishLine frame={frame} lines={['WHY DO OUR SINGERS GET A CANDY?']} start={HIT.question} />
      </g>
    </g>
  );
};

/** The wrapper's frame on `frame`: arriving with the pan, in place; at the end, folding into the label. */
const paperShift = (frame: number) => (frame < HIT.panEnd ? 1080 - panAt(frame) : 0);

const ROUND = {x0: 92, y0: 572.6, x1: 988, y1: 915, r: 75};

/** The wrapper shrinking into the label's shape (frame coordinates), overshooting a touch like paper snapping. */
const foldRect = (frame: number) => {
  const k = settle(seconds(frame - HIT.label), 3.2, 0.62);
  return {
    x: lerp(-60, ROUND.x0, k),
    y: lerp(-60, ROUND.y0, k),
    w: lerp(1200, ROUND.x1 - ROUND.x0, k),
    h: lerp(2040, ROUND.y1 - ROUND.y0, k),
    r: lerp(0, ROUND.r, Math.min(1, k)),
  };
};

const FOLDED = HIT.label + 12;

export const WrapperBack: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.panStart) return null;
  const tombIn = span(frame, HIT.tomb, HIT.tomb + 14, inOutCubic);
  const tombOut = 1 - span(frame, HIT.letGo, HIT.letGo + 14, inOutCubic);
  const tomb = Math.min(tombIn, tombOut);
  const folding = frame >= HIT.label;
  const r = folding ? foldRect(frame) : null;
  const paper = (
    <g transform={`translate(${paperShift(frame).toFixed(1)} 0)`}>
      <LabelSheet uid="imli-wrapper" border={0}>
        {tomb > 0 ? (
          <g>
            {tomb < 1 ? <PrintMask id="imli-tomb-print" p={tomb} /> : null}
            <g mask={tomb < 1 ? 'url(#imli-tomb-print)' : undefined}>
              <g transform={`translate(${TOMB.x} 672) scale(${TOMB.scale})`}>
                <Tomb uid="imli-tomb" />
              </g>
            </g>
          </g>
        ) : null}
        <HeroWord frame={frame} id="imli-tansen" text="तानसेन" at={HIT.tansen} out={HIT.sweet - 8} size={200} />
        <EnglishLine frame={frame} lines={["THE GREATEST SINGER OF AKBAR'S COURT"]} start={HIT.line1} end={HIT.line2 - 2} />
        <EnglishLine frame={frame} lines={['HE RESTS IN GWALIOR, BESIDE AN IMLI TREE']} start={HIT.line2} end={HIT.line3 - 2} />
        <EnglishLine frame={frame} lines={['GWALIOR SAYS: CHEW ONE OF ITS LEAVES']} start={HIT.line3} end={HIT.line4 - 2} />
        <HeroWord frame={frame} id="imli-sweet" text="मीठी आवाज़" at={HIT.sweet} out={HIT.letGo} />
        <EnglishLine frame={frame} lines={['AND YOUR VOICE TURNS SWEET']} start={HIT.line4} end={HIT.line5 - 2} />
        <HeroWord frame={frame} id="imli-imli" text="इमली" at={HIT.knot} out={HIT.fling - 4} size={200} />
        <EnglishLine frame={frame} lines={['SO EVERY DHWANIKUL SINGER GETS AN IMLI']} start={HIT.line5} end={HIT.line6 - 2} />
        {/* Beside the wrist, which stands on the right. */}
        <HeroWord frame={frame} id="imli-kul" text="कुल" at={HIT.tie} size={230} x={KUL_TEXT_X} />
        <EnglishLine frame={frame} lines={['TIED WITH THE THREAD', 'THAT MAKES YOU FAMILY']} start={HIT.line6} x={KUL_TEXT_X} />
      </LabelSheet>
    </g>
  );
  return (
    <g>
      {folding ? <Haldi /> : null}
      {r && frame < FOLDED ? (
        <>
          <clipPath id="imli-fold">
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={r.r} />
          </clipPath>
          <g clipPath="url(#imli-fold)">{paper}</g>
        </>
      ) : null}
      {!folding ? paper : null}
      {frame >= FOLDED ? (
        <g transform={LABEL_PLACE}>
          <LabelArt uid="imli-label" />
        </g>
      ) : null}
    </g>
  );
};

/** The haldi ground the label lands on, printed like the paper. */
const Haldi: React.FC = () => (
  <g>
    <defs>
      <HalftonePattern id="imli-haldi-ht" />
      <GrainFilter id="imli-haldi-grain" />
    </defs>
    <rect x={-60} y={-60} width={1200} height={2040} fill={C.haldi} />
    <rect x={-60} y={-60} width={1200} height={2040} fill="url(#imli-haldi-ht)" />
    <rect x={-60} y={-60} width={1200} height={2040} filter="url(#imli-haldi-grain)" opacity={0.5} style={{mixBlendMode: 'multiply'}} />
  </g>
);
