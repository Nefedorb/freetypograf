import { describe, expect, it } from "vitest";
import {
  cloneDefaultSettings,
  DEFAULT_SETTINGS,
  normalizeSettings,
  readSettings,
  SETTINGS_VERSION,
  STORAGE_KEY,
  writeSettings
} from "@/lib/settings";

describe("settings schema", () => {
  it("возвращает безопасные дефолты для пустого значения", () => {
    const settings = normalizeSettings(null);

    expect(settings.version).toBe(SETTINGS_VERSION);
    expect(settings.profile).toBe("default");
    expect(settings.privacy.localOnly).toBe(true);
    expect(settings.floatingButton.enabled).toBe(true);
  });

  it("мигрирует частичные настройки и не дает отключить localOnly", () => {
    const settings = normalizeSettings({
      version: 0,
      profile: "strict",
      nbspMode: "html",
      privacy: {
        localOnly: false,
        restoreClipboard: false
      },
      enabledCategories: {
        quotes: false,
        spaces: true
      }
    });

    expect(settings.version).toBe(SETTINGS_VERSION);
    expect(settings.profile).toBe("strict");
    expect(settings.nbspMode).toBe("html");
    expect(settings.privacy.localOnly).toBe(true);
    expect(settings.privacy.restoreClipboard).toBe(false);
    expect(settings.enabledCategories.quotes).toBe(false);
    expect(settings.enabledCategories.dashes).toBe(true);
  });

  it("клонирует дефолты без общей ссылки на вложенные объекты", () => {
    const first = cloneDefaultSettings();
    const second = cloneDefaultSettings();

    first.enabledCategories.quotes = false;
    first.floatingButton.x = 1;

    expect(second.enabledCategories.quotes).toBe(DEFAULT_SETTINGS.enabledCategories.quotes);
    expect(second.floatingButton.x).toBe(DEFAULT_SETTINGS.floatingButton.x);
  });

  it("читает и пишет настройки через localStorage", () => {
    const settings = cloneDefaultSettings();
    settings.profile = "minimal";

    writeSettings(settings);

    expect(window.localStorage.getItem(STORAGE_KEY)).toContain("minimal");
    expect(readSettings().profile).toBe("minimal");
  });
});
