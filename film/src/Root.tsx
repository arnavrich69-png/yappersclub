import React from 'react';
import {Composition, Folder} from 'remotion';
import {FRAME} from './brand';
import {LookCheck} from './lab/LookCheck';
import {MarkCheck} from './lab/MarkCheck';
import {THREAD_LAB_FRAMES, ThreadLab} from './lab/ThreadLab';
import {TYPE_CHECK_HEIGHT, TypeCheck} from './lab/TypeCheck';
import {ProofPluck} from './proofs/ProofPluck';
import {LogoFilm} from './film/LogoFilm';
import {HERO_FRAMES, OpenCallFilm, OpenCallHero} from './openCall/OpenCallFilm';
import {OCF} from './openCall/timing';
import {OpenCallReel} from './performer/OpenCallReel';
import {OC_FRAMES} from './performer/openCall';
import {FILM_FRAMES} from './film/timeline';
import {DURATION_FRAMES} from './proofs/pluckScene';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LogoFilm" component={LogoFilm} defaultProps={{seal: true}} durationInFrames={FILM_FRAMES} fps={FRAME.fps} width={FRAME.width} height={FRAME.height} />
    <Composition id="LogoFilmClean" component={LogoFilm} defaultProps={{seal: false}} durationInFrames={FILM_FRAMES} fps={FRAME.fps} width={FRAME.width} height={FRAME.height} />
    <Composition id="OpenCall" component={OpenCallReel} durationInFrames={OC_FRAMES} fps={FRAME.fps} width={FRAME.width} height={FRAME.height} />
    <Composition id="OpenCallFilm" component={OpenCallFilm} durationInFrames={OCF.frames} fps={FRAME.fps} width={FRAME.width} height={FRAME.height} />
    <Composition id="OpenCallHero" component={OpenCallHero} durationInFrames={HERO_FRAMES} fps={FRAME.fps} width={FRAME.width} height={FRAME.height} />
    <Composition id="ProofPluck" component={ProofPluck} durationInFrames={DURATION_FRAMES} fps={FRAME.fps} width={FRAME.width} height={FRAME.height} />
    <Folder name="Checks">
      <Composition id="LookCheck" component={LookCheck} durationInFrames={1} fps={30} width={1080} height={400} />
      <Composition id="MarkCheck" component={MarkCheck} durationInFrames={1} fps={30} width={1080} height={1080} />
      <Composition id="ThreadLab" component={ThreadLab} durationInFrames={THREAD_LAB_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TypeCheck" component={TypeCheck} durationInFrames={1} fps={30} width={1080} height={TYPE_CHECK_HEIGHT} />
    </Folder>
  </>
);
