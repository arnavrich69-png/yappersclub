// Renders the open call film's hero proof (stage 4 of the process guide): out/open-call-hero.mp4
// and eight PNG frames. The proof is a slice of the 40 s film (bar 7 beat 3 to the end of bar 9),
// cut from the same composition and the same score.
// Usage: npm run hero
//
// Picture and sound are rendered separately and joined with ffmpeg's AAC encoder, as in
// render-film.mjs, so every hit lands on its frame.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const film = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const npx = (args) => execFileSync('npx', args, {cwd: film, stdio: 'inherit'});
const remotion = (args) => npx(['remotion', ...args, '--log=error']);
const node = (script) => execFileSync('node', [path.join(film, 'scripts', script)], {cwd: film, stdio: 'inherit'});

const ID = 'OpenCallHero';
const OUT = 'out/open-call-hero.mp4';

// Hero frame numbers (the film frame is 520 later).
const FRAMES = [
  [30, 'recipe'],
  [64, 'silence'],
  [82, 'yank'],
  [90, 'dark'],
  [104, 'light'],
  [121, 'teri'],
  [141, 'bari'],
  [199, 'your-turn'],
];

node('prepare-audio.mjs');
node('make-score.mjs');
fs.mkdirSync(path.join(film, 'out', 'tmp'), {recursive: true});
fs.mkdirSync(path.join(film, 'out', 'open-call-hero-frames'), {recursive: true});

const picture = `out/tmp/${ID}-picture.mp4`;
const sound = `out/tmp/${ID}-sound.wav`;
remotion(['render', 'src/index.ts', ID, picture, '--crf=14', '--muted']);
remotion(['render', 'src/index.ts', ID, sound, '--codec=wav']);
npx([
  'remotion', 'ffmpeg', '-v', 'error', '-y',
  '-i', picture, '-i', sound,
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
  '-movflags', '+faststart', '-shortest', OUT,
]);
console.log(`written ${OUT}`);

for (const [frame, name] of FRAMES) {
  const file = `out/open-call-hero-frames/open-call-hero-${String(frame).padStart(3, '0')}-${name}.png`;
  remotion(['still', 'src/index.ts', ID, file, `--frame=${frame}`]);
}
console.log('frames written to out/open-call-hero-frames/');
