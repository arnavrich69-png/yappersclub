// The one thread of the open call film (see thread/stringLine.ts): rung by the open call's score,
// dead still under AUTOTUNE 0%, shaken by the fling of the imli, the yank and the stamp.

import {makeStringLine} from '../thread/stringLine';
import {HITS, SILENCES} from './score';
import {HIT, OCF, STILL} from './timing';

export {LEFT, RIGHT, THREAD_WIDTH, THREAD_Y, bendOf, pluckX, restYAt, type Bend, type Weight} from '../thread/stringLine';

export const {ringAt, threadPoints} = makeStringLine({
  fps: OCF.fps,
  hits: HITS,
  silences: SILENCES,
  still: STILL,
  twangs: [
    {frame: HIT.fling, amp: 22, decay: 0.22},
    {frame: HIT.yank, amp: 30, decay: 0.18},
    {frame: HIT.stamp, amp: 20, decay: 0.2},
  ],
});
