// Tansen's recipe as a packet's ingredients panel, in the style of svg-parts/nutrition-panel.svg:
// cream, ink rules, English names with their Hindi in Khand, dotted leaders to the quantity. The
// last quantity is empty: the voice is the ingredient still missing. The panel unrolls from the
// thread like a receipt, then a row is written on each beat: the name, the leader running out, the
// quantity landing.

import React from 'react';
import {C} from '../../brand';
import {FONT} from '../../components/fonts';
import {popTransform} from '../../components/pop';
import {inOutCubic, span} from '../../utils/easing';
import {seconds} from '../timing';

export const PANEL = {x: 330, y: 712, w: 610, h: 314};

export const INGREDIENTS = [
  {name: 'IMLI', hindi: 'इमली', value: '1'},
  {name: 'KALAVA', hindi: 'कलावा', value: '1'},
  {name: 'SONG', hindi: 'गाना', value: '1'},
  {name: 'AUTOTUNE', hindi: '', value: '0%'},
  {name: 'VOICE', hindi: 'आवाज़', value: ''},
];

const PAD = 22;
const ROW0 = 104;
const ROW = 44;
const LEADER = {from: 240, endPad: 44};

/** When it unrolls and when each row is written (frames); omit for the finished panel. */
export type PanelTiming = {unroll: number; rows: number[]};

const Row: React.FC<{i: number; frame: number; written: number | null; caret: boolean}> = ({i, frame, written, caret}) => {
  const row = INGREDIENTS[i];
  const {x, y, w} = PANEL;
  const right = x + w - PAD;
  const base = y + ROW0 + i * ROW;
  const k = written === null ? Infinity : frame - written;
  if (k < 0) return null;
  // The name is written in four frames, the leader runs out over the next six, the quantity lands.
  const nameClip = k === Infinity ? 1 : span(k, 0, 4);
  const leader = k === Infinity ? 1 : span(k, 3, 9, inOutCubic);
  const valueK = k === Infinity ? Infinity : k - 9;
  const leaderLen = right - LEADER.endPad - (x + LEADER.from);
  return (
    <g>
      <clipPath id={`row-${i}-clip`}>
        <rect x={x} y={base - 34} width={w * nameClip} height={46} />
      </clipPath>
      <text
        x={x + PAD}
        y={base}
        fontFamily={FONT.label}
        fontWeight={800}
        fontSize={27}
        letterSpacing={27 * 0.06}
        fill={C.ink}
        clipPath={nameClip < 1 ? `url(#row-${i}-clip)` : undefined}
      >
        {row.name}
        {row.hindi ? (
          <tspan fontFamily={FONT.hindi} fontWeight={600} fontSize={27} letterSpacing={0} dx={8}>
            {row.hindi}
          </tspan>
        ) : null}
      </text>
      {leader > 0 ? (
        <line
          x1={x + LEADER.from}
          y1={base - 7}
          x2={leader < 1 ? x + LEADER.from + leaderLen * leader : right - LEADER.endPad}
          y2={base - 7}
          stroke={C.ink}
          strokeWidth={3}
          strokeDasharray="0.1 8"
          strokeLinecap="round"
        />
      ) : null}
      {row.value ? (
        valueK >= 0 ? (
          <g transform={valueK === Infinity ? undefined : popTransform(seconds(valueK), right - 8, base)}>
            <text x={right} y={base} textAnchor="end" fontFamily={FONT.label} fontWeight={900} fontSize={27} fill={C.ink}>
              {row.value}
            </text>
          </g>
        ) : null
      ) : caret && valueK >= 0 ? (
        <rect x={right - 6} y={base - 24} width={5} height={26} fill={C.ink} />
      ) : null}
      {i < INGREDIENTS.length - 1 ? <line x1={x + PAD} y1={base + 12} x2={right} y2={base + 12} stroke={C.ink} strokeWidth={1.2} opacity={0.5} /> : null}
    </g>
  );
};

export const IngredientsPanel: React.FC<{caret: boolean; frame?: number; timing?: PanelTiming}> = ({caret, frame = 0, timing}) => {
  const {x, y, w, h} = PANEL;
  const right = x + w - PAD;
  // Unrolling: the panel grows down from the thread like a receipt being printed.
  const unroll = timing ? span(frame, timing.unroll, timing.unroll + 8, inOutCubic) : 1;
  if (unroll <= 0) return null;
  const shownH = h * unroll;
  return (
    <g>
      <clipPath id="panel-unroll">
        <rect x={x - 10} y={y - 10} width={w + 20} height={shownH + 10} />
      </clipPath>
      <g clipPath={unroll < 1 ? 'url(#panel-unroll)' : undefined}>
        <rect x={x} y={y} width={w} height={unroll < 1 ? shownH : h} fill={C.cream} stroke={C.ink} strokeWidth={4} />
        <text x={x + PAD} y={y + 46} fontFamily={FONT.label} fontWeight={900} fontSize={34} letterSpacing={34 * 0.08} fill={C.ink}>
          INGREDIENTS
        </text>
        <text x={right} y={y + 46} textAnchor="end" fontFamily={FONT.label} fontWeight={700} fontSize={20} letterSpacing={20 * 0.12} fill={C.ink}>
          PER SINGER
        </text>
        <line x1={x + PAD} y1={y + 60} x2={right} y2={y + 60} stroke={C.ink} strokeWidth={5} />
        {INGREDIENTS.map((row, i) => (
          <Row key={row.name} i={i} frame={frame} written={timing ? timing.rows[i] : null} caret={caret} />
        ))}
      </g>
    </g>
  );
};
