// Stage 2 of the lyric film machine: renders songs/<song-name>/sync-test.mp4 from the frozen word
// timing (phrases.json) with the song's own audio, to check the timing by eye and ear.
// Usage: npm run lyric:sync -- <song-name>
//
// The picture is rendered silent, then joined to the original song file with ffmpeg's AAC encoder,
// which keeps the sound exactly in place (Remotion's own AAC track starts about 43 ms late).

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const film = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pack = path.join(film, '..');
const name = process.argv[2];
if (!name) {
  console.error('Usage: npm run lyric:sync -- <song-name>');
  process.exit(1);
}
const dir = fs.existsSync(name) ? path.resolve(name) : path.join(pack, 'songs', name);
const phrasesPath = path.join(dir, 'phrases.json');
if (!fs.existsSync(phrasesPath)) {
  console.error(`No ${phrasesPath}: run npm run lyric:timing -- ${name} first.`);
  process.exit(1);
}
const audio = ['wav', 'mp3', 'm4a', 'flac', 'aac', 'ogg'].map((e) => path.join(dir, `song.${e}`)).find((p) => fs.existsSync(p));
if (!audio) {
  console.error(`No song audio in ${dir}.`);
  process.exit(1);
}

const npx = (args) => execFileSync('npx', args, {cwd: film, stdio: 'inherit'});
const probe = execFileSync('npx', ['remotion', 'ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio], {cwd: film}).toString();
const duration = parseFloat(probe);
const phrases = JSON.parse(fs.readFileSync(phrasesPath, 'utf8'));
const tmp = path.join(film, 'out', 'tmp');
fs.mkdirSync(tmp, {recursive: true});
const props = path.join(tmp, `sync-${path.basename(dir)}.json`);
fs.writeFileSync(props, JSON.stringify({song: path.basename(dir), duration, phrases}));
const picture = path.join(tmp, `sync-${path.basename(dir)}-picture.mp4`);
npx(['remotion', 'render', 'src/index.ts', 'LyricSyncTest', picture, `--props=${props}`, '--muted', '--crf=23', '--log=error']);
const out = path.join(dir, 'sync-test.mp4');
npx(['remotion', 'ffmpeg', '-v', 'error', '-y', '-i', picture, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', out]);
console.log(`written ${path.relative(pack, out)}`);
