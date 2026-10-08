// Brief 03 outro: the label card. Tied imli logo, PACKED AT · VENUE · GWALIOR, NIGHT XX, and for the
// open call the DM TO PERFORM band. The card drops onto the stage like wrapper paper: fast, a snap
// and a slight overshoot as it flattens.

import React from 'react';
import {C} from '../brand';
import {HalftonePattern} from '../components/Print';
import {popTransform} from '../components/pop';
import {LabelText, ModakText} from '../components/Type';
import {inQuad, releaseResponse, span} from '../utils/easing';
import {TiedImli} from '../wrapper/TiedImli';

export const CARD = {x: 90, y: 430, w: 900, h: 850, rx: 70};

export type CardText = {packed: string; night: [string, string]; cta: string; fine: string};
export type CardTimes = {drop: number; land: number; packed: number; night: number; cta: number; fine: number};

/** Characters shown while typing at `rate` per second from `start`. */
const typed = (t: number, start: number, rate = 60) => Math.max(0, (t - start) * rate);

export const PackedCard: React.FC<{t: number; text: CardText; at: CardTimes}> = ({t, text, at}) => {
  if (t < at.drop) return null;
  const cx = CARD.x + CARD.w / 2;
  const cy = CARD.y + CARD.h / 2;
  // Falling: bigger and shadow further away; landing: a quick flatten that overshoots and settles.
  const fall = span(t, at.drop, at.land, inQuad);
  const h = 1 - fall;
  const snap = t < at.land ? 0 : 0.035 * releaseResponse(t - at.land, 6, 0.4);
  const sx = (1 + 0.25 * h) * (1 + snap * 0.4);
  const sy = (1 + 0.25 * h) * (1 - snap);
  const tilt = -2.5 * h;
  const shadow = [10 + 40 * h, 14 + 50 * h];
  const card = `translate(${cx} ${cy}) rotate(${tilt}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-cx} ${-cy})`;

  const nightK = t - at.night;
  const ctaK = t - at.cta;
  const ctaFall = span(t, at.cta - 0.1, at.cta, inQuad);
  const ctaScale = t < at.cta ? 1.3 - 0.3 * ctaFall : 1 + 0.06 * releaseResponse(ctaK, 7, 0.4) * -1;
  return (
    <g>
      <defs>
        <HalftonePattern id="card-ht" grid={7} r={1.7} opacity={0.16} rotate={18} />
      </defs>
      <g transform={`translate(${shadow[0]} ${shadow[1]}) ${card}`}>
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={CARD.rx} fill={C.tamarind} />
      </g>
      <g transform={card}>
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={CARD.rx} fill={C.imli} stroke={C.ink} strokeWidth={7} />
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={CARD.rx} fill="url(#card-ht)" />
        <rect
          x={CARD.x + 18}
          y={CARD.y + 18}
          width={CARD.w - 36}
          height={CARD.h - 36}
          rx={CARD.rx - 18}
          fill="none"
          stroke={C.cream}
          strokeWidth={4}
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
        <g transform="translate(530 556) scale(0.32) translate(-540 -540)">
          <TiedImli uid="card-imli" />
        </g>
        <LabelText x={cx} y={800} size={34} weight={800} tracking={0.14} anchor="middle" fill={C.cream} text={text.packed} shown={typed(t, at.packed)} />
        {t >= at.night ? (
          <g transform={popTransform(nightK, cx, 950)}>
            <LabelText x={cx - 18} y={940} size={72} weight={900} tracking={0.1} anchor="end" fill={C.cream} text={text.night[0]} />
            <ModakText x={cx + 4} y={950} size={140} anchor="start" text={text.night[1]} dressed={t >= at.night + 1 / 30 - 1e-6} />
          </g>
        ) : null}
        {t >= at.cta - 0.1 ? (
          <g transform={`translate(${cx} 1060) scale(${ctaScale.toFixed(4)}) translate(${-cx} -1060)`}>
            <rect x={cx - 310} y={1018} width={620} height={84} fill={C.haldi} stroke={C.ink} strokeWidth={5} />
            <LabelText x={cx} y={1078} size={54} weight={900} tracking={0.16} anchor="middle" text={text.cta} />
          </g>
        ) : null}
        <LabelText x={cx} y={1220} size={26} weight={800} tracking={0.12} anchor="middle" fill={C.cream} text={text.fine} shown={typed(t, at.fine)} />
      </g>
    </g>
  );
};
