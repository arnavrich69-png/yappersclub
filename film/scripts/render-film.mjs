// Renders the logo film: out/logo-film.mp4 (with the FLAVOUR seal), out/logo-film-clean.mp4 (no
// seal, the opener for any reel) and eight PNG frames.
// Usage: npm run film
//
// Picture and sound are rendered separately and joined with ffmpeg's AAC encoder, which marks its
// encoder delay in the file so players skip it and every sound lands on its frame.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const film = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const npx = (args) => execFileSync('npx', args, {cwd: film, stdio: 'inherit'});
const remotion = (args) => npx(['remotion', ...args, '--log=error']);

const VERSIONS = [
  ['LogoFilm', 'out/logo-film.mp4'],
  ['LogoFilmClean', 'out/logo-film-clean.mp4'],
];

// One frame per beat.
const FRAMES = [
  [8, 'tied'],
  [26, 'pluck'],
  [41, 'untie'],
  [52, 'untwist'],
  [65, 'flatten'],
  [92, 'string'],
  [108, 'stamp'],
  [161, 'hold'],
];

execFileSync('node', [path.join(film, 'scripts', 'prepare-audio.mjs')], {cwd: film, stdio: 'inherit'});
fs.mkdirSync(path.join(film, 'out', 'tmp'), {recursive: true});
fs.mkdirSync(path.join(film, 'out', 'logo-film-frames'), {recursive: true});

for (const [id, out] of VERSIONS) {
  const picture = `out/tmp/${id}-picture.mp4`;
  const sound = `out/tmp/${id}-sound.wav`;
  remotion(['render', 'src/index.ts', id, picture, '--crf=14', '--muted']);
  remotion(['render', 'src/index.ts', id, sound, '--codec=wav']);
  npx([
    'remotion', 'ffmpeg', '-v', 'error', '-y',
    '-i', picture, '-i', sound,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
    '-movflags', '+faststart', '-shortest', out,
  ]);
  console.log(`written ${out}`);
}

for (const [frame, name] of FRAMES) {
  const file = `out/logo-film-frames/logo-film-${String(frame).padStart(3, '0')}-${name}.png`;
  remotion(['still', 'src/index.ts', 'LogoFilm', file, `--frame=${frame}`]);
}
console.log('frames written to out/logo-film-frames/');
