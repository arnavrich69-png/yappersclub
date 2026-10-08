// Side by side: the designer's thread svg (top) and the film's ThreadPiece (bottom).
// Used to keep the moving thread faithful to svg-parts. Not part of any film.

import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {C} from '../brand';
import threadSvg from '../../../svg-parts/thread-straight-with-knot.svg';
import {line, quad} from '../thread/geometry';
import {screenMatchedTwist} from '../thread/look';
import {ThreadPiece} from '../thread/ThreadPiece';

export const LookCheck: React.FC = () => {
  const endA = quad([768.4, 67.0], [761.8, 92.2], [746.2, 118.6]);
  const endB = quad([768.4, 67.0], [774.1, 90.1], [795.4, 114.8]);
  return (
    <AbsoluteFill style={{backgroundColor: C.imli}}>
      <Img src={threadSvg} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 160}} />
      <svg width={1080} height={160} style={{position: 'absolute', left: 0, top: 200}}>
        <ThreadPiece uid="hero" points={line([-20, 60], [1100, 60], 60)} width={26} cap="butt" shadow={[0, 7.8]} roundBasis={26} materialOffset={20} />
        <ThreadPiece uid="a" points={endA} width={12.32} twistDeg={screenMatchedTwist(117)} fray="end" roundBasis={26} />
        <ThreadPiece uid="b" points={endB} width={11.2} twistDeg={screenMatchedTwist(61)} fray="end" yellowCore={3.6} roundBasis={26} />
      </svg>
    </AbsoluteFill>
  );
};
