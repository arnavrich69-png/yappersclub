// Brief 02, prompt 2: the five second logo film. `seal` off gives the clean opener for any reel.
// See timeline.ts for the beats.

import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Cue} from '../audio/Cue';
import {useBrandFonts} from '../components/fonts';
import {Finger} from '../components/Finger';
import {Ground, Layer} from '../components/Print';
import {inOutCubic, releaseResponse, settle, span} from '../utils/easing';
import {applyPose, deg, lerp, poseToSvg, rotateAround, smoothstep, sub, type Pose, type V} from '../utils/math';
import {RakhiKnot} from '../thread/RakhiKnot';
import {ThreadPiece} from '../thread/ThreadPiece';
import {LABEL_BOX, LABEL_PLACE, LabelArt} from '../label/Label';
import {SEAL_NIGHT_01, StampedSeal} from '../label/Seal';
import {Tagline, typingSchedule} from '../label/Tagline';
import {Wordmark} from '../label/Wordmark';
import {MARK} from '../wrapper/mark';
import {OpenEnd} from '../wrapper/OpenEnd';
import {Body, KnotBlob, Letter, LooseEnd} from '../wrapper/TiedImli';
import {FLAT, TWISTED, type OpenState} from '../wrapper/untwist';
import {CANDY_CENTER, candyPose, endA, endB, fingerPose, knotShift, MARK_TO_WORLD, T as PLUCK_T} from '../proofs/pluckScene';
import {HERO_KNOT, heroAt} from './heroThread';
import {B, CUE, FPS, PLUCK_OFFSET} from './timeline';
import {knotHeld, unravelPieces, UNRAVEL, type UnravelPiece} from './unravel';

const TYPE_TIMES = typingSchedule(B.typing, FPS);
/** The tagline sits lower than in the lockup: room for the seal, and the card centres in the grid crop. */
const TAGLINE_DY = 304;
const SEAL_AT: [number, number] = [812, 1002];

/** A tiny settle as the film opens: the candy lands the last few pixels. */
const settlePose = (t: number): Pose => {
  const k = releaseResponse(t, 2.6, 0.42) * (1 - smoothstep(0.35, 0.5, t));
  return {pivot: CANDY_CENTER, rad: deg(-0.7) * k, offset: [0, -8 * k]};
};

const candyTransform = (tp: number) => `${poseToSvg(candyPose(tp))} translate(${MARK_TO_WORLD[0]} ${MARK_TO_WORLD[1]})`;

/** Moves world points drawn for the slip-time pose of the candy to where the candy is now. */
const followCandy = (pts: V[], from: Pose, to: Pose): V[] =>
  pts.map((p) => applyPose(rotateAround(sub(p, from.offset), from.pivot, -from.rad), to));

const untwistState = (t: number, delay: number): OpenState => {
  const t0 = B.untwist.start + delay;
  if (t < t0) return TWISTED;
  if (t >= B.flip.start) return FLAT;
  const k = t - t0;
  const window = 1 - smoothstep(B.untwist.end - 0.12, B.untwist.end, t);
  const spin = 2 * Math.PI * (1 - (1 - settle(k, 1.7, 0.5)) * window);
  return {
    open: span(t, t0, B.untwist.end - 0.05, inOutCubic),
    spin,
    crinkle: Math.min(1, k / 0.05) * window,
    t,
  };
};

const ThreadPieces: React.FC<{pieces: UnravelPiece[]; transform?: (pts: V[]) => V[]}> = ({pieces, transform}) => (
  <>
    {pieces.map((p) => (
      <ThreadPiece
        key={p.key}
        uid={`unravel-${p.key}`}
        points={transform ? transform(p.points) : p.points}
        material={p.material}
        width={p.width}
        twistDeg={p.twist}
        fray={p.fray}
        shadow={p.flying ? [0, p.width * 0.3] : null}
        roundBasis={MARK.roundBasis}
      />
    ))}
  </>
);

/** The sheet tips towards camera about a horizontal axis and lands face down as the label. */
const flipAngle = (t: number) => {
  const antic = 7 * Math.sin(Math.PI * Math.min(1, span(t, B.flip.start, B.flip.start + 0.14)));
  const k = t - (B.flip.start + 0.07);
  const p = k <= 0 ? 0 : 1 - (1 - settle(k, 1.9, 0.55)) * (1 - smoothstep(B.flip.end - 0.12, B.flip.end, t));
  return antic * (k <= 0 ? 1 : 0) - 180 * p;
};

