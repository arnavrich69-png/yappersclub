// The words of इमली क्यों?: one Hindi hero word at a time (Modak, popping on its note, printed out
// through halftone dots when its moment is over) and one English line under it, typed in and typed
// out again like a label being relabelled. Hindi headlines, English support, as the brand speaks.

import React from 'react';
import {C} from '../../brand';
import {popTransform} from '../../components/pop';
import {LabelText, ModakText} from '../../components/Type';
import {PrintMask} from '../../openCall/parts/PrintMask';
import {inOutCubic, span} from '../../utils/easing';
import {seconds} from '../timing';

export const HERO_Y = 1180;
export const LINE_Y = 1290;

/** A Modak hero word that pops in on `at` and prints out over [out, out + 8). */
export const HeroWord: React.FC<{frame: number; id: string; text: string; at: number; out?: number; size?: number; x?: number; y?: number}> = ({
  frame,
  id,
  text,
  at,
  out = Infinity,
  size = 180,
  x = 540,
  y = HERO_Y,
}) => {
  if (frame < at || frame >= out + 8) return null;
  const p = 1 - span(frame, out, out + 8, inOutCubic);
  return (
    <g>
      {p < 1 ? <PrintMask id={`${id}-out`} p={p} /> : null}
      <g mask={p < 1 ? `url(#${id}-out)` : undefined}>
        <g transform={popTransform(seconds(frame - at), x, y)}>
          <ModakText x={x} y={y} size={size} text={text} dressed={frame >= at + 1} />
        </g>
      </g>
    </g>
  );
};

/** Characters shown: typed in from `start` (2 a frame), typed out again just before `end` (4 a frame). */
const typed = (frame: number, start: number, end: number, length: number) => {
  const away = Math.ceil(length / 4);
  if (frame < start || frame >= end) return 0;
  if (frame >= end - away) return length - (frame - (end - away)) * 4;
  return (frame - start) * 2;
};

/** An English support line (or two) under the hero word. */
export const EnglishLine: React.FC<{frame: number; lines: string[]; start: number; end?: number; fill?: string; x?: number; y?: number}> = ({
  frame,
  lines,
  start,
  end = Infinity,
  fill = C.cream,
  x = 540,
  y = LINE_Y,
}) => {
  const all = lines.join(' ').length;
  const shown = Number.isFinite(end) ? typed(frame, start, end, all) : Math.max(0, (frame - start) * 2);
  let used = 0;
  return (
    <g>
      {lines.map((text, i) => {
        const n = Math.max(0, Math.min(text.length, shown - used));
        used += text.length + 1;
        return <LabelText key={text} x={x} y={y + i * 52} size={36} weight={900} tracking={0.12} anchor="middle" fill={fill} text={text} shown={n} />;
      })}
    </g>
  );
};
