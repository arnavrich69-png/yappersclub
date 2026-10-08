// बस तू बाकी है: the Night 01 open call film (open-call/creative-direction.md). One camera, one
// thread, one score. The picture is built scene by scene; the hero section (end of scene 4 to the
// end of scene 6) is finished, the rest arrives in stage 5.
//
// Layers, back to front: the world (stage, its words, the label paper) under the camera, then the
// thread layer (the blank tag and the thread) on the grid line, feeling only the camera's knocks.

import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame} from 'remotion';
import {C, FRAME} from '../brand';
import {useBrandFonts} from '../components/fonts';
import {LabelText} from '../components/Type';
import {TagOnThread} from '../performer/GiftTag';
import {ThreadPiece} from '../thread/ThreadPiece';
import {cameraAt, screenTransform, shakeAt, worldTransform} from './camera';
import {RecipeLabel} from './scenes/RecipeLabel';
import {YourTurnStage, YourTurnWords} from './scenes/YourTurn';
import {caretOn, tagAngle, tagWeight} from './tag';
import {ringAt, restYAt, THREAD_WIDTH, threadPoints} from './thread';
import {HERO, HIT} from './timing';

const BLANK_TAG = {label: 'SUNG BY', name: [] as string[], handle: ''};
const TAG_SCALE = 0.9;

const Svg: React.FC<{children: React.ReactNode; background?: string}> = ({children, background}) => (
  <AbsoluteFill style={background ? {backgroundColor: background} : undefined}>
    <svg width={FRAME.width} height={FRAME.height} viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} style={{overflow: 'visible'}}>
      {children}
    </svg>
  </AbsoluteFill>
);

/** Scenes not built yet (stage 5) show a plain slate in the Studio. They are never rendered for delivery. */
const NotBuilt: React.FC<{frame: number}> = ({frame}) => (
  <Svg background={C.ink}>
    <LabelText x={540} y={960} size={36} weight={900} tracking={0.2} anchor="middle" fill={C.cream} text={`FRAME ${frame} · BUILT IN STAGE 5`} />
  </Svg>
);

export const OpenCallFilm: React.FC<{from?: number}> = ({from = 0}) => {
  useBrandFonts();
  const frame = useCurrentFrame() + from;
  const built = frame >= HERO.from && frame < HERO.to;
  const shake = shakeAt(frame);
  const cam = cameraAt(frame);
  const tagIn = frame >= HIT.silence;
  const weight = tagIn ? tagWeight(frame) : null;
  const angle = tagAngle(frame);
  return (
    <>
      {built ? (
        <>
          <Svg background={C.ink}>
            <g transform={worldTransform(cam, shake)}>
              <YourTurnStage frame={frame} />
              <YourTurnWords frame={frame} />
              <RecipeLabel frame={frame} />
            </g>
          </Svg>
          <Svg>
            <g transform={screenTransform(shake)}>
              {weight && angle !== null ? (
                <TagOnThread
                  uid="blank-tag"
                  pivot={[weight.x, restYAt(weight.x, weight) + ringAt(frame, weight.x)]}
                  angle={angle}
                  text={BLANK_TAG}
                  scale={TAG_SCALE}
                  caret={caretOn(frame) && frame < HIT.yank}
                />
              ) : null}
              <ThreadPiece uid="oc-thread" points={threadPoints(frame, weight)} width={THREAD_WIDTH} roundBasis={32} shadow={[0, 9.6]} cap="butt" />
            </g>
          </Svg>
        </>
      ) : (
        <NotBuilt frame={frame} />
      )}
      <Html5Audio src={staticFile('audio/open-call-score.wav')} trimBefore={from} volume={from > 0 ? (f) => Math.min(1, (f + 1) / 4) : 1} />
    </>
  );
};

/** The hero proof: the film from the finished recipe label to the end of bar 9. */
export const OpenCallHero: React.FC = () => <OpenCallFilm from={HERO.from} />;

export const HERO_FRAMES = HERO.to - HERO.from;