const FlipLayer: React.FC<{t: number}> = ({t}) => {
  const angle = flipAngle(t);
  const axisY = lerp(CANDY_CENTER[1], LABEL_BOX.cy, span(t, B.flip.start + 0.07, B.flip.start + 0.32, inOutCubic));
  const face: React.CSSProperties = {position: 'absolute', inset: 0, backfaceVisibility: 'hidden'};
  return (
    <AbsoluteFill style={{perspective: 1700, perspectiveOrigin: `540px ${axisY}px`}}>
      <AbsoluteFill style={{transformStyle: 'preserve-3d', transformOrigin: `540px ${axisY}px`, transform: `rotateX(${angle}deg)`}}>
        <div style={{...face, transformOrigin: `540px ${CANDY_CENTER[1]}px`, transform: `translateY(${axisY - CANDY_CENTER[1]}px)`}}>
          <Layer>
            <g transform={`translate(${MARK_TO_WORLD[0]} ${MARK_TO_WORLD[1]})`}>
              <OpenEnd side="left" state={FLAT} />
              <OpenEnd side="right" state={FLAT} />
              <Body uid="flip-body" />
              <Letter />
            </g>
          </Layer>
        </div>
        <div style={{...face, transformOrigin: `540px ${LABEL_BOX.cy}px`, transform: `translateY(${axisY - LABEL_BOX.cy}px) rotateX(180deg)`}}>
          <Layer>
            <g transform={LABEL_PLACE}>
              <LabelArt uid="flip-label" />
            </g>
          </Layer>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const LogoFilm: React.FC<{seal: boolean}> = ({seal}) => {
  useBrandFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tp = t - PLUCK_OFFSET;
  const settleTf = poseToSvg(settlePose(t));
  const candyPhase = t < B.flip.start;

  const slipPose = (side: 'left' | 'right') => candyPose(UNRAVEL[side].start - PLUCK_OFFSET);
  const sides = (['left', 'right'] as const).map((side) => {
    const u = UNRAVEL[side];
    const slipped = t >= u.start;
    const pieces = unravelPieces(u, t, !slipped);
    // Before the slip the wraps ride on the candy as it settles and leans.
    const follow = slipped ? undefined : (pts: V[]) => followCandy(pts, slipPose(side), candyPose(tp));
    return {side, u, slipped, pieces, follow};
  });

  const hero = heroAt(t);
  const knotSpec = hero?.knot ? HERO_KNOT(hero.knot) : null;

  return (
    <>
      <Ground />

      {candyPhase ? (
        <>
          {/* Wrapper ends: twisted, then spinning open into flat flaps. */}
          <Layer>
            <g transform={settleTf}>
              <g transform={candyTransform(tp)}>
                <OpenEnd side="left" state={untwistState(t, 0.04)} />
                <OpenEnd side="right" state={untwistState(t, 0)} />
              </g>
            </g>
          </Layer>

          {/* The two threads: wraps on the candy, then pulled off and out of frame. */}
          <Layer>
            <g transform={settleTf}>
              {sides.map((s) => (
                <ThreadPieces key={s.side} pieces={s.pieces} transform={s.follow} />
              ))}
            </g>
          </Layer>

          {/* Loose ends while still tied: the left ones at rest, the right ones from the pluck. */}
          <Layer>
            <g transform={settleTf}>
              {!sides[0].slipped ? (
                <g transform={candyTransform(tp)}>
                  <LooseEnd uid="lA" side="left" which="a" />
                  <LooseEnd uid="lB" side="left" which="b" />
                </g>
              ) : null}
              {!sides[1].slipped
                ? (() => {
                    const a = endA(tp);
                    const b = endB(tp);
                    return (
                      <>
                        <LooseEnd uid="rA" side="right" which="a" points={a.points} />
                        <LooseEnd uid="rB" side="right" which="b" points={b.points} material={b.material} fray={b.fray} shadow={b.shadow} />
                      </>
                    );
                  })()
                : null}
            </g>
          </Layer>

          {/* Knots (until they slip), the body and its letter. */}
          <Layer>
            <g transform={settleTf}>
              <g transform={candyTransform(tp)}>
                {knotHeld(UNRAVEL.left, t) ? <KnotBlob side="left" uid="kL" /> : null}
                {knotHeld(UNRAVEL.right, t) ? <KnotBlob side="right" uid="kR" offset={knotShift(tp)} /> : null}
                <Body uid="body" />
                <Letter />
              </g>
            </g>
          </Layer>

          {tp > PLUCK_T.enter - 0.05 && tp < PLUCK_T.exitEnd ? (
            <Layer>
              <Finger uid="finger" pose={fingerPose(tp)} />
            </Layer>
          ) : null}
        </>
      ) : t < B.flip.end ? (
        <FlipLayer t={t} />
      ) : (
        <Layer>
          <g transform={LABEL_PLACE}>
            <LabelArt uid="label" />
          </g>
        </Layer>
      )}

      {hero && knotSpec ? (
        <Layer>
          <RakhiKnot uid="hero-knot-back" spec={knotSpec} p={hero.tie} layer="back" />
        </Layer>
      ) : null}
      {hero ? (
        <Layer>
          <ThreadPiece uid="hero" points={hero.points} material={hero.material} width={32} roundBasis={32} shadow={[0, 9.6]} cap="butt" />
        </Layer>
      ) : null}

      {t >= B.pop.dhva ? (
        <Layer>
          <g transform={LABEL_PLACE}>
            <Wordmark t={t} starts={B.pop} fps={FPS} />
          </g>
        </Layer>
      ) : null}

      {hero && knotSpec ? (
        <Layer>
          <RakhiKnot uid="hero-knot-front" spec={knotSpec} p={hero.tie} layer="front" />
        </Layer>
      ) : null}

      {seal ? (
        <Layer>
          <StampedSeal uid="seal" t={t} impact={B.sealImpact} at={SEAL_AT} spec={SEAL_NIGHT_01} />
        </Layer>
      ) : null}

      {t >= B.typing ? (
        <Layer>
          <g transform={LABEL_PLACE}>
            <Tagline t={t} times={TYPE_TIMES} dy={TAGLINE_DY} />
          </g>
        </Layer>
      ) : null}

      {/* The tanpura-like ring would hang over the label: let it fall away as the sheet flips. */}
      <Cue name="pluck" attackFrame={CUE.pluck} volume={(f) => 1 - 0.85 * smoothstep(58, 80, f)} />
      <Cue name="crinkle" attackFrame={CUE.crinkle} volume={0.85} />
      <Cue name="pluck" attackFrame={CUE.lightPluck} volume={0.32} />
      {seal ? <Cue name="thud" attackFrame={CUE.thud} /> : null}
    </>
  );
};
