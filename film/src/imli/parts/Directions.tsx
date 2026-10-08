// The packet's DIRECTIONS FOR USE, in the style of the ingredients panel (and svg-parts'
// nutrition panel): cream, ink rules, Big Shoulders. Two steps, numbered in Modak, and the result
// on a haldi band: the मीठी डोर ritual in the voice of a packet. It unrolls from the thread like a
// receipt, then a row is written on each beat.

import React from 'react';
import {C} from '../../brand';
import {FONT} from '../../components/fonts';
import {popTransform} from '../../components/pop';
import {LabelText, ModakText} from '../../components/Type';
import {inOutCubic, span} from '../../utils/easing';
import {seconds} from '../timing';

export const DIRECTIONS = {x: 140, y: 712, w: 800} as const;

const PAD = 26;
const HEADER = 78;
const ROW = 72;
const BAND = 74;
const STEPS = ['EAT THE IMLI BEFORE YOU SING', 'TIE THE THREAD ON AFTER'];
const RESULT = "YOU'RE KUL NOW";
export const DIRECTIONS_H = HEADER + STEPS.length * ROW + BAND + 14;

const typed = (frame: number, start: number, rate = 64) => Math.max(0, seconds(frame - start) * rate);

export const Directions: React.FC<{frame: number; unroll: number; rows: readonly number[]}> = ({frame, unroll, rows}) => {
  const {x, y, w} = DIRECTIONS;
  const open = span(frame, unroll, unroll + 8, inOutCubic);
  if (open <= 0) return null;
  const right = x + w - PAD;
  const bandY = y + HEADER + STEPS.length * ROW + 6;
  const resultK = frame - rows[STEPS.length];
  return (
    <g>
      <clipPath id="directions-unroll">
        <rect x={x - 10} y={y - 10} width={w + 20} height={DIRECTIONS_H * open + 10} />
      </clipPath>
      <g clipPath={open < 1 ? 'url(#directions-unroll)' : undefined}>
        <rect x={x} y={y} width={w} height={DIRECTIONS_H} fill={C.cream} stroke={C.ink} strokeWidth={4} />
        <text x={x + PAD} y={y + 54} fontFamily={FONT.label} fontWeight={900} fontSize={40} letterSpacing={40 * 0.08} fill={C.ink}>
          DIRECTIONS FOR USE
        </text>
        <text x={right} y={y + 54} textAnchor="end" fontFamily={FONT.label} fontWeight={800} fontSize={22} letterSpacing={22 * 0.12} fill={C.ink}>
          PER SINGER
        </text>
        <line x1={x + PAD} y1={y + HEADER - 8} x2={right} y2={y + HEADER - 8} stroke={C.ink} strokeWidth={5} />
        {STEPS.map((text, i) => {
          const k = frame - rows[i];
          const base = y + HEADER + i * ROW + 50;
          return (
            <g key={text}>
              {k >= 0 ? (
                <g transform={popTransform(seconds(k), x + PAD + 22, base + 6)}>
                  <ModakText x={x + PAD + 22} y={base + 6} size={62} text={String(i + 1)} fill={C.haldi} dressed={k >= 1} />
                </g>
              ) : null}
              <LabelText x={x + PAD + 70} y={base} size={38} weight={900} tracking={0.06} text={text} shown={typed(frame, rows[i] + 2)} />
              <line x1={x + PAD} y1={base + 20} x2={right} y2={base + 20} stroke={C.ink} strokeWidth={1.4} opacity={0.5} />
            </g>
          );
        })}
        {resultK >= 0 ? (
          <g>
            <rect x={x + PAD} y={bandY} width={(w - 2 * PAD) * span(resultK, 0, 6, inOutCubic)} height={BAND - 12} fill={C.haldi} stroke={C.ink} strokeWidth={4} />
            <LabelText x={x + w / 2} y={bandY + 45} size={40} weight={900} tracking={0.16} anchor="middle" text={RESULT} shown={typed(frame, rows[STEPS.length] + 5, 50)} />
          </g>
        ) : null}
      </g>
    </g>
  );
};
