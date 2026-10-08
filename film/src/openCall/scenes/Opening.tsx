// Scenes 1 to 3. In the dark a packet hand plucks the thread: the first note, पहला सुर, then three
// rising notes, किसका? The camera pans along the thread off the dark stage onto an imli wrapper,
// where the thread is lifted into Tansen's tamarind tree from both trunk bases at once, a stop per
// note, the printed tree rising inside it. A pod falls, the thread lets the tree go and catches it,
// a wrapper twists shut round it, the thread ties it and flings the tied imli up into its place at
// the top of the packet. The thread is never cut: one line from edge to edge the whole time.

import React from 'react';
import {C, THREAD} from '../../brand';
import {Finger, type FingerPose} from '../../components/Finger';
import {popTransform} from '../../components/pop';
import {LabelText, ModakText} from '../../components/Type';
import {StageArt} from '../../performer/Stage';
import {ThreadPiece} from '../../thread/ThreadPiece';
import {cumulative, slice} from '../../thread/geometry';
import {inCubic, inOutCubic, outCubic, releaseResponse, settle, span} from '../../utils/easing';
import {add, clamp, deg, dist, lerp, mul, norm, perp, sub, type V} from '../../utils/math';
import {OpenEnd} from '../../wrapper/OpenEnd';
import {Body, KnotBlob, Letter, LooseEnd, TiedImli, Wraps} from '../../wrapper/TiedImli';
import {FLAT, TWISTED, type OpenState} from '../../wrapper/untwist';
import {panAt} from '../camera';
import {Pod} from '../parts/Pod';
import {PrintMask} from '../parts/PrintMask';
import {TreePrint} from '../parts/TreePrint';
import {FALLING_POD, PODS, POD_SCALE, TREE_BASE, TREE_HALVES, TREE_LOOP, TREE_STOPS} from '../parts/tree';
import {LEFT, RIGHT, THREAD_WIDTH, THREAD_Y, ringAt, restYAt, threadPoints, type Bend} from '../thread';
import {HIT, seconds} from '../timing';

// ---------------------------------------------------------------- scene 1: the question

/** The four notes the hand plays: Sa, then Re, Ga, Pa rising. Where along the thread, and when. */
const PLUCKS = [
  {x: 540, at: HIT.firstNote},
  {x: 600, at: HIT.rising[0]},
  {x: 660, at: HIT.rising[1]},
  {x: 750, at: HIT.rising[2]},
];
const PULL = 6;
const PULL_DEPTH = 14;
const FINGER_ANGLE = 0.6;

/** The hand: where its fingertip is and how far it pulls the thread down. */
const fingerAt = (frame: number): {pose: FingerPose; pull: Bend} | null => {
  if (frame > HIT.question + 9) return null;
  let x = PLUCKS[0].x;
  let depth = 0;
  let follow = 0;
  for (let i = 0; i < PLUCKS.length; i++) {
    const p = PLUCKS[i];
    const next = PLUCKS[i + 1];
    if (frame >= p.at) {
      // After a release the fingertip follows through, then moves on to the next note.
      follow = 10 * Math.exp(-seconds(frame - p.at) * 14);
      x = next ? lerp(p.x, next.x, span(frame, p.at + 3, next.at - PULL, inOutCubic)) : lerp(p.x, 1500, span(frame, p.at + 1, p.at + 8, inCubic));
      if (!next) follow += 480 * span(frame, p.at + 1, p.at + 8, inCubic);
    }
    if (frame >= p.at - PULL && frame < p.at) {
      x = p.x;
      depth = PULL_DEPTH * inOutCubic((frame - (p.at - PULL)) / PULL);
      follow = 0;
    }
  }
  const contact: V = [x, THREAD_Y + THREAD_WIDTH / 2 + depth + follow];
  return {pose: {contact, angle: FINGER_ANGLE, lift: 0.15, size: 0.72}, pull: depth > 0 ? [[x, depth]] : []};
};

const QUESTION = {size: 150, x: 340, y: 1000, mark: 340 + 2.8052 * 150};

