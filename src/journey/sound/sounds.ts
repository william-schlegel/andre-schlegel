import { useJourney } from '../engine/store';

/**
 * The sounds of the table: everything that is not Eric's voice. They are made here, from
 * noise and a few oscillators, rather than recorded: a lamp switch, paper landing, a leaf
 * turning, a rubber stamp, a typewriter key. One switch (store.sounds) silences them all.
 */

export type SoundName = 'lamp' | 'print' | 'leaf' | 'cover' | 'stamp' | 'key' | 'unroll' | 'medal';

let context: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;

/** Must be called from a gesture once (the browser only lets sound start then). */
export function unlockSounds(): void {
  if (!context) {
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Context) return;
    context = new Context();
    master = context.createGain();
    master.gain.value = 0.55;
    master.connect(context.destination);
    noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (context.state === 'suspended') void context.resume();
  applyAmbience();
}

export function soundContext(): { context: AudioContext; master: GainNode } | null {
  return context && master ? { context, master } : null;
}

/** A burst of filtered noise: the raw material of paper, cloth and felt. */
function burst(options: {
  at: number;
  length: number;
  gain: number;
  type: BiquadFilterType;
  from: number;
  to?: number;
  q?: number;
  attack?: number;
}): void {
  if (!context || !master || !noise) return;
  const source = context.createBufferSource();
  source.buffer = noise;
  source.loop = true;
  const filter = context.createBiquadFilter();
  filter.type = options.type;
  filter.Q.value = options.q ?? 0.8;
  filter.frequency.setValueAtTime(options.from, options.at);
  if (options.to) filter.frequency.exponentialRampToValueAtTime(options.to, options.at + options.length);
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, options.at);
  gain.gain.exponentialRampToValueAtTime(options.gain, options.at + (options.attack ?? 0.005));
  gain.gain.exponentialRampToValueAtTime(0.0001, options.at + options.length);
  source.connect(filter).connect(gain).connect(master);
  source.start(options.at, Math.random());
  source.stop(options.at + options.length + 0.05);
}

/** A short pitched knock: wood, metal, a key. */
function knock(options: { at: number; length: number; gain: number; from: number; to: number; type?: OscillatorType }): void {
  if (!context || !master) return;
  const oscillator = context.createOscillator();
  oscillator.type = options.type ?? 'sine';
  oscillator.frequency.setValueAtTime(options.from, options.at);
  oscillator.frequency.exponentialRampToValueAtTime(options.to, options.at + options.length);
  const gain = context.createGain();
  gain.gain.setValueAtTime(options.gain, options.at);
  gain.gain.exponentialRampToValueAtTime(0.0001, options.at + options.length);
  oscillator.connect(gain).connect(master);
  oscillator.start(options.at);
  oscillator.stop(options.at + options.length + 0.02);
}

export function playSound(name: SoundName, when = 0): void {
  if (!context || !useJourney.getState().sounds) return;
  const at = context.currentTime + when;
  switch (name) {
    case 'lamp':
      // the click of a switch, then the faint ring of the shade
      knock({ at, length: 0.035, gain: 0.5, from: 2400, to: 900, type: 'square' });
      burst({ at, length: 0.05, gain: 0.35, type: 'highpass', from: 3000 });
      knock({ at: at + 0.02, length: 0.6, gain: 0.05, from: 1180, to: 1160 });
      break;
    case 'print':
      // a sheet sliding onto the table, then settling
      burst({ at, length: 0.26, gain: 0.22, type: 'bandpass', from: 2600, to: 900, q: 0.6, attack: 0.06 });
      burst({ at: at + 0.2, length: 0.09, gain: 0.3, type: 'lowpass', from: 700, to: 200 });
      break;
    case 'leaf':
      // a leaf turned: the paper's rustle rises, then the leaf falls flat
      burst({ at, length: 0.34, gain: 0.2, type: 'bandpass', from: 1400, to: 4200, q: 0.7, attack: 0.1 });
      burst({ at: at + 0.3, length: 0.1, gain: 0.22, type: 'lowpass', from: 900, to: 250 });
      break;
    case 'cover':
      // a board cover: a creak, then a soft thud on the desk
      burst({ at, length: 0.5, gain: 0.12, type: 'bandpass', from: 600, to: 1500, q: 2.5, attack: 0.15 });
      knock({ at: at + 1.15, length: 0.16, gain: 0.5, from: 150, to: 60 });
      burst({ at: at + 1.15, length: 0.12, gain: 0.25, type: 'lowpass', from: 500, to: 150 });
      break;
    case 'stamp':
      knock({ at, length: 0.14, gain: 0.8, from: 170, to: 50 });
      burst({ at, length: 0.08, gain: 0.4, type: 'lowpass', from: 1200, to: 300 });
      break;
    case 'key':
      // one key of the squadron office's typewriter
      knock({ at, length: 0.03, gain: 0.3, from: 1900 + Math.random() * 500, to: 700, type: 'square' });
      burst({ at, length: 0.045, gain: 0.28, type: 'bandpass', from: 3200, q: 1.2 });
      knock({ at: at + 0.008, length: 0.05, gain: 0.22, from: 240, to: 110 });
      break;
    case 'unroll':
      burst({ at, length: 1.3, gain: 0.16, type: 'bandpass', from: 700, to: 2600, q: 0.5, attack: 0.3 });
      burst({ at: at + 1.2, length: 0.12, gain: 0.25, type: 'lowpass', from: 600, to: 200 });
      break;
    case 'medal':
      // metal catching the light: a small bright ring
      knock({ at, length: 0.9, gain: 0.07, from: 2637, to: 2630 });
      knock({ at, length: 0.7, gain: 0.04, from: 3951, to: 3940 });
      break;
  }
}

