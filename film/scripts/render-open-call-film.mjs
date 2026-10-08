// Renders the 40 s open call film, बस तू बाकी है: out/open-call-film.mp4, eight frames (one per beat
// of the story) and the grid cover (its last frame) in out/open-call-film-frames/.
// Usage: npm run open-call-film
//
// The score is rebuilt from open-call/beat-map.json first, so a recorded pluck, crinkle or thud in the
// pack's audio/ folder flows into the music. Picture and sound are rendered separately and joined
// with ffmpeg's AAC encoder, as in render-film.mjs, so every hit lands on its frame.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const film = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const npx = (args) => execFileSync('npx', args, {cwd: film, stdio: 'inherit'});
const remotion = (args) => npx(['remotion', ...args, '--log=error']);
const node = (script) => execFileSync('node', [path.join(film, 'scripts', script)], {cwd: film, stdio: 'inherit'});

const ID = 'OpenCallFilm';
const OUT = 'out/open-call-film.mp4';
const DIR = 'out/open-call-film-frames';

const FRAMES = [
  [64, 'question'],
  [224, 'tansen-tree'],
  [298, 'packed'],
  [470, 'ingredients'],
  [602, 'yank'],
  [700, 'your-turn'],
  [852, 'kalava'],
  [940, 'kul'],
  [1199, 'cover'],
];

node('prepare-audio.mjs');
node('make-score.mjs');
fs.mkdirSync(path.join(film, 'out', 'tmp'), {recursive: true});
fs.mkdirSync(path.join(film, DIR), {recursive: true});

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
  const file = `${DIR}/open-call-film-${String(frame).padStart(4, '0')}-${name}.png`;
  remotion(['still', 'src/index.ts', ID, file, `--frame=${frame}`]);
}
console.log(`frames written to ${DIR}/`);