/** The dark stage of scene 1, with its words. Slides off to the left as the camera pans. */
const DarkWorld: React.FC<{frame: number}> = ({frame}) => {
  const ring = Math.exp(-seconds(frame) / 0.35) * (frame % 2 === 0 ? 1 : -1);
  const qk = frame - HIT.question;
  const markK = frame - (HIT.question + 4);
  // The question mark drops in last and lands with a little squash.
  const markY = markK < 0 ? 0 : markK < 6 ? -220 * (1 - inCubic(markK / 6)) : 0;
  const markSquash = markK >= 6 ? 0.1 * releaseResponse(seconds(markK - 6), 7, 0.35) : 0;
  return (
    <g>
      <clipPath id="dark-edge">
        <path d={`M-100,-100 L1104,-100 ${Array.from({length: 49}, (_, i) => `L${i % 2 === 0 ? 1104 : 1080},${-100 + i * 45}`).join(' ')} L1104,2100 L-100,2100 Z`} />
      </clipPath>
      <g clipPath="url(#dark-edge)">
        {/* The stage runs on past the frame's edge to the tips of the torn edge. */}
        <g transform="scale(1.0223 1)">
          <StageArt uid="dark" lit={false} />
        </g>
        <g transform={`translate(0 ${(5 * ring).toFixed(2)}) ${popTransform(seconds(frame - HIT.firstNote), 540, 480)}`}>
          <ModakText x={540} y={480} size={150} text="पहला सुर" dressed={frame >= HIT.firstNote + 1} />
        </g>
        {qk >= 0 ? (
          <g transform={popTransform(seconds(qk), QUESTION.x + 210, QUESTION.y)}>
            <ModakText x={QUESTION.x} y={QUESTION.y} size={QUESTION.size} anchor="start" text="किसका" dressed={qk >= 1} />
          </g>
        ) : null}
        {markK >= 0 ? (
          <g transform={`translate(0 ${markY.toFixed(1)}) translate(${QUESTION.mark + 40} ${QUESTION.y}) scale(${(1 + markSquash * 0.6).toFixed(4)} ${(1 - markSquash).toFixed(4)}) translate(${-QUESTION.mark - 40} ${-QUESTION.y})`}>
            <ModakText x={QUESTION.mark} y={QUESTION.y} size={QUESTION.size} anchor="start" text="?" />
          </g>
        ) : null}
        <LabelText
          x={340}
          y={1090}
          size={36}
          weight={900}
          tracking={0.12}
          fill={C.cream}
          text="NIGHT 01 NEEDS ITS FIRST VOICES"
          shown={Math.max(0, seconds(frame - HIT.english1) * 60)}
        />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- scene 2: the tree

/** When the tree has been let go again, flat on the line. */
const UNPICKED = HIT.podFalls + 16;

/**
 * How far the thread has been lifted into the tree: 0 flat on the line, 1 trunk and branches, 2 the
 * lower canopy, 3 the upper canopy, 4 the outline closed at the top. Each note snaps it up to the
 * next stop with a little overshoot, like a string; the last closes it exactly. When the pod falls,
 * the tree is let go back down into the line.
 */
const liftAt = (frame: number) => {
  let q = 0;
  for (let i = 0; i < HIT.draw.length; i++) {
    if (frame < HIT.draw[i]) break;
    const t = seconds(frame - HIT.draw[i]);
    q = i + (i === HIT.draw.length - 1 ? outCubic(clamp(t / 0.3)) : settle(t, 3.2, 0.55));
  }
  return q * (1 - span(frame, HIT.podFalls, UNPICKED, inOutCubic));
};

/** Arc length up one half of the tree for a lift q, moving evenly between the stops. */
const climb = (stops: number[], q: number) => {
  const i = Math.min(stops.length - 2, Math.max(0, Math.floor(q)));
  return Math.min(stops[stops.length - 1], lerp(stops[i], stops[i + 1], q - i));
};

const LOOP_LEN = cumulative(TREE_LOOP)[TREE_LOOP.length - 1];

/** How much of its height the crown above the climbing points has: flat on the line at first, then a low dome, the whole crown at the top. */
const domeAt = (q: number) => (q <= 1 ? 0.45 * q : q <= 3 ? 0.45 : 0.45 + 0.55 * (q - 3));

/**
 * The tree as lifted so far: each half from its trunk base up to its climbing point, and the crown:
 * the rest of the outline between the two climbing points, pressed down towards them into a low
 * leafy dome (and, while the trunk is still rising, drawn in over it). So at every stop it is a tree,
 * a little taller and rounder on each note.
 */
const treeShape = (q: number) => {
  const sL = climb(TREE_STOPS.left, q);
  const sR = climb(TREE_STOPS.right, q);
  const left = slice(TREE_HALVES.left, 0, sL);
  const right = slice(TREE_HALVES.right, 0, sR);
  const a = left[left.length - 1];
  const ab = sub(right[right.length - 1], a);
  const len2 = ab[0] * ab[0] + ab[1] * ab[1];
  const f = domeAt(q);
  const reach = clamp(q);
  const crown = slice(TREE_LOOP, sL, LOOP_LEN - sR).map((p): V => {
    const t = len2 > 0 ? ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / len2 : 0;
    const out = t < 0 ? t * reach : t > 1 ? 1 + (t - 1) * reach : t;
    const foot = add(a, mul(ab, t));
    return add(add(a, mul(ab, out)), mul(sub(p, foot), f));
  });
  return {left, crown, right};
};

/** The crown rings on every note that lifts it, like a plucked string between the two climbing points. */
const ringCrown = (frame: number, crown: V[]): V[] => {
  const a = crown[0];
  const b = crown[crown.length - 1];
  const len = dist(a, b);
  if (len < 2) return crown;
  const across = norm(perp(sub(b, a)));
  let ring = 0;
  for (const at of HIT.draw) {
    const age = frame - at;
    if (age >= 0) ring += 12 * (age % 2 === 0 ? 1 : -1) * Math.exp(-seconds(age) / 0.35);
  }
  ring *= Math.min(1, len / 300);
  return crown.map((p, i) => add(p, mul(across, ring * Math.sin((Math.PI * i) / (crown.length - 1)))));
};

/** Where the tree's outline meets the line it moves with the line: bent with it and ringing, fading out up the trunk. */
const withLine = (frame: number, bend: Bend, pts: V[]): V[] =>
  pts.map(([x, y]) => [x, y + (restYAt(x, bend) - THREAD_Y + ringAt(frame, x)) * clamp(1 - Math.abs(y - THREAD_Y) / 40)]);

// ---------------------------------------------------------------- scene 3: caught, wrapped, tied, flung

const CANDY = {scale: 0.42, home: [540, 360] as V};
const CATCH = {x: 760, at: HIT.podFalls + 8, depth: 58};
const NECK = (540 - 262) * CANDY.scale;

/** The stem's tip in pod coordinates (svg-parts/tamarind-pod.svg). */
const STEM_TIP: V = [411, -5];

const podHang = (i: number): {attach: V; c: V; angle: number} => {
  const {at, tilt} = PODS[i];
  // Hanging with the stem up: the stem's tip sits on the canopy's edge.
  return {attach: at, c: [at[0] - STEM_TIP[1] * POD_SCALE, at[1] + STEM_TIP[0] * POD_SCALE], angle: -90 + tilt};
};

/** Depth of the caught pod in the thread: drops in, bounces on the elastic thread, settles. */
const catchDepth = (frame: number) => (frame < CATCH.at ? 0 : CATCH.depth * (1 - releaseResponse(seconds(frame - CATCH.at), 3, 0.32)));

/** The falling pod, until the wrapper closes round it. */
const fallingPod = (frame: number): {c: V; angle: number} | null => {
  if (frame < HIT.podFalls || frame >= HIT.wrap + 2) return null;
  const hang = podHang(FALLING_POD);
  if (frame < CATCH.at) {
    const k = span(frame, HIT.podFalls, CATCH.at);
    return {c: [lerp(hang.c[0], CATCH.x, k), lerp(hang.c[1], THREAD_Y - 8, k * k)], angle: lerp(hang.angle, -8, outCubic(k))};
  }
  return {c: [CATCH.x, THREAD_Y - 8 + catchDepth(frame)], angle: -8 + 3 * Math.sin(seconds(frame - CATCH.at) * 12) * Math.exp(-seconds(frame - CATCH.at) * 4)};
};

/** Where the candy is: in the thread's dip, then flung up to the top of the packet. */
const candyAt = (frame: number): {c: V; rot: number; sx: number; sy: number} => {
  const caught: V = [CATCH.x, THREAD_Y - 8 + catchDepth(frame)];
  if (frame < HIT.fling) return {c: caught, rot: -8, sx: 1, sy: 1};
  const land = HIT.fling + 12;
  if (frame < land) {
    const k = span(frame, HIT.fling, land);
    const e = outCubic(k);
    // Shot up by the thread: fast off the line, slowing as it arrives, a little arc to the left.
    return {c: [lerp(caught[0], CANDY.home[0], e), lerp(caught[1], CANDY.home[1], e) - 60 * Math.sin(Math.PI * k)], rot: lerp(-8, 4, e), sx: 0.96, sy: 1.06};
  }
  const sq = 0.08 * releaseResponse(seconds(frame - land), 6, 0.35);
  return {c: CANDY.home, rot: 4 * releaseResponse(seconds(frame - land), 3, 0.4), sx: 1 + sq * 0.6, sy: 1 - sq};
};

const twistShut = (frame: number): OpenState => {
  if (frame < HIT.wrap) return FLAT;
  const p = span(frame, HIT.wrap, HIT.wrap + 16, inOutCubic);
  if (p >= 1) return TWISTED;
  return {open: 1 - p, spin: 2 * Math.PI * (1 - p), crinkle: 1, t: seconds(frame)};
};

const candyPlace = (c: {c: V; rot: number; sx: number; sy: number}) =>
  `translate(${c.c[0].toFixed(2)} ${c.c[1].toFixed(2)}) rotate(${c.rot.toFixed(3)}) scale(${(CANDY.scale * c.sx).toFixed(4)} ${(CANDY.scale * c.sy).toFixed(4)}) translate(-540 -540)`;

/** The candy being made in front of the thread: popped round the pod, twisted shut, tied. */
const Candy: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.wrap || frame >= HIT.fling + 12) return null;
  const c = candyAt(frame);
  const pop = popTransform(seconds(frame - HIT.wrap), 540, 540);
  const tied = frame >= HIT.knot;
  const cinch = tied ? 1 + 0.25 * releaseResponse(seconds(frame - HIT.knot), 6, 0.4) : 1;
  const tie = (side: 'left' | 'right') => {
    const n = side === 'left' ? 262 : 818;
    return `translate(${n} 540) scale(${cinch.toFixed(4)}) translate(${-n} -540)`;
  };
  return (
    <g transform={candyPlace(c)}>
      <g transform={pop}>
        <OpenEnd side="left" state={twistShut(frame - 1)} />
        <OpenEnd side="right" state={twistShut(frame)} />
        {tied
          ? (['left', 'right'] as const).map((side) => (
              <g key={side} transform={tie(side)}>
                <Wraps side={side} uid={`candy-${side}`} />
                <LooseEnd uid={`candy-${side}-a`} side={side} which="a" />
                <LooseEnd uid={`candy-${side}-b`} side={side} which="b" />
                <KnotBlob side={side} uid={`candy-${side}-k`} />
              </g>
            ))
          : null}
        <Body uid="candy-body" />
        <Letter />
      </g>
    </g>
  );
};

