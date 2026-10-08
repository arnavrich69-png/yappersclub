// Renders इमली क्यों?, the 40 s film that explains the imli and the thread: out/imli-film.mp4, a
// frame for each moment of the story and the cover (its last frame) in out/imli-film-frames/.
// Usage: npm run imli
//
// The score is rebuilt from imli/beat-map.json first, so a recorded pluck, crinkle or thud in the
// pack's audio/ folder flows into the music. Picture and sound are rendered separately and joined
// with ffmpeg's AAC encoder so every hit lands on its frame.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const film = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const npx = (args) => execFileSync('npx', args, {cwd: film, stdio: 'inherit'});
const remotion = (args) => npx(['remotion', ...args, '--log=error']);
const node = (script, args = []) => execFileSync('node', [path.join(film, 'scripts', script), ...args], {cwd: film, stdio: 'inherit'});

const ID = 'ImliFilm';
const OUT = 'out/imli-film.mp4';
const DIR = 'out/imli-film-frames';

const FRAMES = [
  [66, 'why'],
  [135, 'tansen'],
  [214, 'deepak-lamps'],
  [286, 'malhar-rain'],
  [470, 'the-tree'],
  [620, 'sweet-voice'],
  [712, 'imli'],
  [860, 'ganda-bandhan'],
  [940, 'kul'],
  [1044, 'directions'],
  [1110, 'sound-family'],
  [1199, 'cover'],
];

node('prepare-audio.mjs');
node('make-score.mjs', ['imli/beat-map.json', 'public/audio/imli-score.wav', 'src/imli/score.json']);
fs.mkdirSync(path.join(film, 'out', 'tmp'), {recursive: true});
fs.mkdirSync(path.join(film, DIR), {recursive: true});

const picture = `out/tmp/${ID}-picture.mp4`;
const sound = `out/tmp/${ID}-sound.wav`;
remotion(['render', 'src/index.ts', ID, picture, '--crf=15', '--muted']);
remotion(['render', 'src/index.ts', ID, sound, '--codec=wav']);
npx([
  'remotion', 'ffmpeg', '-v', 'error', '-y',
  '-i', picture, '-i', sound,
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
  '-movflags', '+faststart', '-shortest', OUT,
]);
console.log(`written ${OUT}`);

for (const [frame, name] of FRAMES) {
  const file = `${DIR}/imli-film-${String(frame).padStart(4, '0')}-${name}.png`;
  remotion(['still', 'src/index.ts', ID, file, `--frame=${frame}`]);
}
console.log(`frames written to ${DIR}/`);
