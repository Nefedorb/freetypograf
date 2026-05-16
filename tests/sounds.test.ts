import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SoundSettings } from "@/lib/settings";
import { getResultSoundName, playResultSound } from "@/lib/sounds";

const contexts: MockAudioContext[] = [];

class MockAudioParam {
  setValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}

class MockOscillator {
  frequency = new MockAudioParam();
  type: OscillatorType = "sine";
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  addEventListener = vi.fn();
}

class MockGain {
  gain = new MockAudioParam();
  connect = vi.fn();
}

class MockAudioContext {
  currentTime = 3;
  destination = {};
  state: AudioContextState = "running";
  oscillator = new MockOscillator();
  gain = new MockGain();
  createOscillator = vi.fn(() => this.oscillator);
  createGain = vi.fn(() => this.gain);
  resume = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());

  constructor() {
    contexts.push(this);
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
    contexts.length = 0;
    vi.stubGlobal("AudioContext", MockAudioContext as unknown as typeof AudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("не создает Web Audio, если звуки выключены", () => {
    const played = playResultSound(createSoundSettings({ enabled: false }), "success");

    expect(played).toBe(false);
    expect(contexts).toHaveLength(0);
  });

  it("не запускает звук при нулевой громкости", () => {
    const played = playResultSound(createSoundSettings({ volume: 0 }), "success");

    expect(played).toBe(false);
    expect(contexts).toHaveLength(0);
  });

  it("не проигрывает звук на паузе", () => {
    const played = playResultSound(createSoundSettings(), "paused");

    expect(played).toBe(false);
    expect(contexts).toHaveLength(0);
  });

  it("выбирает разные пресеты для результата", () => {
    expect(getResultSoundName(createSoundSettings(), "success")).toBe("tink");
    expect(getResultSoundName(createSoundSettings(), "no-changes")).toBe("pop");
    expect(getResultSoundName(createSoundSettings(), "error")).toBe("purr");
    expect(getResultSoundName(createSoundSettings(), "no-selection")).toBe("purr");
  });

  it("проигрывает короткий локальный сигнал через Web Audio", () => {
    const played = playResultSound(createSoundSettings(), "success");

    expect(played).toBe(true);
    expect(contexts).toHaveLength(1);
    expect(contexts[0]?.createOscillator).toHaveBeenCalledTimes(1);
    expect(contexts[0]?.createGain).toHaveBeenCalledTimes(1);
    expect(contexts[0]?.oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(880, 3);
    expect(contexts[0]?.gain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      0.08,
      3.015
    );
    expect(contexts[0]?.oscillator.start).toHaveBeenCalledWith(3);
  });
});