/** The tied imli once it has landed: the logo itself, settling into the top of the packet. */
export const LandedImli: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.fling + 12) return null;
  const c = candyAt(frame);
  return (
    <g transform={candyPlace(c)}>
      <TiedImli uid="landed-imli" />
    </g>
  );
};

// ---------------------------------------------------------------- the thread, scenes 1 to 3

/** The pod's dip, then the candy's two necks, then let go: how the scene 3 thread is bent. */
const scene3Bend = (frame: number): Bend => {
  if (frame < CATCH.at || frame >= HIT.fling + 2) return [];
  const d = catchDepth(frame);
  if (frame < HIT.wrap) return [[CATCH.x, d]];
  const k = span(frame, HIT.wrap, HIT.wrap + 8, inOutCubic);
  const release = frame >= HIT.fling ? 1 - (frame - HIT.fling) / 2 : 1;
  return [
    [CATCH.x - NECK * k, d * release],
    [CATCH.x + NECK * k, d * release],
  ];
};

/**
 * The stripes on the thread travel with the camera as it pans along it. The pattern repeats every
 * 30 / cos(32 deg) px of cotton, so over the pan they travel a whole number of repeats (31, 1.5% more
 * than the pan itself) and the thread after the pan is stripe for stripe the thread of the later scenes.
 */
