// Behind the thread in इमली क्यों?: the dark stage (bars 1 to 4: the candy's light, then Tansen's
// lamps and his rain), the imli wrapper the camera pans onto with his tomb printed on it and the
// story's words, PULP for the kul, the packet's directions, and at the end the wrapper folding into
// the ध्वनि KUL label on haldi.

import React from 'react';
import {C} from '../../brand';
import {GrainFilter, HalftonePattern} from '../../components/Print';
import {LabelArt, LABEL_PLACE} from '../../label/Label';
import {LabelSheet} from '../../openCall/parts/LabelSheet';
import {PrintMask} from '../../openCall/parts/PrintMask';
import {PulpArt} from '../../openCall/scenes/Ritual';
import {StageArt, type Spot} from '../../performer/Stage';
import {inOutCubic, outCubic, settle, span} from '../../utils/easing';
import {lerp} from '../../utils/math';
import {panAt} from '../camera';
import {Directions} from '../parts/Directions';
import {Tomb} from '../parts/Tomb';
import {HIT, seconds} from '../timing';
import {LampLight} from './Lamps';
import {RainBack} from './Rain';
import {WRIST_X} from './Things';
import {EnglishLine, HeroWord} from './Words';

export const LIGHT: Spot = {cx: 540, cy: 672, r: 380, falloff: 120};
export const TOMB = {x: 790, scale: 1.1};

/** The candy's light: on, then out with a flicker as the candy is flung off. */
const lightOn = (frame: number) => frame < HIT.lightOut || frame === HIT.lightOut + 2 || frame === HIT.lightOut + 5;

/** Bars 1 to 4: the dark stage, its light, the lamps' light, the rain, the words. Slides off as the camera pans. */
export const DarkBack: React.FC<{frame: number}> = ({frame}) => {
  if (frame >= HIT.panEnd) return null;
  const pan = panAt(frame);
  return (
    <g transform={`translate(${(-pan).toFixed(1)} 0)`}>
      <clipPath id="imli-dark-edge">
        <path d={`M-100,-100 L1104,-100 ${Array.from({length: 49}, (_, i) => `L${i % 2 === 0 ? 1104 : 1080},${-100 + i * 45}`).join(' ')} L1104,2100 L-100,2100 Z`} />
      </clipPath>
      <g clipPath="url(#imli-dark-edge)">
        <g transform="scale(1.0223 1)">
          <StageArt uid="imli-dark" lit={lightOn(frame)} spot={LIGHT} clear={[]} />
        </g>
        {/* The lamps hang on the thread, which does not pan: their light is placed where they are. */}
        <g transform={`translate(${pan.toFixed(1)} 0)`}>
          <LampLight frame={frame} />
        </g>
        <RainBack frame={frame} />
        <HeroWord frame={frame} id="imli-why" text="इमली क्यों?" at={HIT.hook} out={HIT.flingAway - 8} />
        <EnglishLine frame={frame} lines={['WHY DO OUR SINGERS GET A CANDY?']} start={HIT.question} end={HIT.flingAway - 2} />
        <HeroWord frame={frame} id="imli-tansen" text="तानसेन" at={HIT.tansen} out={HIT.deepak - 8} size={200} />
        <EnglishLine frame={frame} lines={["THE GREATEST SINGER OF AKBAR'S COURT"]} start={HIT.line1} end={HIT.deepak - 2} />
        <HeroWord frame={frame} id="imli-deepak" text="दीपक" at={HIT.deepak} out={HIT.malhar - 8} size={200} />
        <EnglishLine frame={frame} lines={['THEY SAY HIS RAAG DEEPAK LIT LAMPS']} start={HIT.line2} end={HIT.malhar - 2} />
        <HeroWord frame={frame} id="imli-malhar" text="मल्हार" at={HIT.malhar} size={200} />
        <EnglishLine frame={frame} lines={['AND HIS MALHAR BROUGHT THE RAIN']} start={HIT.line3} />
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

/** Bar 12: PULP floods out from the knot just tied, the film's one warm peak, until the candy lands. */
const PulpFlood: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.kul || frame >= HIT.ritual) return null;
  const r = 2600 * span(frame, HIT.kul, HIT.kul + 16, outCubic);
  return (
    <g>
      <clipPath id="imli-pulp-flood">
        <circle cx={WRIST_X} cy={682} r={Math.max(1, r)} />
      </clipPath>
      <g clipPath="url(#imli-pulp-flood)">
        <PulpArt uid="imli-pulp" />
      </g>
    </g>
  );
};

const DirectionsPrint: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.panel || frame >= HIT.label) return null;
  const p = 1 - span(frame, HIT.label - 8, HIT.label, inOutCubic);
  return (
    <g>
      {p < 1 ? <PrintMask id="imli-directions-out" p={p} /> : null}
      <g mask={p < 1 ? 'url(#imli-directions-out)' : undefined}>
        <Directions frame={frame} unroll={HIT.panel} rows={HIT.rows} />
        <HeroWord frame={frame} id="imli-meethi-dor" text="मीठी डोर" at={HIT.panel} size={170} y={1236} />
      </g>
    </g>
  );
};

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
        <HeroWord frame={frame} id="imli-gwalior" text="ग्वालियर" at={HIT.gwalior} out={HIT.sweet - 8} size={190} />
        <EnglishLine frame={frame} lines={['HE RESTS IN OUR CITY, GWALIOR']} start={HIT.line4} end={HIT.line5 - 2} />
        <EnglishLine frame={frame} lines={['BESIDE HIM GROWS AN IMLI TREE']} start={HIT.line5} end={HIT.line6 - 2} />
        <EnglishLine frame={frame} lines={['GWALIOR SAYS: CHEW ONE OF ITS LEAVES']} start={HIT.line6} end={HIT.line7 - 2} />
        <HeroWord frame={frame} id="imli-sweet" text="मीठी आवाज़" at={HIT.sweet} out={HIT.letGo} />
        <EnglishLine frame={frame} lines={['AND YOUR VOICE TURNS SWEET']} start={HIT.line7} end={HIT.line8 - 2} />
        <HeroWord frame={frame} id="imli-imli" text="इमली" at={HIT.knot} out={HIT.fling - 4} size={200} />
        <EnglishLine frame={frame} lines={['SO EVERY DHWANIKUL SINGER GETS AN IMLI']} start={HIT.line8} end={HIT.fling - 2} />
        {/* 13: the directions, unrolled from the thread, and the ritual's name, printed off before the fold. */}
        <DirectionsPrint frame={frame} />
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
      <PulpFlood frame={frame} />
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
