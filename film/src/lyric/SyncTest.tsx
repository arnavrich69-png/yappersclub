// Stage 2 of the lyric film machine: the plain sync test. Black, the current lyric line in the
// middle with the word being sung lit, and the timing underneath in small print, to watch with the
// song and catch any word that lights early or late. No effects. Hindi is set whole, word by word,
// so the browser's shaper joins every conjunct and matra exactly as written.

import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../brand';
import {FONT, useBrandFonts} from '../components/fonts';

export type TimedWord = {word: string; start: number; end: number};
export type Phrase = {line: number; text: string; start: number; end: number; words: TimedWord[]};
export type SyncTestProps = {song: string; duration: number; phrases: Phrase[]};

/** A line shows from just before its first word until just before the next line's first word. */
const LEAD = 0.25;

const lineAt = (phrases: Phrase[], t: number) => {
  let current = -1;
  for (let i = 0; i < phrases.length; i++) if (phrases[i].start - LEAD <= t) current = i;
  return current;
};

const fmt = (s: number) => s.toFixed(3);

export const LyricSyncTest: React.FC<SyncTestProps> = ({song, phrases}) => {
  useBrandFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const li = lineAt(phrases, t);
  const line = li >= 0 ? phrases[li] : null;
  const wi = line ? line.words.findIndex((w) => t >= w.start && t < w.end) : -1;
  const lastSung = line ? line.words.reduce((k, w, i) => (w.start <= t ? i : k), -1) : -1;
  const word = line && wi >= 0 ? line.words[wi] : null;
  return (
    <AbsoluteFill style={{backgroundColor: '#000', fontFamily: FONT.hindi, color: C.cream}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '0 70px'}}>
        {line ? (
          <div style={{fontSize: 92, fontWeight: 700, lineHeight: 1.3, textAlign: 'center', maxWidth: 900}}>
            {line.words.map((w, i) => (
              <span key={i} style={{color: i === wi ? C.haldi : i <= lastSung ? C.cream : '#6b665e'}}>
                {w.word}
                {i < line.words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </div>
        ) : null}
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 70, right: 70, bottom: 330, fontFamily: FONT.label, fontWeight: 700, fontSize: 30, letterSpacing: 1.5, color: '#9a948a', lineHeight: 1.5}}>
        <div>
          {song} · t {fmt(t)} s · frame {frame}
        </div>
        <div>{line ? `line ${line.line} of ${phrases.length} · ${fmt(line.start)} to ${fmt(line.end)}` : 'before the first line'}</div>
        <div style={{fontFamily: FONT.hindi, fontWeight: 600}}>
          {word ? `word ${wi + 1}: ${word.word} · ${fmt(word.start)} to ${fmt(word.end)}` : 'between words'}
        </div>
      </div>
    </AbsoluteFill>
  );
};
