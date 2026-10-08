// Renders the one second pluck proof: out/proof-pluck.mp4 and four still frames.
// Usage: npm run proof
//
// Picture and sound are rendered separately and joined with ffmpeg's AAC encoder, which marks its
// encoder delay in the file so players skip it. (Remotion's own AAC track starts about 43 ms late,
// which would put the pluck after the snap.)

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const film = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const npx = (args) => execFileSync('npx', args, {cwd: film, stdio: 'inherit'});
const remotion = (args) => npx(['remotion', ...args, '--log=error']);

// Frames that tell the story: the reach, the held pull, the snap, the ring.
const STILLS = [
  [7, 'reach'],
  [15, 'held'],
  [18, 'snap'],
  [22, 'ring'],
];

execFileSync('node', [path.join(film, 'scripts', 'prepare-audio.mjs')], {cwd: film, stdio: 'inherit'});
fs.mkdirSync(path.join(film, 'out', 'tmp'), {recursive: true});
fs.mkdirSync(path.join(film, 'out', 'proof-pluck-frames'), {recursive: true});

remotion(['render', 'src/index.ts', 'ProofPluck', 'out/tmp/proof-pluck-picture.mp4', '--crf=14', '--muted']);
remotion(['render', 'src/index.ts', 'ProofPluck', 'out/tmp/proof-pluck-sound.wav', '--codec=wav']);
npx([
  'remotion', 'ffmpeg', '-v', 'error', '-y',
  '-i', 'out/tmp/proof-pluck-picture.mp4',
  '-i', 'out/tmp/proof-pluck-sound.wav',
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
  '-movflags', '+faststart', '-shortest', 'out/proof-pluck.mp4',
]);

for (const [frame, name] of STILLS) {
  const file = `out/proof-pluck-frames/proof-pluck-${String(frame).padStart(2, '0')}-${name}.png`;
  remotion(['still', 'src/index.ts', 'ProofPluck', file, `--frame=${frame}`]);
}
console.log('proof written to out/proof-pluck.mp4 and out/proof-pluck-frames/');
