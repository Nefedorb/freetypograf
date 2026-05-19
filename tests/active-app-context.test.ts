import { describe, expect, it } from "vitest";
import {
  isTildaContext,
  resolveSettingsForActiveContext
} from "@/lib/active-app-context";
import { cloneDefaultSettings } from "@/lib/settings";

describe("active app context", () => {
  it("detects Tilda by window title", () => {
    expect(
      isTildaContext({
        platform: "windows",
        processName: "chrome.exe",
        windowTitle: "Tilda Publishing - page editor"
      })
    ).toBe(true);
  });

  it("detects Tilda by process name", () => {
    expect(
      isTildaContext({
        platform: "macos",
        processName: "Tilda",
        windowTitle: ""
      })
    ).toBe(true);
  });

  it("does not detect regular apps as Tilda", () => {
    expect(
      isTildaContext({
        platform: "windows",
        processName: "WINWORD.EXE",
        windowTitle: "Document1 - Word"
      })
    ).toBe(false);
  });

  it("switches only NBSP mode for Tilda context", () => {
    const settings = cloneDefaultSettings();
    const resolved = resolveSettingsForActiveContext(settings, {
      platform: "windows",
      processName: "chrome.exe",
      windowTitle: "Tilda Publishing"
    });

    expect(resolved.nbspMode).toBe("tilda");
    expect(settings.nbspMode).toBe("unicode");
  });

  it("keeps settings unchanged when Tilda auto profile is disabled", () => {
    const settings = cloneDefaultSettings();
    settings.autoProfiles.tilda = false;

    const resolved = resolveSettingsForActiveContext(settings, {
      platform: "windows",
      processName: "chrome.exe",
      windowTitle: "Tilda Publishing"
    });

    expect(resolved).toBe(settings);
    expect(resolved.nbspMode).toBe("unicode");
  });
});
