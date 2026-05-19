export const SETTINGS_VERSION = 2;

export type TypografProfile = "default" | "strict" | "minimal";
export type NbspMode = "unicode" | "html";
export type YoMode = "off" | "safe";
export type AppTheme = "system" | "light" | "dark";

export const RULE_CATEGORY_IDS = [
  "quotes",
  "spaces",
  "dashes",
  "punctuation",
  "numbers",
  "currency",
  "phones",
  "symbols",
  "russian",
  "english",
  "yo"
] as const;

export type RuleCategoryId = (typeof RULE_CATEGORY_IDS)[number];

export type RuleCategory = {
  id: RuleCategoryId;
  title: string;
  description: string;
};

export const RULE_CATEGORIES: RuleCategory[] = [
  {
    id: "quotes",
    title: "Кавычки",
    description: "Елочки, лапки и английские кавычки по локали."
  },
  {
    id: "spaces",
    title: "Пробелы и NBSP",
    description: "Лишние пробелы, короткие слова, инициалы, сокращения."
  },
  {
    id: "dashes",
    title: "Тире и дефисы",
    description: "Длинные тире, диапазоны, дефисные частицы."
  },
  {
    id: "punctuation",
    title: "Пунктуация",
    description: "Многоточие, повторы знаков, пробелы около пунктуации."
  },
  {
    id: "numbers",
    title: "Числа",
    description: "Разряды, дроби, математические знаки, единицы."
  },
  {
    id: "currency",
    title: "Валюта",
    description: "Рубли, доллары, евро и корректная позиция знака."
  },
  {
    id: "phones",
    title: "Телефоны",
    description: "Российские телефонные номера в аккуратном формате."
  },
  {
    id: "symbols",
    title: "Символы",
    description: "©, ™, ®, стрелки, градусы и похожие замены."
  },
  {
    id: "russian",
    title: "Русский язык",
    description: "Русские даты, сокращения, адреса и типовые опечатки."
  },
  {
    id: "english",
    title: "English",
    description: "Английские кавычки и тире для mixed-language текста."
  },
  {
    id: "yo",
    title: "Буква Ё",
    description: "Только безопасные бесспорные замены е на ё."
  }
];

export type FloatingButtonSettings = {
  enabled: boolean;
  x: number;
  y: number;
  opacity: number;
  showResultBadge: boolean;
};

export type SoundSettings = {
  enabled: boolean;
  volume: number;
  success: "tink" | "pop" | "none";
  noChanges: "pop" | "none";
  error: "purr" | "none";
};

export type PrivacySettings = {
  localOnly: true;
  restoreClipboard: boolean;
  rememberLastResult: boolean;
};

export type CustomReplacementRule = {
  id: string;
  from: string;
  to: string;
  enabled: boolean;
};

export type BuiltInReplacementSettings = {
  emailToElectronicMail: boolean;
};

export type TypografSettings = {
  version: number;
  profile: TypografProfile;
  locale: Array<"ru" | "en-US">;
  enabledCategories: Record<RuleCategoryId, boolean>;
  disabledRules: string[];
  builtInReplacements: BuiltInReplacementSettings;
  customReplacements: CustomReplacementRule[];
  nbspMode: NbspMode;
  yoMode: YoMode;
  hotkey: string;
  paused: boolean;
  theme: AppTheme;
  floatingButton: FloatingButtonSettings;
  sounds: SoundSettings;
  privacy: PrivacySettings;
};

export type LastResult = {
  changed: boolean;
  changedCharacters: number;
  replacements: number;
  message: string;
  at: string;
};

export const STORAGE_KEY = "typograf.settings.v1";
export const LAST_RESULT_KEY = "typograf.last-result.v1";
export const MAX_CUSTOM_REPLACEMENTS = 30;
export const MAX_CUSTOM_REPLACEMENT_LENGTH = 200;

const enabledCategories: Record<RuleCategoryId, boolean> = {
  quotes: true,
  spaces: true,
  dashes: true,
  punctuation: true,
  numbers: true,
  currency: true,
  phones: true,
  symbols: true,
  russian: true,
  english: true,
  yo: true
};

export const DEFAULT_SETTINGS: TypografSettings = {
  version: SETTINGS_VERSION,
  profile: "default",
  locale: ["ru", "en-US"],
  enabledCategories,
  disabledRules: [],
  builtInReplacements: {
    emailToElectronicMail: true
  },
  customReplacements: [],
  nbspMode: "unicode",
  yoMode: "safe",
  hotkey: "CommandOrControl+Shift+T",
  paused: false,
  theme: "system",
  floatingButton: {
    enabled: true,
    x: 960,
    y: 420,
    opacity: 0.98,
    showResultBadge: true
  },
  sounds: {
    enabled: false,
    volume: 8,
    success: "tink",
    noChanges: "pop",
    error: "purr"
  },
  privacy: {
    localOnly: true,
    restoreClipboard: true,
    rememberLastResult: true
  }
};

