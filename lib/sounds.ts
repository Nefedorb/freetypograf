import type { SoundSettings } from "@/lib/settings";

export type ResultSoundStatus = "success" | "no-changes" | "no-selection" | "error" | "paused";

type SoundName = "tink" | "pop" | "purr";

const SOUND_URLS: Record<SoundName, string> = {
  tink: "/sounds/success.mp3",
  pop: "/sounds/no-changes.mp3",
  purr: "/sounds/error.wav"
};

export function playResultSound(settings: SoundSettings, status: ResultSoundStatus) {
  const soundName = getResultSoundName(settings, status);
  if (!settings.enabled || settings.volume <= 0 || !soundName) {
    return false;
  }

  if (typeof Audio === "undefined") {
    return false;
  }

  try {
    const audio = new Audio(SOUND_URLS[soundName]);
    audio.volume = Math.min(Math.max(settings.volume, 0), 10) / 10;
    void audio.play().catch(() => undefined);
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
