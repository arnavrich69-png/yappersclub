// Shaping test for the open call film: every Hindi word it will use, in the font and size it will
// use, with the English support lines at their planned sizes. The line at x 940 is the edge of the
// Reels buttons; nothing critical may cross it. Not part of any film.

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../brand';
import {FONT, useBrandFonts} from '../components/fonts';
import {LabelText, ModakText} from '../components/Type';

const HERO = ['पहला सुर', 'किसका?', 'तानसेन की इमली', 'बस तू बाकी है', 'तेरी बारी', 'मीठी डोर'];
const SMALL = 'ग्वालियर · खट्टा मीठा · मीठी डोर · सुर · लोग · रिवाज़ · कुल';
const SUPPORT: [string, number][] = [
  ['NIGHT 01 NEEDS ITS FIRST VOICES', 40],
  ['GWALIOR SAYS IT SWEETENED HIS VOICE', 36],
  ['TANSEN’S RECIPE · INGREDIENTS', 40],
  ['1 KALAVA THREAD · RED AND YELLOW COTTON', 30],
  ['1 SONG · ANY LANGUAGE · UNPLUGGED', 30],
  ['ONE INGREDIENT MISSING: YOU', 40],
  ['BRING ONE SONG · WE BRING THE IMLI', 36],
  ['TANSEN’S TRICK, IN TWO STEPS', 36],
  ['UNPLUGGED COVERS · COME SING OR COME LISTEN', 30],
  ['SAT 17 OCT · PADHARO SA · FREE ENTRY', 36],
];

export const TYPE_CHECK_HEIGHT = 2300;

export const TypeCheck: React.FC = () => {
  useBrandFonts();
  return (
    <AbsoluteFill style={{backgroundColor: C.imli}}>
      <svg width={1080} height={TYPE_CHECK_HEIGHT}>
        <line x1={940} y1={0} x2={940} y2={TYPE_CHECK_HEIGHT} stroke={C.ink} strokeWidth={2} strokeDasharray="10 8" />
        <line x1={64} y1={0} x2={64} y2={TYPE_CHECK_HEIGHT} stroke={C.ink} strokeWidth={1} strokeDasharray="4 8" opacity={0.5} />
        {HERO.map((w, i) => (
          <ModakText key={w} x={64} y={190 + i * 205} size={150} anchor="start" text={w} />
        ))}
        <text x={64} y={1330} fontFamily={FONT.hindi} fontWeight={700} fontSize={34} fill={C.ink}>
          {SMALL}
        </text>
        <text x={64} y={1380} fontFamily={FONT.hindi} fontWeight={600} fontSize={34} fill={C.cream}>
          {SMALL}
        </text>
        {SUPPORT.map(([s, size], i) => (
          <LabelText key={s} x={64} y={1460 + i * 82} size={size} weight={900} tracking={0.14} fill={i % 2 ? C.ink : C.cream} text={s} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
