import React from 'react';
import {Composition, Folder} from 'remotion';
import {FRAME} from './brand';
import {LookCheck} from './lab/LookCheck';
import {MarkCheck} from './lab/MarkCheck';
import {THREAD_LAB_FRAMES, ThreadLab} from './lab/ThreadLab';
import {ProofPluck} from './proofs/ProofPluck';
import {DURATION_FRAMES} from './proofs/pluckScene';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ProofPluck" component={ProofPluck} durationInFrames={DURATION_FRAMES} fps={FRAME.fps} width={FRAME.width} height={FRAME.height} />
    <Folder name="Checks">
      <Composition id="LookCheck" component={LookCheck} durationInFrames={1} fps={30} width={1080} height={400} />
      <Composition id="MarkCheck" component={MarkCheck} durationInFrames={1} fps={30} width={1080} height={1080} />
      <Composition id="ThreadLab" component={ThreadLab} durationInFrames={THREAD_LAB_FRAMES} fps={30} width={1080} height={1920} />
    </Folder>
  </>
);
