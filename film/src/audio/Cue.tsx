// Plays a sound so that its attack lands exactly on a given frame.

import React from 'react';
import {Html5Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {sound, type SoundName} from './sounds';

/** `volume` can follow the film: a function of the film's frame number. */
export const Cue: React.FC<{name: SoundName; attackFrame: number; volume?: number | ((frame: number) => number)}> = ({
  name,
  attackFrame,
  volume = 1,
}) => {
  const {fps} = useVideoConfig();
  const s = sound(name);
  const from = attackFrame - Math.round(s.onsetSec * fps);
  return (
    <Sequence from={from} name={`${name} @ ${attackFrame}`}>
      <Html5Audio src={staticFile(s.file)} volume={typeof volume === 'number' ? volume : (f) => volume(f + from)} />
    </Sequence>
  );
};
