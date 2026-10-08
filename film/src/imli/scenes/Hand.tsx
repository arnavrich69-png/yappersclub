// Bars 2 and 3: Tansen's hand, the packet hand that plays the thread. It comes down out of the dark
// from above, lifts the thread and lets it go: one Sa for तानसेन. Then it runs along the thread and
// plays the five notes that light the lamps, low Sa to high Sa, and leaves the way it came.

import React from 'react';
import {Finger, type FingerPose} from '../../components/Finger';
import {THREAD_WIDTH, THREAD_Y, type Bend} from '../../thread/stringLine';
import {inCubic, inOutCubic, outCubic, span} from '../../utils/easing';
import {lerp, type V} from '../../utils/math';
import {HIT, LAMP_X, seconds} from '../timing';

/** Every pluck: where along the thread (a little left of each lamp's hook) and when it is let go. */
const PLUCKS = [{x: 540, at: HIT.tansen}, ...LAMP_X.map((x, i) => ({x: x - 30, at: HIT.lamps[i]}))];
const PULL = 4;
const FIRST_PULL = 7;
const DEPTH = 15;
/** Hand off to the upper right: it plays from above, lifting the thread. */
const ANGLE = -0.62;
const ENTER = {from: [1240, 140] as V, start: HIT.hand - 4};
const LEAVE = {by: 14, to: [1500, -120] as V};

type HandState = {pose: FingerPose; pull: Bend};

const contactY = (depth: number, follow: number) => THREAD_Y - THREAD_WIDTH / 2 - depth - follow;

const handAt = (frame: number): HandState | null => {
  const first = PLUCKS[0];
  const last = PLUCKS[PLUCKS.length - 1];
  if (frame < ENTER.start || frame > last.at + LEAVE.by) return null;
  const pose = (contact: V, lift = 0.15): FingerPose => ({contact, angle: ANGLE, lift, size: 0.72});
  // Coming down out of the dark onto the first note.
  const arrive = first.at - FIRST_PULL;
  if (frame < arrive) {
    const k = outCubic(span(frame, ENTER.start, arrive));
    return {pose: pose([lerp(ENTER.from[0], first.x, k), lerp(ENTER.from[1], contactY(0, 0), k)], 0.15 + 0.5 * (1 - k)), pull: []};
  }
  // Gone after the last note, following through up and away.
  if (frame >= last.at) {
    const k = inCubic(span(frame, last.at + 1, last.at + LEAVE.by));
    const follow = 10 * Math.exp(-seconds(frame - last.at) * 14);
    return {pose: pose([lerp(last.x, LEAVE.to[0], k), lerp(contactY(0, follow), LEAVE.to[1], k)]), pull: []};
  }
  let x = first.x;
  let depth = 0;
  let follow = 0;
  for (let i = 0; i < PLUCKS.length; i++) {
    const p = PLUCKS[i];
    const next = PLUCKS[i + 1];
    const pull = i === 0 ? FIRST_PULL : PULL;
    if (frame >= p.at && next) {
      // After a release the fingertip follows through, then runs on to the next note.
      follow = 12 * Math.exp(-seconds(frame - p.at) * 14);
      x = lerp(p.x, next.x, span(frame, p.at + 2, next.at - PULL, inOutCubic));
    }
    if (frame >= p.at - pull && frame < p.at) {
      x = p.x;
      depth = DEPTH * inOutCubic((frame - (p.at - pull)) / pull);
      follow = 0;
    }
  }
  return {pose: pose([x, contactY(depth, follow)]), pull: depth > 0 ? [[x, -depth]] : []};
};

/** How the hand bends the thread on `frame` (lifting it as it plucks). */
export const handBendAt = (frame: number): Bend => handAt(frame)?.pull ?? [];

export const Hand: React.FC<{frame: number}> = ({frame}) => {
  const h = handAt(frame);
  return h ? <Finger uid="tansen-hand" pose={h.pose} /> : null;
};
