// इमली क्यों? · why the imli, and why the thread. A 40 s film that tells anyone, in the brand's own
// world, the two stories under Dhwanikul. Tansen, the greatest singer of Akbar's court, whose raags
// lit lamps and brought the rain, rests in Gwalior beside a tamarind tree; Gwalior says chew one of
// its leaves and your voice turns sweet, so every singer gets an imli. And in Indian music a guru ties
// a thread on a student's wrist, the ganda bandhan, and it makes them family: कुल. Then the packet's
// directions, and the name: ध्वनि, sound; KUL, family. See imli/creative-direction.md.
//
// Layers, back to front: the world behind the thread (the dark stage and its lights and rain, the
// wrapper, the tomb, the words, PULP, the directions, the label) under the camera; the thread layer
// (the tree it is lifted into and the thread) on the grid line; the world in front (the candy, the
// hand, the lamps, the leaf, the wrists, the knot) under the camera; on top, unmoved by the camera,
// the words of the thread's story, the candy back on the packet, the wordmark and its meaning.

import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {C, FRAME, THREAD} from '../brand';
import {LabelText} from '../components/Type';
import {useBrandFonts} from '../components/fonts';
import {LABEL_PLACE} from '../label/Label';
import {Wordmark} from '../label/Wordmark';
import {Pod} from '../openCall/parts/Pod';
import {PrintMask} from '../openCall/parts/PrintMask';
import {TreePrint} from '../openCall/parts/TreePrint';
import {PODS, POD_SCALE, TREE_BASE} from '../openCall/parts/tree';
import {liftAt, ringCrown, treeShape} from '../openCall/parts/treeLift';
import {ThreadPiece} from '../thread/ThreadPiece';
import {LEFT, RIGHT, THREAD_WIDTH, THREAD_Y, restYAt, type Bend} from '../thread/stringLine';
import {inOutCubic, settle, span} from '../utils/easing';
import {clamp, deg, dist, type V} from '../utils/math';
import {cameraAt, panAt, screenTransform, shakeAt, worldTransform} from './camera';
import {DarkBack, WrapperBack} from './scenes/Backs';
import {Hand} from './scenes/Hand';
import {LampSteam, Lamps} from './scenes/Lamps';
import {Meanings} from './scenes/Meanings';
import {RainSplash} from './scenes/Rain';
import {HookCandy, KulWrists, LeafCandy, Leafy, ReturnCandy, TieOff, bendAt} from './scenes/Things';
import {EnglishLine, HeroWord} from './scenes/Words';
import {ringAt, threadPoints} from './thread';
import {HIT, IMF, seconds} from './timing';

// ---------------------------------------------------------------- the tree beside the tomb

/** Tansen's tree, a little smaller than in the open call and to the left of his tomb. */
const TREE = {x: 300, scale: 0.72};
const placeTree = ([x, y]: V): V => [TREE.x + (x - 544) * TREE.scale, THREAD_Y + (y - THREAD_Y) * TREE.scale];
const TREE_PLACE = `translate(${TREE.x} ${THREAD_Y}) scale(${TREE.scale}) translate(-544 ${-THREAD_Y})`;
const BASE = {left: placeTree([TREE_BASE.left, THREAD_Y])[0], right: placeTree([TREE_BASE.right, THREAD_Y])[0]};
const LET_GO: [number, number] = [HIT.letGo, HIT.letGo + 16];

const lift = (frame: number) => liftAt(frame, HIT.tree, LET_GO);

/** Where the tree meets the line it moves with the line: bent with it and ringing, fading out up the trunk. */
const withLine = (frame: number, bend: Bend, pts: V[]): V[] =>
  pts.map(([x, y]) => [x, y + (restYAt(x, bend) - THREAD_Y + ringAt(frame, x)) * clamp(1 - Math.abs(y - THREAD_Y) / 40)]);

/** The stripes travel with the camera over the pan: 31 whole repeats, so after it they are where they would be anyway. */
const PAN_MATERIAL = (31 * (THREAD.tilePx / Math.cos(deg(32)))) / 1080;

const threadAt = (frame: number): V[] => {
  const bend = bendAt(frame);
  const q = lift(frame);
  if (q <= 0) return threadPoints(frame, bend);
  const tree = treeShape(q, placeTree);
  const pts = [
    ...threadPoints(frame, bend, LEFT, BASE.left),
    ...withLine(frame, bend, [...tree.left.slice(1), ...ringCrown(frame, tree.crown, HIT.tree).slice(1, -1), ...[...tree.right].reverse().slice(0, -1)]),
    ...threadPoints(frame, bend, BASE.right, RIGHT),
  ];
  return pts.filter((p, i) => i === 0 || dist(p, pts[i - 1]) > 0.5);
};

/** The stem's tip in pod coordinates (svg-parts/tamarind-pod.svg). */
const STEM_TIP: V = [411, -5];