const STRIPE_REPEAT = THREAD.tilePx / Math.cos(deg(32));
const PAN_MATERIAL = (31 * STRIPE_REPEAT) / 1080;

/** The thread from the first frame to the end of scene 3: one line from edge to edge (frame coordinates). */
export const openingThread = (frame: number): V[] => {
  const pan = panAt(frame);
  const q = liftAt(frame);
  if (q <= 0) {
    // Scene 1 and the pan: plucked by the hand. Scene 3: caught pod, candy necks, the fling.
    const f = fingerAt(frame);
    const bend: Bend = f ? f.pull.map(([x, d]) => [x - pan, d]) : scene3Bend(frame);
    return threadPoints(frame, bend);
  }
  // Scene 2: in along the line, up the left half, across, down the right half, on along the line.
  const bend = scene3Bend(frame);
  const tree = treeShape(q);
  const pts = [
    ...threadPoints(frame, bend, LEFT, TREE_BASE.left),
    ...withLine(frame, bend, [...tree.left.slice(1), ...ringCrown(frame, tree.crown).slice(1, -1), ...[...tree.right].reverse().slice(0, -1)]),
    ...threadPoints(frame, bend, TREE_BASE.right, RIGHT),
  ];
  // Where the two climbing points meet at the top they are one point.
  return pts.filter((p, i) => i === 0 || dist(p, pts[i - 1]) > 0.5);
};

