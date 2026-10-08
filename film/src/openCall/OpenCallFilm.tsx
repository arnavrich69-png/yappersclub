// बस तू बाकी है: the Night 01 open call film (open-call/creative-direction.md). One camera, one
// thread, one score, 40 seconds.
//
// Layers, back to front: the world behind the thread (grounds, paper, words) under the camera; the
// thread layer (the tag, the thread and the tree it is lifted into) on the grid line, feeling only the
// camera's knocks; the world in front of the thread (the hand, falling things, the candy, wraps and
// knots) under the camera.

import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {C, FRAME} from '../brand';
import {useBrandFonts} from '../components/fonts';
import {TagOnThread} from '../performer/GiftTag';
import {ThreadPiece} from '../thread/ThreadPiece';
import type {V} from '../utils/math';
import {cameraAt, panAt, screenTransform, shakeAt, worldTransform} from './camera';
import {NightBack, NightFront, NightSealFalling} from './scenes/Night';
import {OpeningBack, OpeningFront, OpeningThreadPiece, OpeningTree, openingThread} from './scenes/Opening';
import {Paper} from './scenes/Paper';
import {RitualBack, RitualFront, RitualOverlay} from './scenes/Ritual';
import {YourTurnStage, YourTurnWords} from './scenes/YourTurn';
import {caretOn, tagAngle, tagWeight} from './tag';
import {bendOf, ringAt, restYAt, THREAD_WIDTH, threadPoints} from './thread';
import {HERO, HIT, SCENE} from './timing';

const BLANK_TAG = {label: 'SUNG BY', name: [] as string[], handle: ''};
const TAG_SCALE = 0.9;

const Svg: React.FC<{children: React.ReactNode; background?: string}> = ({children, background}) => (
  <AbsoluteFill style={background ? {backgroundColor: background} : undefined}>
    <svg width={FRAME.width} height={FRAME.height} viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} style={{overflow: 'visible'}}>
      {children}
    </svg>
  </AbsoluteFill>
);

/** Height of a polyline at x (its first crossing), for hanging things on the opening's thread. */
const yOn = (pts: V[], x: number) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    if ((x >= x0 && x <= x1) || (x >= x1 && x <= x0)) return x1 === x0 ? y0 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return pts[0][1];
};

const Tag: React.FC<{frame: number; pivot: V}> = ({frame, pivot}) => {
  const angle = tagAngle(frame);
  if (angle === null) return null;
  return <TagOnThread uid="blank-tag" pivot={pivot} angle={angle} text={BLANK_TAG} scale={TAG_SCALE} caret={caretOn(frame) && frame < HIT.yank} />;
};

/** The thread layer: the tag hanging on the thread, and the thread itself. */
const ThreadLayer: React.FC<{frame: number}> = ({frame}) => {
  const weight = tagWeight(frame);
  if (frame < SCENE.ingredients[0]) {
    // Scenes 1 to 3: the thread the hand plays, that is lifted into the tree and catches the pod.
    const tagX = weight ? weight.x - panAt(frame) : null;
    return (
      <>
        <OpeningTree frame={frame} />
        {weight && tagX !== null ? <Tag frame={frame} pivot={[tagX, yOn(openingThread(frame), tagX)]} /> : null}
        <OpeningThreadPiece frame={frame} />
      </>
    );
  }
  const bend = bendOf(weight);
  return (
    <>
      {weight ? <Tag frame={frame} pivot={[weight.x, restYAt(weight.x, bend) + ringAt(frame, weight.x)]} /> : null}
      <ThreadPiece uid="oc-thread" points={threadPoints(frame, bend)} width={THREAD_WIDTH} roundBasis={32} shadow={[0, 9.6]} cap="butt" />
    </>
  );
};

export const OpenCallFilm: React.FC<{from?: number}> = ({from = 0}) => {
  useBrandFonts();
  const frame = useCurrentFrame() + from;
  const shake = shakeAt(frame);
  const world = worldTransform(cameraAt(frame), shake);
  return (
    <>
      <Svg background={C.ink}>
        <g transform={world}>
          {frame >= HIT.yank && frame < HIT.stamp ? <YourTurnStage frame={frame} /> : null}
          {frame >= HIT.yank ? <YourTurnWords frame={frame} /> : null}
          <RitualBack frame={frame} />
          <Paper frame={frame} />
          {/* Over the paper while the camera pans off it, so the paper only shows past its torn edge. */}
          <OpeningBack frame={frame} />
          <NightBack frame={frame} />
        </g>
      </Svg>
      <Svg>
        <g transform={screenTransform(shake)}>
          <ThreadLayer frame={frame} />
        </g>
      </Svg>
      <Svg>
        <g transform={world}>
          {frame < SCENE.ingredients[0] ? <OpeningFront frame={frame} /> : null}
          <RitualFront frame={frame} />
          <NightFront frame={frame} />
        </g>
      </Svg>
      <Svg>
        <g transform={screenTransform(shake)}>
          <RitualOverlay frame={frame} />
          <NightSealFalling frame={frame} />
        </g>
      </Svg>
      <Html5Audio src={staticFile('audio/open-call-score.wav')} trimBefore={from} volume={from > 0 ? (f) => Math.min(1, (f + 1) / 4) : 1} />
    </>
  );
};

/** The hero proof: the film from the finished recipe label to the end of bar 9. */
export const OpenCallHero: React.FC = () => <OpenCallFilm from={HERO.from} />;

export const HERO_FRAMES = HERO.to - HERO.from;