export function cloneDefaultSettings(): TypografSettings {
  return {
    ...DEFAULT_SETTINGS,
    locale: [...DEFAULT_SETTINGS.locale],
    enabledCategories: { ...DEFAULT_SETTINGS.enabledCategories },
    disabledRules: [...DEFAULT_SETTINGS.disabledRules],
    builtInReplacements: { ...DEFAULT_SETTINGS.builtInReplacements },
    customReplacements: DEFAULT_SETTINGS.customReplacements.map((rule) => ({ ...rule })),
    floatingButton: { ...DEFAULT_SETTINGS.floatingButton },
    sounds: { ...DEFAULT_SETTINGS.sounds },
    privacy: { ...DEFAULT_SETTINGS.privacy }
  };
}

export function normalizeSettings(value: unknown): TypografSettings {
  if (!value || typeof value !== "object") {
    return cloneDefaultSettings();
  }

  const incoming = value as Partial<TypografSettings>;
  const defaults = cloneDefaultSettings();
  const categories = { ...defaults.enabledCategories };

  if (incoming.enabledCategories && typeof incoming.enabledCategories === "object") {
    for (const id of RULE_CATEGORY_IDS) {
      const nextValue = incoming.enabledCategories[id];
      if (typeof nextValue === "boolean") {
        categories[id] = nextValue;
      }
    }
  }

  const profile = isProfile(incoming.profile) ? incoming.profile : defaults.profile;
  const nbspMode = incoming.nbspMode === "html" ? "html" : defaults.nbspMode;
  const yoMode = incoming.yoMode === "off" ? "off" : defaults.yoMode;
  const theme = isTheme(incoming.theme) ? incoming.theme : defaults.theme;
  const incomingVersion = typeof incoming.version === "number" ? incoming.version : 0;
  const sounds = {
    ...defaults.sounds,
    ...(isRecord(incoming.sounds) ? incoming.sounds : {})
  };

  if (incomingVersion < 2) {
    sounds.enabled = false;
  }

  return {
    ...defaults,
    version: SETTINGS_VERSION,
    profile,
    locale: defaults.locale,
    enabledCategories: categories,
    disabledRules: Array.isArray(incoming.disabledRules)
      ? incoming.disabledRules.filter((rule): rule is string => typeof rule === "string")
      : defaults.disabledRules,
    builtInReplacements: normalizeBuiltInReplacements(incoming.builtInReplacements),
    customReplacements: normalizeCustomReplacements(incoming.customReplacements),
    nbspMode,
    yoMode,
    hotkey: typeof incoming.hotkey === "string" && incoming.hotkey.trim()
      ? incoming.hotkey.trim()
      : defaults.hotkey,
    paused: typeof incoming.paused === "boolean" ? incoming.paused : defaults.paused,
    theme,
    floatingButton: {
      ...defaults.floatingButton,
      ...(isRecord(incoming.floatingButton) ? incoming.floatingButton : {})
    },
    sounds,
    privacy: {
      ...defaults.privacy,
      ...(isRecord(incoming.privacy) ? incoming.privacy : {}),
      localOnly: true
    }
  };
}

export function readSettings(): TypografSettings {
  if (typeof window === "undefined") {
    return cloneDefaultSettings();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return cloneDefaultSettings();
  }

  try {
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return cloneDefaultSettings();
  }
}

export function writeSettings(settings: TypografSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSettings(settings)));
  window.dispatchEvent(new CustomEvent("typograf-settings-changed"));
}

export function readLastResult(): LastResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LAST_RESULT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LastResult;
  } catch {
    return null;
  }
}

export function writeLastResult(result: LastResult | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!result) {
    window.localStorage.removeItem(LAST_RESULT_KEY);
    return;
  }

  window.localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
  window.dispatchEvent(new CustomEvent("typograf-result-changed"));
}

function isProfile(value: unknown): value is TypografProfile {
  return value === "default" || value === "strict" || value === "minimal";
}

function isTheme(value: unknown): value is AppTheme {
  return value === "system" || value === "light" || value === "dark";
}

function normalizeBuiltInReplacements(value: unknown): BuiltInReplacementSettings {
  const defaults = cloneDefaultSettings().builtInReplacements;
  if (!isRecord(value)) {
    return defaults;
  }

  return {
    emailToElectronicMail:
      typeof value.emailToElectronicMail === "boolean"
        ? value.emailToElectronicMail
        : defaults.emailToElectronicMail
  };
}

function normalizeCustomReplacements(value: unknown): CustomReplacementRule[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const rules: CustomReplacementRule[] = [];

  for (const item of value) {
    if (!isRecord(item) || rules.length >= MAX_CUSTOM_REPLACEMENTS) {
      continue;
    }

    const from = normalizeReplacementText(item.from);
    if (!from) {
      continue;
    }

    rules.push({
      id: normalizeReplacementId(item.id, rules.length),
      from,
      to: normalizeReplacementText(item.to),
      enabled: item.enabled !== false
    });
  }

  return rules;
}

function normalizeReplacementText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, MAX_CUSTOM_REPLACEMENT_LENGTH);
}

function normalizeReplacementId(value: unknown, index: number) {
  if (typeof value === "string" && value.trim()) {
    return value.trim().slice(0, 80);
  }

  return `custom-${index + 1}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