/** The opening's thread. */
export const OpeningThreadPiece: React.FC<{frame: number}> = ({frame}) => (
  <ThreadPiece
    uid="oc-thread"
    points={openingThread(frame)}
    width={THREAD_WIDTH}
    roundBasis={32}
    shadow={[0, 9.6]}
    cap="butt"
    materialOffset={panAt(frame) * PAN_MATERIAL}
  />
);

/** The pods hanging in the tree, printed with it. When the tree is let go they print out, all but the one that falls. */
const HangingPods: React.FC<{frame: number}> = ({frame}) => {
  if (frame < HIT.pods || frame >= HIT.podFalls + 8) return null;
  const out = frame < HIT.podFalls ? 1 : 1 - span(frame, HIT.podFalls, HIT.podFalls + 8, inOutCubic);
  return (
    <g>
      {out < 1 ? <PrintMask id="pods-print" p={out} /> : null}
      <g mask={out < 1 ? 'url(#pods-print)' : undefined}>
        {PODS.map((_, i) => {
          if (i === FALLING_POD && frame >= HIT.podFalls) return null;
          const k = seconds(frame - HIT.pods - 3 * i);
          if (k < 0) return null;
          const h = podHang(i);
          const s = 0.55 + 0.45 * settle(k, 3.4, 0.32);
          return (
            <g key={i} transform={`translate(${h.attach[0]} ${h.attach[1]}) scale(${s.toFixed(4)}) translate(${-h.attach[0]} ${-h.attach[1]})`}>
              <g transform={`translate(${h.c[0]} ${h.c[1]}) rotate(${h.angle}) scale(${POD_SCALE})`}>
                <Pod uid={`hang-pod-${i}`} />
              </g>
            </g>
          );
        })}
      </g>
    </g>
  );
};

