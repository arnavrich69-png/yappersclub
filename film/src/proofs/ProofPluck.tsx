// Brief 02, prompt 1: the one second proof. A finger plucks the outer loose end of the right
// knot and the thread rings in time with the pluck sound.

import React from 'react';
import {Html5Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {PLUCK} from '../audio/pluck';
import {Finger} from '../components/Finger';
import {Ground, Layer} from '../components/Print';
import {poseToSvg} from '../utils/math';
import {Body, KnotBlob, Letter, LooseEnd, TiedImli} from '../wrapper/TiedImli';
import {candyPose, endA, endB, fingerPose, FPS, knotShift, MARK_TO_WORLD, SNAP_FRAME} from './pluckScene';

const candyTransform = (t: number) => `${poseToSvg(candyPose(t))} translate(${MARK_TO_WORLD[0]} ${MARK_TO_WORLD[1]})`;

export const ProofPluck: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const onsetFrames = Math.round(PLUCK.onsetSec * FPS);
  const a = endA(t);
  const b = endB(t);

  return (
    <>
      <Ground />

      {/* Back of the candy: wrapper ends, wraps, the left knot and its ends. */}
      <Layer>
        <g transform={candyTransform(t)}>
          <TiedImli uid="back" parts={['wrapperLeft', 'wrapsLeft', 'endsLeft', 'knotLeft', 'wrapperRight', 'wrapsRight']} />
        </g>
      </Layer>

      {/* The right knot's loose ends, drawn in world space: the outer one is the one plucked. */}
      <Layer>
        <LooseEnd uid="rA" side="right" which="a" points={a.points} />
        <LooseEnd uid="rB" side="right" which="b" points={b.points} material={b.material} fray={b.fray} shadow={b.shadow} />
      </Layer>

      {/* Front of the candy: the right knot sits over its ends, then the body and the letter. */}
      <Layer>
        <g transform={candyTransform(t)}>
          <KnotBlob side="right" uid="front-kR" offset={knotShift(t)} />
          <Body uid="front" />
          <Letter />
        </g>
      </Layer>

      <Layer>
        <Finger uid="finger" pose={fingerPose(t)} />
      </Layer>

      <Sequence from={SNAP_FRAME - onsetFrames}>
        <Html5Audio src={staticFile(PLUCK.file)} />
      </Sequence>
    </>
  );
};
