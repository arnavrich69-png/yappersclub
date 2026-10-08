// Brief 03, built with no performer clip: the Night 01 open call. See openCall.ts for the beats.

import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, THREAD} from '../brand';
import {Cue} from '../audio/Cue';
import {useBrandFonts} from '../components/fonts';
import {Layer} from '../components/Print';
import {popTransform} from '../components/pop';
import {LabelText, ModakText} from '../components/Type';
import type {V} from '../utils/math';
import {ThreadPiece} from '../thread/ThreadPiece';
import {StampedSeal} from '../label/Seal';
import {PackedCard} from './PackedCard';
import {Stage, type ClearBox} from './Stage';
import {TagOnThread, tagSwing} from './GiftTag';
import {WrapperDoors} from './WrapperDoors';
import {DRONE, F, OC_FPS, OPEN_CALL, TWANG} from './openCall';

const Y = THREAD.gridY9x16;
const LEFT = -20;
const RIGHT = 1100;
const N = 96;
const TAG_X = 200;
// The tag is drawn a little small here so it clears तेरी as it twitches on each string.
const TAG_SCALE = 0.9;
const SEAL_AT: [number, number] = [810, 384];
const HEADLINE_Y = 1170;
const CREDIT = {x: 64, y: 1578, size: 30};
// The credit sits on the bottom edge of the light: its dots keep out of the words.
const KEEP_CLEAR: ClearBox[] = [{x0: CREDIT.x - 10, y0: CREDIT.y - 34, x1: 560, y1: CREDIT.y + 12}];

const seconds = (frame: number) => frame / OC_FPS;

/**
 * The thread across the grid line, ringing on every string of the drone: a bow that flips side on
 * every frame (15 Hz at 30 fps) and dies away, louder strings ringing harder.
 */
const threadAt = (t: number): V[] => {
  const pts: V[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    let y = 0;
    for (const note of DRONE) {
      const tau = t - seconds(note.frame);
      if (tau <= 0) continue;
      y += TWANG[note.name] * Math.sin(Math.PI * u) * Math.cos(2 * Math.PI * 15 * tau) * Math.exp(-6 * tau) * (1 - Math.exp(-tau / 0.008));
    }
    pts.push([LEFT + (RIGHT - LEFT) * u, Y + y]);
  }
  return pts;
};

const pointAtX = (pts: V[], x: number): V => {
  const u = (x - LEFT) / (RIGHT - LEFT);
  const i = Math.min(pts.length - 2, Math.floor(u * N));
  const f = u * N - i;
  return [x, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
};

const typed = (t: number, startFrame: number, rate = 60) => Math.max(0, (t - seconds(startFrame)) * rate);

export const OpenCallReel: React.FC = () => {
  useBrandFonts();
  const frame = useCurrentFrame();
  const t = seconds(frame);
  // The light comes on with one flicker and goes out under the card when it lands.
  const lit = frame >= F.light.on && (frame < F.light.off || frame >= F.light.back) && frame < F.card.land;
  // Whatever the card falls on is gone once it covers it.
  const stageShown = frame < F.card.drop;
  const thread = threadAt(t);
  const tagAngle = tagSwing(
    t,
    seconds(F.tagRelease),
    DRONE.map((d) => seconds(d.frame)),
  );

  return (
    <>
      <Stage lit={lit} clear={KEEP_CLEAR} />

      <Layer>
        <LabelText x={64} y={330} size={44} weight={900} tracking={0.2} fill={C.cream} text={OPEN_CALL.header} shown={typed(t, F.header, 40)} />
        {stageShown
          ? OPEN_CALL.headline.map((word, i) => {
              const start = F.headline[i];
              if (frame < start) return null;
              const anchorX = i === 0 ? 522 : 558;
              const pivotX = i === 0 ? 380 : 700;
              return (
                <g key={word} transform={popTransform(t - seconds(start), pivotX, HEADLINE_Y)}>
                  <ModakText x={anchorX} y={HEADLINE_Y} size={170} anchor={i === 0 ? 'end' : 'start'} text={word} dressed={frame >= start + 1} />
                </g>
              );
            })
          : null}
        {stageShown ? (
          <>
            <LabelText x={540} y={HEADLINE_Y + 88} size={36} weight={900} tracking={0.12} anchor="middle" text={OPEN_CALL.lines[0]} shown={typed(t, F.lines[0])} />
            <LabelText x={540} y={HEADLINE_Y + 138} size={28} weight={800} tracking={0.12} anchor="middle" text={OPEN_CALL.lines[1]} shown={typed(t, F.lines[1])} />
          </>
        ) : null}
        <LabelText x={CREDIT.x} y={CREDIT.y} size={CREDIT.size} weight={800} tracking={0.14} fill={C.cream} text={OPEN_CALL.credit} shown={typed(t, F.credit)} />
        {tagAngle !== null && stageShown ? (
          <TagOnThread uid="tag" pivot={pointAtX(thread, TAG_X)} angle={tagAngle} text={OPEN_CALL.tag} scale={TAG_SCALE} />
        ) : null}
      </Layer>

      <Layer>
        <PackedCard
          t={t}
          text={{...OPEN_CALL.card, night: OPEN_CALL.card.night as [string, string]}}
          at={{
            drop: seconds(F.card.drop),
            land: seconds(F.card.land),
            packed: seconds(F.packed),
            night: seconds(F.night),
            cta: seconds(F.cta),
            fine: seconds(F.fine),
          }}
        />
      </Layer>

      <WrapperDoors frame={frame} open={F.doors.open} gone={F.doors.gone} />

      <Layer>
        <ThreadPiece uid="oc-thread" points={thread} width={THREAD.thickness.story9x16} roundBasis={32} shadow={[0, 9.6]} cap="butt" />
      </Layer>

      <Layer>
        <StampedSeal uid="oc-seal" t={t} impact={seconds(F.seal)} at={SEAL_AT} spec={OPEN_CALL.seal} />
      </Layer>

      <Cue name="crinkle" attackFrame={3} volume={0.8} />
      {DRONE.map((d) => (
        <Cue key={d.frame} name={d.name} attackFrame={d.frame} volume={0.34} />
      ))}
      <Cue name="thud" attackFrame={F.seal} volume={0.9} />
      <Cue name="crinkle" attackFrame={F.card.land} volume={0.6} />
      <Cue name="thud" attackFrame={F.cta} volume={0.5} />
    </>
  );
};