// ---------- ambience: the room around the table ----------

export type AmbienceName = 'night' | 'day';

let wanted: AmbienceName | null = null;
let bed: { name: AmbienceName; gain: GainNode; stop: () => void } | null = null;

/** The room the table stands in: a quiet study at night, an office with its window open by day. */
export function setAmbience(name: AmbienceName | null): void {
  wanted = name;
  applyAmbience();
}

useJourney.subscribe((state, previous) => {
  if (state.sounds !== previous.sounds) applyAmbience();
});

function applyAmbience(): void {
  if (!context || !master || !noise) return;
  const name = useJourney.getState().sounds ? wanted : null;
  if (bed?.name === name) return;
  const now = context.currentTime;
  if (bed) {
    const old = bed;
    old.gain.gain.cancelScheduledValues(now);
    old.gain.gain.setTargetAtTime(0, now, 0.5);
    setTimeout(old.stop, 2500);
    bed = null;
  }
  if (!name) return;

  const gain = context.createGain();
  gain.gain.value = 0;
  gain.gain.setTargetAtTime(1, now, 1.2);
  gain.connect(master);
  const sources: AudioScheduledSourceNode[] = [];
  let timer = 0;

  const air = context.createBufferSource();
  air.buffer = noise;
  air.loop = true;
  const airFilter = context.createBiquadFilter();
  const airGain = context.createGain();
  air.connect(airFilter).connect(airGain).connect(gain);
  air.start();
  sources.push(air);

  if (name === 'night') {
    // the hush of a room, and a clock somewhere behind
    airFilter.type = 'lowpass';
    airFilter.frequency.value = 170;
    airGain.gain.value = 0.07;
    const audio = context;
    const tick = () => {
      if (!useJourney.getState().sounds) return;
      const at = audio.currentTime + 0.02;
      const oscillator = audio.createOscillator();
      const tickGain = audio.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(2100, at);
      oscillator.frequency.exponentialRampToValueAtTime(1300, at + 0.02);
      tickGain.gain.setValueAtTime(0.014, at);
      tickGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
      oscillator.connect(tickGain).connect(gain);
      oscillator.start(at);
      oscillator.stop(at + 0.08);
    };
    timer = window.setInterval(tick, 1000);
  } else {
    // open air through the window, and now and then an engine far off on the airfield
    airFilter.type = 'bandpass';
    airFilter.frequency.value = 520;
    airFilter.Q.value = 0.35;
    airGain.gain.value = 0.035;
    const sway = context.createOscillator();
    const swayDepth = context.createGain();
    sway.frequency.value = 0.07;
    swayDepth.gain.value = 0.018;
    sway.connect(swayDepth).connect(airGain.gain);
    sway.start();
    sources.push(sway);

    const drone = context.createGain();
    drone.gain.value = 0.012;
    const droneFilter = context.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 150;
    for (const frequency of [54, 54.6, 81.4]) {
      const oscillator = context.createOscillator();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = frequency;
      oscillator.connect(droneFilter);
      oscillator.start();
      sources.push(oscillator);
    }
    droneFilter.connect(drone).connect(gain);
    // it comes and goes, slowly
    const pass = context.createOscillator();
    const passDepth = context.createGain();
    pass.frequency.value = 0.021;
    passDepth.gain.value = 0.012;
    pass.connect(passDepth).connect(drone.gain);
    pass.start();
    sources.push(pass);
  }

  bed = {
    name,
    gain,
    stop: () => {
      window.clearInterval(timer);
      for (const source of sources) {
        try {
          source.stop();
        } catch {
          /* already stopped */
        }
      }
      gain.disconnect();
    },
  };
}
