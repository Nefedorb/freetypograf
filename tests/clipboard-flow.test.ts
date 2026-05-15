import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cloneDefaultSettings } from "@/lib/settings";

const desktop = vi.hoisted(() => ({
  delay: vi.fn(() => Promise.resolve()),
  readClipboardText: vi.fn<() => Promise<string>>(),
  sendCopyShortcut: vi.fn(() => Promise.resolve()),
  sendPasteShortcut: vi.fn(() => Promise.resolve()),
  writeClipboardText: vi.fn<(text: string) => Promise<void>>(() => Promise.resolve())
}));

vi.mock("@/lib/desktop", () => desktop);

describe("clipboard-flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("сохраняет буфер, копирует выделение, вставляет типографированный текст и восстанавливает буфер", async () => {
    const { runClipboardTypograf } = await import("@/lib/clipboard-flow");
    const settings = cloneDefaultSettings();

    desktop.readClipboardText
      .mockResolvedValueOnce("старый буфер")
      .mockResolvedValueOnce('"Привет" -- мир');

    const result = await runClipboardTypograf(settings);

    expect(result.status).toBe("success");
    expect(desktop.sendCopyShortcut).toHaveBeenCalledTimes(1);
    expect(desktop.writeClipboardText).toHaveBeenNthCalledWith(1, "«Привет»\u00a0— мир");
    expect(desktop.sendPasteShortcut).toHaveBeenCalledTimes(1);

    vi.runOnlyPendingTimers();
    await Promise.resolve();

    expect(desktop.writeClipboardText).toHaveBeenNthCalledWith(2, "старый буфер");
  });

  it("не вставляет текст, если выделение пустое", async () => {
    const { runClipboardTypograf } = await import("@/lib/clipboard-flow");
    const settings = cloneDefaultSettings();

    desktop.readClipboardText.mockResolvedValueOnce("старый буфер").mockResolvedValueOnce("");

    const result = await runClipboardTypograf(settings);

    expect(result.status).toBe("no-selection");
    expect(desktop.writeClipboardText).not.toHaveBeenCalled();
    expect(desktop.sendPasteShortcut).not.toHaveBeenCalled();
  });

  it("останавливается на паузе до чтения буфера", async () => {
    const { runClipboardTypograf } = await import("@/lib/clipboard-flow");
    const settings = cloneDefaultSettings();
    settings.paused = true;

    const result = await runClipboardTypograf(settings);

    expect(result.status).toBe("paused");
    expect(desktop.readClipboardText).not.toHaveBeenCalled();
    expect(desktop.sendCopyShortcut).not.toHaveBeenCalled();
  });

  it("не пишет содержимое текста в консоль при ошибке", async () => {
    const { runClipboardTypograf } = await import("@/lib/clipboard-flow");
    const settings = cloneDefaultSettings();
    const logSpy = vi.spyOn(console, "log");
    const errorSpy = vi.spyOn(console, "error");

    desktop.readClipboardText.mockRejectedValue(new Error("секретный текст"));

    const result = await runClipboardTypograf(settings);

    expect(result.status).toBe("no-selection");
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
