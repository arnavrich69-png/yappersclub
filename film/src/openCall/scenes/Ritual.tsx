// Scene 7, मीठी डोर: the ritual every performer gets, in the printed tag's own words. Bar 10: the
// tied imli drops into the light, its wrapper untwists and falls away, the pod is bitten. Bar 11: a
// wrist rises to the thread, the kalava winds twice round it (the pitch rising as it tightens) and is
// tied off as a rakhi. Bar 12: the light floods tamarind brown, PULP, the film's one warm peak, and the
// camera pulls back along the thread through five tied wrists: YOU'RE KUL NOW.

import React from 'react';
import {C} from '../../brand';
import {GrainFilter, HalftonePattern} from '../../components/Print';
import {LabelText, ModakText} from '../../components/Type';
import {Wordmark} from '../../label/Wordmark';
import {inOutCubic, inQuad, outCubic, releaseResponse, settle, span} from '../../utils/easing';
import {randRange} from '../../utils/random';
import {OpenEnd} from '../../wrapper/OpenEnd';
import {Body, KnotBlob, Letter, LooseEnd, Wraps} from '../../wrapper/TiedImli';
import {FLAT, TWISTED, type OpenState} from '../../wrapper/untwist';
import {Pod} from '../parts/Pod';
import {SLEEVES, Wrist, WristTie} from '../parts/Wrist';
import {HIT, SCENE, seconds} from '../timing';
import {LIGHT} from './YourTurn';

const typed = (frame: number, start: number, rate = 60) => Math.max(0, seconds(frame - start) * rate);
const fall = (frame: number, start: number, g = 4200) => {
  const t = seconds(frame - start);
  return t <= 0 ? 0 : 0.5 * g * t * t;
};

// ---------------------------------------------------------------- bar 10: eat the imli

const CANDY = {c: [540, 1060] as const, scale: 0.6};
const LAND = HIT.ritual + 7;
const UNTWIST = {start: HIT.ritual + 6, end: HIT.ritual + 22};
const WRAPPER_FALLS = HIT.ritual + 22;
const POD = {scale: 0.42, angle: -4, leaves: HIT.bite + 24};

const untwistState = (frame: number): OpenState => {
  if (frame < UNTWIST.start) return TWISTED;
  if (frame >= UNTWIST.end) return FLAT;
  const k = seconds(frame - UNTWIST.start);
  return {open: span(frame, UNTWIST.start, UNTWIST.end - 2, inOutCubic), spin: 2 * Math.PI * settle(k, 1.9, 0.6), crinkle: 1, t: seconds(frame)};
};

const candyY = (frame: number) => {
  if (frame < LAND) return CANDY.c[1] - 1440 * (1 - inQuad(span(frame, HIT.ritual, LAND)));
  return CANDY.c[1];
};

