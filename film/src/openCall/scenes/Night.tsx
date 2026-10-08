// Scenes 8 and 9: the night. The PACKED AT · PADHARO SA seal stamps down on the downbeat and the
// stamp turns the warm PULP back into the label. तेरी बारी threads onto the line like beads and hangs
// on it, its headline bar on the thread. Then a piece a beat: the tied imli, the flavour band, the
// date, the venue, the band. For the call to action the blank tag swings back in, DM TO PERFORM
// drops, and the thread ties off with the rakhi knot on the final Sa. The last frame is the grid
// cover: a whole Night 01 label with the thread at y 672.

import React from 'react';
import {C} from '../../brand';
import {popTransform} from '../../components/pop';
import {LabelText, ModakText} from '../../components/Type';
import {StampedSeal} from '../../label/Seal';
import {KnotBody} from '../../thread/RakhiKnot';
import {ThreadPiece} from '../../thread/ThreadPiece';
import {cumulative, quad, slice} from '../../thread/geometry';
import {inQuad, outCubic, releaseResponse, settle, span} from '../../utils/easing';
import {TiedImli} from '../../wrapper/TiedImli';
import {FlavourBand} from '../parts/FlavourBand';
import {LabelSheet} from '../parts/LabelSheet';
import {VenueSealArt} from '../parts/VenueSeal';
import {THREAD_Y} from '../thread';
import {HIT, seconds} from '../timing';

const typed = (frame: number, start: number, rate = 60) => Math.max(0, seconds(frame - start) * rate);

/** A drop from above onto the label, with a squash about the bottom edge `by`, settled after 30 frames. */
const Drop: React.FC<{frame: number; at: number; by: [number, number]; height?: number; children: React.ReactNode}> = ({
  frame,
  at,
  by,
  height = 260,
  children,
}) => {
  const k = frame - at;
  if (k < 0) return null;
  if (k >= 30) return <>{children}</>;
  const y = k < 6 ? -height * (1 - inQuad(k / 6)) : 0;
  const sq = k < 6 ? 0 : 0.12 * releaseResponse(seconds(k - 6), 6, 0.35);
  return (
    <g transform={`translate(0 ${y.toFixed(1)}) translate(${by[0]} ${by[1]}) scale(${(1 + sq * 0.6).toFixed(4)} ${(1 - sq).toFixed(4)}) translate(${-by[0]} ${-by[1]})`}>
      {children}
    </g>
  );
};

const AT = {
  headline: HIT.stamp + 6,
  imli: HIT.stamp + 20,
  band: HIT.stamp + 40,
  date: HIT.stamp + 60,
  venue: HIT.stamp + 80,
  strip: HIT.stamp + 100,
};

const SEAL = {at: [820, 1490] as [number, number], angle: -8};
const HEADLINE = {x: 360, size: 160};
/** Baseline that puts Modak's headline bar (0.59 em above the baseline) on the thread. */
const HEADLINE_BASE = THREAD_Y + 0.59 * HEADLINE.size;

/** Behind the thread: the label, everything printed on it, and the seal. */
export const NightBack: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.stamp) return null;
  const stripX = -1000 * (1 - outCubic(span(frame, AT.strip, AT.strip + 10)));
  return (
    <g>
      <LabelSheet uid="night">
        <Drop frame={frame} at={AT.imli} by={[540, 446]} height={600}>
          <g transform="translate(540 360) scale(0.42) translate(-540 -540)">
            <TiedImli uid="night-imli" />
          </g>
        </Drop>
        <Drop frame={frame} at={AT.band} by={[540, 554]}>
          <FlavourBand />
        </Drop>
        {frame >= AT.date ? (
          <g transform={popTransform(seconds(frame - AT.date), 390, 1200)}>
            <ModakText x={290} y={1200} size={230} anchor="start" text="17" fill={C.haldi} dressed={frame >= AT.date + 1} />
          </g>
        ) : null}
        <LabelText x={520} y={1112} size={84} weight={900} tracking={0.06} text="SAT" shown={typed(frame, AT.date + 8, 30)} />
        <LabelText x={520} y={1190} size={64} weight={900} tracking={0.06} text="OCTOBER" shown={typed(frame, AT.date + 14, 40)} />
        <LabelText x={540} y={1262} size={34} weight={800} tracking={0.12} anchor="middle" fill={C.cream} text="PADHARO SA · FREE ENTRY" shown={typed(frame, AT.venue)} />
        {frame >= AT.strip ? (
          <g transform={`translate(${stripX.toFixed(1)} 0)`}>
            <rect x={92} y={1296} width={896} height={76} fill={C.cream} stroke={C.ink} strokeWidth={4} />
            <LabelText x={540} y={1345} size={29} weight={900} tracking={0.12} anchor="middle" text="UNPLUGGED COVERS · COME SING OR COME LISTEN" shown={typed(frame, AT.strip + 6, 70)} />
          </g>
        ) : null}
        <Drop frame={frame} at={HIT.dm} by={[376, 1524]} height={320}>
          <rect x={92} y={1440} width={568} height={84} fill={C.haldi} stroke={C.ink} strokeWidth={5} />
          <LabelText x={376} y={1500} size={52} weight={900} tracking={0.16} anchor="middle" text="DM TO PERFORM" />
        </Drop>
      </LabelSheet>
      <StampedSeal uid="venue-seal" t={seconds(frame)} impact={seconds(HIT.stamp)} at={SEAL.at} spec={{number: '', rim: '', angle: SEAL.angle}} art={<VenueSealArt uid="venue" />} />
    </g>
  );
};

/** The seal falls for three frames before it lands, over the PULP. */
export const NightSealFalling: React.FC<{frame: number}> = ({frame}) =>
  frame >= HIT.stamp - 3 && frame < HIT.stamp ? (
    <StampedSeal uid="venue-seal" t={seconds(frame)} impact={seconds(HIT.stamp)} at={SEAL.at} spec={{number: '', rim: '', angle: SEAL.angle}} art={<VenueSealArt uid="venue" />} />
  ) : null;

const ENDS = [quad([925, 684], [916, 722], [898, 762], 20), quad([925, 684], [938, 720], [958, 754], 20)];

/** In front of the thread: तेरी बारी strung on it, and the knot that ties it off. */
export const NightFront: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.stamp) return null;
  const k = seconds(frame - AT.headline);
  const slide = k < 0 ? null : 760 * (1 - settle(k, 2.2, 0.62));
  const tie = frame - HIT.tieOff;
  const knot = tie < 0 ? 0 : 1 + 0.18 * releaseResponse(seconds(tie), 5, 0.4) - 0.18;
  return (
    <g>
      {slide !== null ? (
        <g transform={`translate(${slide.toFixed(1)} 0)`}>
          <ModakText x={HEADLINE.x} y={HEADLINE_BASE} size={HEADLINE.size} anchor="start" text="तेरी बारी" />
        </g>
      ) : null}
      {tie >= 0
        ? ENDS.map((e, i) => {
            const len = cumulative(e)[e.length - 1];
            return (
              <ThreadPiece
                key={i}
                uid={`end-${i}`}
                points={slice(e, 0, len * Math.min(1, span(tie, 0, 6)))}
                width={15}
                roundBasis={26}
                fray="end"
                yellowCore={i === 1 ? 4.5 : 0}
              />
            );
          })
        : null}
      {tie >= 0 ? <KnotBody uid="end-knot" center={[925, THREAD_Y]} size={46} scale={0.6 + 0.4 * knot} /> : null}
    </g>
  );
};
