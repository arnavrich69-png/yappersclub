// The thread of इमली क्यों? (see thread/stringLine.ts), rung by the film's own score and shaken by
// the fling of the candy and the stamp of the label.

import {type Hit, makeStringLine} from '../thread/stringLine';
import data from './score.json';
import {HIT, IMF} from './timing';

export const HITS = data.hits as Hit[];

export const {ringAt, threadPoints} = makeStringLine({
  fps: IMF.fps,
  hits: HITS,
  silences: data.silences as [number, number][],
  twangs: [
    {frame: HIT.fling, amp: 22, decay: 0.22},
    {frame: HIT.label, amp: 18, decay: 0.2},
  ],
});