const EatTheImli: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.ritual || frame >= HIT.wrist + 4) return null;
  const sq = frame < LAND ? 0 : 0.12 * releaseResponse(seconds(frame - LAND), 5, 0.35);
  const at = `translate(${CANDY.c[0]} ${candyY(frame).toFixed(1)}) scale(${(CANDY.scale * (1 + sq * 0.6)).toFixed(4)} ${(CANDY.scale * (1 - sq)).toFixed(4)}) translate(-540 -540)`;
  const tiesY = fall(frame, UNTWIST.start, 3600);
  const wrapperY = fall(frame, WRAPPER_FALLS, 3600);
  const podShown = frame >= WRAPPER_FALLS;
  const podY = fall(frame, POD.leaves, 4200);
  const bitten = frame >= HIT.bite;
  return (
    <g>
      {podShown && CANDY.c[1] + podY < 2200 ? (
        <g transform={`translate(${CANDY.c[0]} ${(CANDY.c[1] + podY).toFixed(1)}) rotate(${POD.angle + 0.04 * podY}) scale(${POD.scale})`}>
          <Pod uid="eaten-pod" bite={bitten} />
        </g>
      ) : null}
      {bitten
        ? [0, 1, 2].map((i) => {
            // Crumbs fly off the bite and fall.
            const t = seconds(frame - HIT.bite);
            const vx = randRange('crumb', i, -260, -120);
            const vy = randRange('crumb', 10 + i, -420, -220);
            const x = CANDY.c[0] - 350 * POD.scale + vx * t;
            const y = CANDY.c[1] + vy * t + 0.5 * 3000 * t * t;
            return y > 2000 ? null : <circle key={i} cx={x} cy={y} r={randRange('crumb', 20 + i, 6, 9)} fill="#B27B49" stroke={C.ink} strokeWidth={3} />;
          })
        : null}
      {CANDY.c[1] + wrapperY < 2400 ? (
        <g transform={`translate(0 ${wrapperY.toFixed(1)})`}>
          <g transform={at}>
            <OpenEnd side="left" state={untwistState(frame - 1)} />
            <OpenEnd side="right" state={untwistState(frame)} />
            <Body uid="ritual-body" />
            <Letter />
          </g>
        </g>
      ) : null}
      {CANDY.c[1] + tiesY < 2400 ? (
        <g transform={`translate(0 ${tiesY.toFixed(1)})`}>
          <g transform={at}>
            {(['left', 'right'] as const).map((side) => (
              <g key={side} transform={frame >= UNTWIST.start ? `rotate(${(side === 'left' ? -1 : 1) * 0.12 * tiesY} ${side === 'left' ? 262 : 818} 540)` : undefined}>
                <Wraps side={side} uid={`ritual-${side}`} />
                <LooseEnd uid={`ritual-${side}-a`} side={side} which="a" />
                <LooseEnd uid={`ritual-${side}-b`} side={side} which="b" />
                <KnotBlob side={side} uid={`ritual-${side}-k`} />
              </g>
            ))}
          </g>
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- bar 11 and 12: the wrists

/** World x of each wrist on the thread: you in the middle, the kul either side. */
const WRISTS = [0, -1, 1, -2, 2].map((k, i) => ({x: 540 + 420 * k, sleeve: SLEEVES[i], rise: i === 0 ? HIT.wrist : HIT.kul + 3 * i}));

/** Each wrist comes up from below and stops on the thread, its kalava on the line, without overshooting it. */
const wristY = (frame: number, rise: number) => {
  if (frame < rise) return null;
  const k = seconds(frame - rise);
  return 672 + 1400 * (1 - settle(k, 2.4, 0.9));
};

const TheKul: React.FC<{frame: number}> = ({frame}) => (
  <g>
    {WRISTS.map((w, i) => {
      const y = wristY(frame, w.rise);
      if (y === null) return null;
      const you = i === 0;
      const wound = you ? 2 * span(frame, HIT.wrist + 14, HIT.tie - 2, inOutCubic) : 2;
      const knot = you ? (frame < HIT.tie ? 0 : 1 + 0.15 * releaseResponse(seconds(frame - HIT.tie), 5, 0.4) - 0.15) : 1;
      return (
        <g key={i} transform={`translate(${w.x} ${y.toFixed(1)})`}>
          <Wrist uid={`wrist-${i}`} sleeve={w.sleeve} />
          <WristTie uid={`tie-${i}`} wound={wound} knot={knot} />
        </g>
      );
    })}
  </g>
);

// ---------------------------------------------------------------- PULP

/** Tamarind brown with darker fibres under the grain: the inside of the imli. */
const PulpArt: React.FC<{uid: string}> = ({uid}) => (
  <g>
    <defs>
      <pattern id={`${uid}-fibre`} width={160} height={70} patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
        <path d="M0,18 C40,8 80,30 160,16 M0,48 C50,58 100,36 160,52" fill="none" stroke="#4A2812" strokeWidth={3} opacity={0.5} />
      </pattern>
      <HalftonePattern id={`${uid}-ht`} />
      <GrainFilter id={`${uid}-grain`} />
    </defs>
    <rect x={-1200} y={-1200} width={3480} height={4320} fill={C.tamarind} />
    <rect x={-1200} y={-1200} width={3480} height={4320} fill={`url(#${uid}-fibre)`} />
    <rect x={-1200} y={-1200} width={3480} height={4320} fill={`url(#${uid}-ht)`} />
    <rect x={-1200} y={-1200} width={3480} height={4320} filter={`url(#${uid}-grain)`} opacity={0.5} />
  </g>
);

/** The light turns tamarind and floods out from where it was. */
const PulpFlood: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.kul) return null;
  const r = LIGHT.r + 1500 * span(frame, HIT.kul, HIT.kul + 16, outCubic);
  return (
    <g>
      <clipPath id="pulp-flood">
        <circle cx={LIGHT.cx} cy={LIGHT.cy} r={r} />
      </clipPath>
      <g clipPath="url(#pulp-flood)">
        <PulpArt uid="pulp" />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- words

/** मीठी डोर is written in, left to right, as if on the tag. */
const Written: React.FC<{frame: number; start: number; x0: number; width: number; children: React.ReactNode; id: string}> = ({
  frame,
  start,
  x0,
  width,
  children,
  id,
}) => {
  const p = span(frame, start, start + 14, inOutCubic);
  if (p <= 0) return null;
  return (
    <g>
      <clipPath id={id}>
        <rect x={x0 - 60} y={0} width={(width + 120) * p} height={1920} />
      </clipPath>
      <g clipPath={p < 1 ? `url(#${id})` : undefined}>{children}</g>
    </g>
  );
};

const Step: React.FC<{frame: number; start: number; end: number; n: string; lines: [string, string]; y: number; ink: boolean}> = ({
  frame,
  start,
  end,
  n,
  lines,
  y,
  ink,
}) => {
  if (frame < start || frame >= end + 20) return null;
  const drop = fall(frame, end, 4200);
  return (
    <g transform={`translate(0 ${drop.toFixed(1)})`}>
      <ModakText x={318} y={y + 50} size={110} anchor="start" text={n} />
      <LabelText x={410} y={y} size={44} weight={900} tracking={0.1} fill={ink ? C.ink : C.cream} text={lines[0]} shown={typed(frame, start + 4)} />
      <LabelText x={410} y={y + 52} size={44} weight={900} tracking={0.1} fill={ink ? C.ink : C.cream} text={lines[1]} shown={typed(frame, start + 4 + (lines[0].length * 30) / 60)} />
    </g>
  );
};

/** Behind the thread: the ritual's words, then the PULP flood over everything of the LANTERN. */
export const RitualBack: React.FC<{frame: number}> = ({frame}) => {
  if (frame < SCENE.ritual[0] || frame >= SCENE.ritual[1]) return null;
  const headerGone = fall(frame, HIT.wrist, 3800);
  return (
    <g>
      {headerGone < 1600 ? (
        <g transform={`translate(0 ${(-headerGone).toFixed(1)})`}>
          <Written frame={frame} start={HIT.ritual} x0={320} width={440} id="meethi-dor">
            <ModakText x={540} y={420} size={140} text="मीठी डोर" />
          </Written>
          <LabelText x={540} y={510} size={36} weight={900} tracking={0.14} anchor="middle" fill={C.cream} text="TANSEN'S TRICK, IN TWO STEPS" shown={typed(frame, HIT.ritual + 10)} />
        </g>
      ) : null}
      <Step frame={frame} start={HIT.ritual + 16} end={HIT.wrist} n="1" lines={['EAT THE IMLI', 'BEFORE YOU SING.']} y={1250} ink />
      <Step frame={frame} start={HIT.wrist + 6} end={SCENE.ritual[1] + 40} n="2" lines={['TIE THE THREAD ON', 'AFTER.']} y={330} ink={false} />
      <PulpFlood frame={frame} />
    </g>
  );
};

/** In front of the thread: the imli, then the wrists with their kalava. */
export const RitualFront: React.FC<{frame: number}> = ({frame}) => {
  if (frame < SCENE.ritual[0] || frame >= SCENE.ritual[1]) return null;
  return (
    <g>
      <EatTheImli frame={frame} />
      <TheKul frame={frame} />
    </g>
  );
};

/** On top, unmoved by the pull back: YOU'RE KUL NOW and the wordmark. */
export const RitualOverlay: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.kul || frame >= SCENE.ritual[1]) return null;
  const t = seconds(frame);
  const pop = (k: number) => seconds(HIT.wordmark) + k / 30;
  return (
    <g>
      <g transform="translate(540 330) scale(0.62) translate(-1000 -322)">
        <Wordmark t={t} starts={{dhva: pop(0), ni: pop(2), K: pop(5), U: pop(7), L: pop(9)}} fps={30} />
      </g>
      <LabelText x={540} y={480} size={44} weight={900} tracking={0.16} anchor="middle" fill={C.cream} text="YOU'RE KUL NOW" shown={typed(frame, HIT.kul + 4, 40)} />
    </g>
  );
};
