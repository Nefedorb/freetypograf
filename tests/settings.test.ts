import { describe, expect, it } from "vitest";
import {
  cloneDefaultSettings,
  DEFAULT_SETTINGS,
  MAX_CUSTOM_REPLACEMENTS,
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
    expect(settings.sounds.enabled).toBe(false);
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

  it("мигрирует старые настройки без пользовательских правил", () => {
    const settings = normalizeSettings({
      version: 0,
      profile: "default"
    });

    expect(settings.customReplacements).toEqual([]);
  });

  it("мигрирует старые настройки со включенными встроенными заменами", () => {
    const settings = normalizeSettings({
      version: 0,
      profile: "default"
    });

    expect(settings.builtInReplacements.emailToElectronicMail).toBe(true);
  });

  it("сохраняет выключенную встроенную замену email", () => {
    const settings = normalizeSettings({
      builtInReplacements: {
        emailToElectronicMail: false
      }
    });

    expect(settings.builtInReplacements.emailToElectronicMail).toBe(false);
  });

  it("сохраняет пользовательский выбор включенных звуков", () => {
    const settings = normalizeSettings({
      sounds: {
        enabled: true
      }
    });

    expect(settings.sounds.enabled).toBe(true);
  });

  it("нормализует пользовательские правила и удаляет пустой from", () => {
    const settings = normalizeSettings({
      customReplacements: [
        {
          id: "valid",
          from: "  Ивановв  ",
          to: "  Иванов  ",
          enabled: true
        },
        {
          id: "empty",
          from: "   ",
          to: "x",
          enabled: true
        },
        {
          id: 123,
          from: "email",
          to: 456,
          enabled: "yes"
        }
      ]
    });

    expect(settings.customReplacements).toEqual([
      {
        id: "valid",
        from: "Ивановв",
        to: "Иванов",
        enabled: true
      },
      {
        id: "custom-2",
        from: "email",
        to: "",
        enabled: true
      }
    ]);
  });

  it("ограничивает количество пользовательских правил", () => {
    const settings = normalizeSettings({
      customReplacements: Array.from({ length: MAX_CUSTOM_REPLACEMENTS + 5 }, (_, index) => ({
        id: `rule-${index}`,
        from: `from-${index}`,
        to: `to-${index}`,
        enabled: true
      }))
    });

    expect(settings.customReplacements).toHaveLength(MAX_CUSTOM_REPLACEMENTS);
  });
});