/** On the thread layer, under the thread: the tree printed inside the outline, and its pods. */
export const OpeningTree: React.FC<{frame: number}> = ({frame}) => {
  const q = liftAt(frame);
  const tree = q > 0 ? treeShape(q) : null;
  return (
    <g>
      {tree ? <TreePrint uid="tree-print" clip={[...tree.left, ...tree.crown, ...[...tree.right].reverse()]} /> : null}
      <HangingPods frame={frame} />
    </g>
  );
};

// ---------------------------------------------------------------- layers

/** Behind the thread: the dark stage and its words, sliding off with the pan. */
export const OpeningBack: React.FC<{frame: number}> = ({frame}) => {
  if (frame >= HIT.panEnd) return null;
  return (
    <g transform={`translate(${(-panAt(frame)).toFixed(1)} 0)`}>
      <DarkWorld frame={frame} />
    </g>
  );
};

/**
 * Tamarind leaves shaken off the crown as it closes: four, flung out to either side, fluttering as
 * they fall, gone off the edges of the frame before they reach the line.
 */
const LEAVES = [
  {x: 300, y: 300, vx: -240, vy: -40, phase: 0.3, spin: -1, delay: 0},
  {x: 410, y: 176, vx: -250, vy: -70, phase: 1.7, spin: 1, delay: 3},
  {x: 680, y: 168, vx: 250, vy: -60, phase: 2.6, spin: -1, delay: 1},
  {x: 790, y: 290, vx: 260, vy: -30, phase: 4.1, spin: 1, delay: 4},
];

/** A tamarind leaf: a midrib with small oblong leaflets in pairs, swept forward like a feather. */
const Leaf: React.FC = () => (
  <g>
    {Array.from({length: 6}, (_, i) => {
      const x = -36 + i * 13;
      return (
        <g key={i}>
          <ellipse cx={x} cy={-8} rx={4.4} ry={10} transform={`rotate(48 ${x} -8)`} fill={C.haldi} stroke={C.tamarind} strokeWidth={1.6} />
          <ellipse cx={x} cy={8} rx={4.4} ry={10} transform={`rotate(-48 ${x} 8)`} fill={C.haldi} stroke={C.tamarind} strokeWidth={1.6} />
        </g>
      );
    })}
    <path d="M-50 0 Q0 -3 46 0" fill="none" stroke={C.tamarind} strokeWidth={2.6} strokeLinecap="round" />
  </g>
);

/** In front of the thread: the hand, the falling pod and leaves, the candy being made. */
export const OpeningFront: React.FC<{frame: number}> = ({frame}) => {
  const f = fingerAt(frame);
  const pod = fallingPod(frame);
  return (
    <g>
      {f ? (
        <g transform={`translate(${(-panAt(frame)).toFixed(1)} 0)`}>
          <Finger uid="hand" pose={f.pose} />
        </g>
      ) : null}
      {pod ? (
        <g transform={`translate(${pod.c[0].toFixed(2)} ${pod.c[1].toFixed(2)}) rotate(${pod.angle.toFixed(2)}) scale(${POD_SCALE})`}>
          <Pod uid="falling-pod" />
        </g>
      ) : null}
      <Candy frame={frame} />
      {LEAVES.map((l, i) => {
        const t = seconds(frame - HIT.leaves - l.delay);
        if (t < 0) return null;
        const x = l.x + l.vx * t + 26 * Math.sin(7 * t + l.phase);
        const y = l.y + l.vy * t + 130 * t * t;
        if (x < -80 || x > 1160) return null;
        const rot = (l.vx < 0 ? 200 : -20) + 30 * Math.sin(7 * t + l.phase + 0.6) + l.spin * 50 * t;
        return (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(1.2)`}>
            <Leaf />
          </g>
        );
      })}
    </g>
  );
};