/** The tree's pods (tree coordinates), popping in once the crown is round, printed out as it is let go. */
const TreePods: React.FC<{frame: number}> = ({frame}) => {
  const start = HIT.tree[2] + 6;
  if (frame < start || frame >= LET_GO[0] + 8) return null;
  const out = 1 - span(frame, LET_GO[0], LET_GO[0] + 8, inOutCubic);
  return (
    <g>
      {out < 1 ? <PrintMask id="imli-pods-print" p={out} /> : null}
      <g mask={out < 1 ? 'url(#imli-pods-print)' : undefined}>
        <g transform={TREE_PLACE}>
          {PODS.map(({at, tilt}, i) => {
            const k = seconds(frame - start - 3 * i);
            if (k < 0) return null;
            const s = 0.55 + 0.45 * settle(k, 3.4, 0.32);
            const c: V = [at[0] - STEM_TIP[1] * POD_SCALE, at[1] + STEM_TIP[0] * POD_SCALE];
            return (
              <g key={i} transform={`translate(${at[0]} ${at[1]}) scale(${s.toFixed(4)}) translate(${-at[0]} ${-at[1]})`}>
                <g transform={`translate(${c[0]} ${c[1]}) rotate(${-90 + tilt}) scale(${POD_SCALE})`}>
                  <Pod uid={`imli-pod-${i}`} />
                </g>
              </g>
            );
          })}
        </g>
      </g>
    </g>
  );
};

const ThreadLayer: React.FC<{frame: number}> = ({frame}) => {
  const q = lift(frame);
  const tree = q > 0 ? treeShape(q, placeTree) : null;
  return (
    <>
      {tree ? <TreePrint uid="imli-tree" clip={[...tree.left, ...tree.crown, ...[...tree.right].reverse()]} place={TREE_PLACE} /> : null}
      <TreePods frame={frame} />
      <ThreadPiece uid="imli-thread" points={threadAt(frame)} width={THREAD_WIDTH} roundBasis={32} shadow={[0, 9.6]} cap="butt" materialOffset={panAt(frame) * PAN_MATERIAL} />
    </>
  );
};

// ---------------------------------------------------------------- the film

const Svg: React.FC<{children: React.ReactNode; background?: string}> = ({children, background}) => (
  <AbsoluteFill style={background ? {backgroundColor: background} : undefined}>
    <svg width={FRAME.width} height={FRAME.height} viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} style={{overflow: 'visible'}}>
      {children}
    </svg>
  </AbsoluteFill>
);

const POPS = [0, 2, 5, 7, 9];
const WORDMARK_AT = HIT.label + 4;

/** Bars 10 to 12 put their words above the thread: the wrists fill the frame below it. कुल's ु hangs low, so its line sits lower. */
const TOP = {hero: 382, line: 452, size: 160, kulHero: 360, kulLine: 474};

const ThreadStory: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <HeroWord frame={frame} id="imli-dhaga" text="और धागा?" at={HIT.thread} out={HIT.ganda - 8} size={TOP.size} y={TOP.hero} />
    <EnglishLine frame={frame} lines={['AND WHY THE RED THREAD?']} start={HIT.line9} end={HIT.ganda - 2} y={TOP.line} />
    <HeroWord frame={frame} id="imli-ganda" text="गंडा बंधन" at={HIT.ganda} out={HIT.kul - 8} size={TOP.size} y={TOP.hero} />
    <EnglishLine frame={frame} lines={['GURUS TIE IT ON THEIR STUDENTS']} start={HIT.line10} end={HIT.kul - 2} y={TOP.line} />
    <HeroWord frame={frame} id="imli-kul" text="कुल" at={HIT.kul} out={HIT.ritual - 8} size={170} y={TOP.kulHero} />
    <EnglishLine frame={frame} lines={['THE THREAD THAT MAKES YOU FAMILY']} start={HIT.line11} end={HIT.ritual - 2} y={TOP.kulLine} />
  </g>
);

export const ImliFilm: React.FC = () => {
  useBrandFonts();
  const frame = useCurrentFrame();
  const shake = shakeAt(frame);
  const world = worldTransform(cameraAt(frame), shake);
  const t = seconds(frame);
  const starts = Object.fromEntries(['dhva', 'ni', 'K', 'U', 'L'].map((k, i) => [k, seconds(WORDMARK_AT + POPS[i])]));
  return (
    <>
      <Svg background={C.ink}>
        <g transform={world}>
          <WrapperBack frame={frame} />
          <DarkBack frame={frame} />
        </g>
      </Svg>
      <Svg>
        <g transform={screenTransform(shake)}>
          <ThreadLayer frame={frame} />
        </g>
      </Svg>
      <Svg>
        <g transform={world}>
          <HookCandy frame={frame} />
          <Lamps frame={frame} />
          <LampSteam frame={frame} />
          <RainSplash frame={frame} />
          <Hand frame={frame} />
          <Leafy frame={frame} />
          <LeafCandy frame={frame} />
          <KulWrists frame={frame} />
          <TieOff frame={frame} />
        </g>
      </Svg>
      <Svg>
        <g transform={screenTransform(shake)}>
          <ThreadStory frame={frame} />
          <ReturnCandy frame={frame} />
          {frame >= WORDMARK_AT ? (
            <g transform={LABEL_PLACE}>
              <Wordmark t={t} starts={starts} fps={IMF.fps} />
            </g>
          ) : null}
          <Meanings frame={frame} />
          <LabelText x={540} y={1110} size={46} weight={900} tracking={0.22} anchor="middle" text="SWEET VOICE, TIED." shown={Math.max(0, seconds(frame - HIT.tagline) * 40)} />
        </g>
      </Svg>
      <Html5Audio src={staticFile('audio/imli-score.wav')} />
    </>
  );
};

export const IMLI_FRAMES = IMF.frames;
