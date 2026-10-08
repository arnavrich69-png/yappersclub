// Renders the Night 01 open call (Brief 03's frame with no performer clip): out/open-call.mp4 and
// four PNG frames, one per part of the frame.
// Usage: npm run open-call
//
// Picture and sound are rendered separately and joined with ffmpeg's AAC encoder, as in
// render-film.mjs, so every pluck, crinkle and thud lands on its frame.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const film = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const npx = (args) => execFileSync('npx', args, {cwd: film, stdio: 'inherit'});
const remotion = (args) => npx(['remotion', ...args, '--log=error']);

const ID = 'OpenCall';
const OUT = 'out/open-call.mp4';

// The wrapper opening, the seal landing on the frame, the lit stage, the PACKED AT card.
const FRAMES = [
  [12, 'wrapper'],
  [70, 'seal'],
  [150, 'your-turn'],
  [290, 'packed'],
];

execFileSync('node', [path.join(film, 'scripts', 'prepare-audio.mjs')], {cwd: film, stdio: 'inherit'});
fs.mkdirSync(path.join(film, 'out', 'tmp'), {recursive: true});
fs.mkdirSync(path.join(film, 'out', 'open-call-frames'), {recursive: true});

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
  const file = `out/open-call-frames/open-call-${String(frame).padStart(3, '0')}-${name}.png`;
  remotion(['still', 'src/index.ts', ID, file, `--frame=${frame}`]);
}
console.log('frames written to out/open-call-frames/');
