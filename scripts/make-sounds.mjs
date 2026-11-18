// One-off generator for the game's sound effects: synthesizes short chimes as
// 16-bit mono WAVs so the app ships no third-party audio or licenses.
// Usage: node scripts/make-sounds.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

function synth(durationSec, notes) {
  const n = Math.round(durationSec * SR);
  const out = new Float32Array(n);
  for (const note of notes) {
    const s0 = Math.round(note.start * SR);
    const s1 = Math.min(n, Math.round((note.start + note.dur) * SR));
    for (let i = s0; i < s1; i++) {
      const t = (i - s0) / SR;
      const p = t / note.dur;
      const env = Math.min(1, t / 0.008) * Math.exp(-3.5 * p);
      const freq = note.bend ? note.freq + (note.bend - note.freq) * p : note.freq;
      let v = Math.sin(2 * Math.PI * freq * t);
      if (note.warm) v += 0.3 * Math.sin(4 * Math.PI * freq * t) + 0.12 * Math.sin(6 * Math.PI * freq * t);
      if (note.type === 'saw') v = 2 * ((freq * t) % 1) - 1;
      out[i] += (note.amp ?? 0.5) * env * v;
    }
  }
  return out;
}

function makeWav(samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
  }
  return buf;
}

const C6 = 1046.5, E6 = 1318.5, G6 = 1568, C7 = 2093;

const sounds = {
  // quick rising two-note chime for a correct answer
  'correct.wav': synth(0.24, [
    { freq: C6, start: 0, dur: 0.11, amp: 0.45, warm: true },
    { freq: E6, start: 0.09, dur: 0.14, amp: 0.5, warm: true },
  ]),
  // short descending buzz for a miss
  'wrong.wav': synth(0.28, [
    { freq: 170, bend: 115, start: 0, dur: 0.24, amp: 0.4, type: 'saw' },
    { freq: 85, start: 0, dur: 0.24, amp: 0.18 },
  ]),
  // three-note fanfare when a streak multiplier tier kicks in
  'streak.wav': synth(0.45, [
    { freq: C6, start: 0, dur: 0.12, amp: 0.42, warm: true },
    { freq: E6, start: 0.11, dur: 0.12, amp: 0.45, warm: true },
    { freq: G6, start: 0.22, dur: 0.2, amp: 0.5, warm: true },
  ]),
  // four-note arpeggio for the results screen
  'finish.wav': synth(0.8, [
    { freq: C6, start: 0, dur: 0.15, amp: 0.4, warm: true },
    { freq: E6, start: 0.14, dur: 0.15, amp: 0.42, warm: true },
    { freq: G6, start: 0.28, dur: 0.15, amp: 0.45, warm: true },
    { freq: C7, start: 0.42, dur: 0.34, amp: 0.5, warm: true },
  ]),
  // quiet tick for the last seconds of a timed question
  'tick.wav': synth(0.08, [{ freq: 1250, start: 0, dur: 0.05, amp: 0.3 }]),
};

mkdirSync(ROOT, { recursive: true });
for (const [name, samples] of Object.entries(sounds)) {
  writeFileSync(join(ROOT, name), makeWav(samples));
  console.log('wrote', name, Math.round(samples.length / SR * 1000) + 'ms');
}
