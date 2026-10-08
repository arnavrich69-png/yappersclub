// Test bench for every thread ability: follow a path and slide, pluck between two fixed points,
// tie and untie the rakhi knot, whip with elastic overshoot, trail out of frame.
// Not part of any film; open it in the Studio to check the thread after changing it.

import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, THREAD} from '../brand';
import {Ground, Layer} from '../components/Print';
import {inOutCubic, outCubic, settle, span} from '../utils/easing';
import {deg, lerp, type V} from '../utils/math';
import {catmull, line, steer} from '../thread/geometry';
import {slideAlong, trail, whip} from '../thread/motion';
import {pluckedSpan} from '../thread/pluck';
import {RakhiKnot} from '../thread/RakhiKnot';
import {ThreadPiece} from '../thread/ThreadPiece';

const FPS = 30;
export const THREAD_LAB_FRAMES = 4 * FPS;

const Caption: React.FC<{y: number; children: string}> = ({y, children}) => (
  <text x={60} y={y} fontFamily="sans-serif" fontSize={26} fontWeight={700} fill={C.ink} letterSpacing={2}>
    {children}
  </text>
);

export const ThreadLab: React.FC = () => {
  const t = useCurrentFrame() / FPS;

  // 1. Any path, sliding: a wave that travels while the cotton slides along it.
  const wave = steer([-40, 300], 1200, (s) => deg(28) * Math.sin(s / 140 - t * 3), 120);
  const slide = slideAlong(catmull(wave, 2), 1200, 1200);

  // 2. Pluck between two fixed points on the story grid line (y = 672).
  const tau = t - 1.0;
  const pull = span(t, 0.4, 0.95, inOutCubic);
  const span2 = pluckedSpan([-20, THREAD.gridY9x16], [1100, THREAD.gridY9x16], {
    at: 0.38,
    amount: 70,
    tau,
    pull,
    f1: 15,
    decay: 3.2,
  });

  // 3. Rakhi knot on a host thread: tie with a final tug (overshoot), hold, then slip loose.
  const tie = t < 2.2 ? settle(t - 0.3, 1.6, 0.35) * 1.0 : lerp(1, 0, span(t, 2.4, 3.3, inOutCubic));
  const knotY = 1060;
  const knotSpec = {
    center: [540, knotY + 4] as V,
    size: 43,
    width: 15,
    openRadius: 52,
    endA: {heading: deg(113), length: 78},
    endB: {heading: deg(61), length: 78},
  };

  // 4. Whip: slack to taut with elastic follow-through; and a thread trailing a head out of frame.
  const slack = catmull([[80, 1420], [300, 1520], [560, 1400], [800, 1530], [1000, 1440]], 16);
  const taut = line([80, 1450], [1000, 1450], 60);
  const whipped = whip(slack, taut, t, {start: 0.6, lag: 0.22, f: 2.6, zeta: 0.32});
  const head = (time: number): V => {
    const k = outCubic(Math.min(1, Math.max(0, (time - 1.2) / 1.6)));
    return [lerp(-60, 1260, k), 1720 - 90 * Math.sin(k * Math.PI * 2)];
  };
  const trailed = trail(head, t, 520, Math.PI);

  return (
    <>
      <Ground />
      <Layer>
        <Caption y={210}>FOLLOW ANY PATH · SLIDE</Caption>
        <ThreadPiece uid="lab-slide" points={slide.points} material={slide.material} width={26} roundBasis={26} shadow={[0, 7.8]} cap="butt" />

        <Caption y={560}>PLUCK · STANDING WAVE</Caption>
        <ThreadPiece uid="lab-pluck" points={span2} width={THREAD.thickness.story9x16} roundBasis={32} shadow={[0, 9.6]} cap="butt" />

        <Caption y={940}>RAKHI KNOT · TIE AND UNTIE</Caption>
        <RakhiKnot uid="lab-knot-back" spec={knotSpec} p={tie} layer="back" />
        <ThreadPiece uid="lab-host" points={line([-20, knotY], [1100, knotY], 40)} width={26} roundBasis={26} shadow={[0, 7.8]} cap="butt" />
        <RakhiKnot uid="lab-knot-front" spec={knotSpec} p={tie} layer="front" />

        <Caption y={1330}>WHIP · ELASTIC OVERSHOOT · TRAIL</Caption>
        <ThreadPiece uid="lab-whip" points={whipped} width={22} roundBasis={22} shadow={[0, 6.6]} />
        <ThreadPiece uid="lab-trail" points={trailed} width={22} roundBasis={22} shadow={[0, 6.6]} fray="end" />
      </Layer>
    </>
  );
};
