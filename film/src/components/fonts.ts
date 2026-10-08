// The brand fonts, loaded from the pack's fonts/ folder. Text that is not already outlined in the
// logo files (the seal) uses these; a frame is not rendered until they are ready.

import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender} from 'remotion';
import bigShoulders from '../../../fonts/BigShouldersDisplay-Variable.ttf';
import modak from '../../../fonts/Modak-Regular.ttf';

export const FONT = {label: 'Big Shoulders Display', display: 'Modak'} as const;

const FACES = [
  {family: FONT.label, url: bigShoulders, weight: '100 900'},
  {family: FONT.display, url: modak, weight: '400'},
];

let ready: Promise<void> | null = null;
const loadBrandFonts = () => {
  if (!ready) {
    ready = Promise.all(
      FACES.map(async (f) => {
        const face = new FontFace(f.family, `url(${f.url})`, {weight: f.weight});
        await face.load();
        document.fonts.add(face);
      }),
    ).then(() => undefined);
  }
  return ready;
};

/** Holds rendering until the brand fonts are loaded. Use once near the top of a composition. */
export const useBrandFonts = () => {
  const [handle] = useState(() => delayRender('Loading brand fonts'));
  useEffect(() => {
    loadBrandFonts()
      .then(() => continueRender(handle))
      .catch((err) => cancelRender(err));
  }, [handle]);
};
