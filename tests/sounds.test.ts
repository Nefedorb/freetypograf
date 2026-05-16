import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SoundSettings } from "@/lib/settings";
import { getResultSoundName, playResultSound } from "@/lib/sounds";

const audioInstances: MockAudio[] = [];

class MockAudio {
  volume = 0;
  play = vi.fn(() => Promise.resolve());

  constructor(public src: string) {
    audioInstances.push(this);
  }
}

function createSoundSettings(patch: Partial<SoundSettings> = {}): SoundSettings {
  return {
    enabled: true,
    volume: 8,
    success: "tink",
    noChanges: "pop",
    error: "purr",
    ...patch
  };
}

describe("result sounds", () => {
  beforeEach(() => {
    audioInstances.length = 0;
    vi.stubGlobal("Audio", MockAudio);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("не создает Audio, если звуки выключены", () => {
    const played = playResultSound(createSoundSettings({ enabled: false }), "success");

    expect(played).toBe(false);
    expect(audioInstances).toHaveLength(0);
  });

  it("не запускает звук при нулевой громкости", () => {
    const played = playResultSound(createSoundSettings({ volume: 0 }), "success");

    expect(played).toBe(false);
    expect(audioInstances).toHaveLength(0);
  });

  it("не проигрывает звук на паузе", () => {
    const played = playResultSound(createSoundSettings(), "paused");

    expect(played).toBe(false);
    expect(audioInstances).toHaveLength(0);
  });

  it("выбирает разные пресеты для результата", () => {
    expect(getResultSoundName(createSoundSettings(), "success")).toBe("tink");
    expect(getResultSoundName(createSoundSettings(), "no-changes")).toBe("pop");
    expect(getResultSoundName(createSoundSettings(), "error")).toBe("purr");
    expect(getResultSoundName(createSoundSettings(), "no-selection")).toBe("purr");
  });

  it("проигрывает success-файл с громкостью из настроек", () => {
    const played = playResultSound(createSoundSettings(), "success");

    expect(played).toBe(true);
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0]?.src).toBe("/sounds/success.mp3");
    expect(audioInstances[0]?.volume).toBe(0.8);
    expect(audioInstances[0]?.play).toHaveBeenCalledTimes(1);
  });

  it("выбирает локальные файлы для no-changes и error", () => {
    playResultSound(createSoundSettings(), "no-changes");
    playResultSound(createSoundSettings(), "error");
    playResultSound(createSoundSettings(), "no-selection");

    expect(audioInstances.map((audio) => audio.src)).toEqual([
      "/sounds/no-changes.mp3",
      "/sounds/error.wav",
      "/sounds/error.wav"
    ]);
  });

  it("не выбрасывает ошибку, если audio.play отклонен браузером", () => {
    class RejectedAudio extends MockAudio {
      play = vi.fn(() => Promise.reject(new Error("blocked")));
    }

    vi.stubGlobal("Audio", RejectedAudio);

    expect(() => playResultSound(createSoundSettings(), "success")).not.toThrow();
  });
});
