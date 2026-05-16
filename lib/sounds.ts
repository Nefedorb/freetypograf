import type { SoundSettings } from "@/lib/settings";

export type ResultSoundStatus = "success" | "no-changes" | "no-selection" | "error" | "paused";

type SoundName = "tink" | "pop" | "purr";

type SoundPreset = {
  frequency: number;
  endFrequency: number;
  duration: number;
  type: OscillatorType;
};

const SOUND_PRESETS: Record<SoundName, SoundPreset> = {
  tink: {
    frequency: 880,
    endFrequency: 1320,
    duration: 0.12,
    type: "sine"
  },
  pop: {
    frequency: 260,
    endFrequency: 180,
    duration: 0.1,
    type: "triangle"
  },
  purr: {
    frequency: 130,
    endFrequency: 90,
    duration: 0.16,
    type: "sawtooth"
  }
};

type BrowserWindowWithAudio = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

export function playResultSound(settings: SoundSettings, status: ResultSoundStatus) {
  const soundName = getResultSoundName(settings, status);
  if (!settings.enabled || settings.volume <= 0 || !soundName) {
    return false;
  }

  const AudioContextConstructor = getAudioContextConstructor();
  if (!AudioContextConstructor) {
    return false;
  }

  try {
    const preset = SOUND_PRESETS[soundName];
    const context = new AudioContextConstructor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const level = Math.min(Math.max(settings.volume, 0), 10) / 100;

    oscillator.type = preset.type;
    oscillator.frequency.setValueAtTime(preset.frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(preset.endFrequency, now + preset.duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(level, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + preset.duration + 0.03);
    oscillator.addEventListener("ended", () => {
      void context.close();
    });

    if (context.state === "suspended") {
      void context.resume().catch(() => undefined);
    }

    return true;
  } catch {
    return false;
  }
}

export function getResultSoundName(settings: SoundSettings, status: ResultSoundStatus) {
  if (status === "success") {
    return settings.success === "none" ? null : settings.success;
  }

  if (status === "no-changes") {
    return settings.noChanges === "none" ? null : settings.noChanges;
  }

  if (status === "error" || status === "no-selection") {
    return settings.error === "none" ? null : settings.error;
  }

  return null;
}

function getAudioContextConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  const audioWindow = window as BrowserWindowWithAudio;
  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext ?? null;
}
