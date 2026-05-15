import Typograf from "typograf";
import { Eyo, safeDictionary } from "eyo-kernel";
import type { RuleCategoryId, TypografSettings } from "@/lib/settings";

export type TypografStats = {
  changedCharacters: number;
  replacements: number;
  inputLength: number;
  outputLength: number;
};

export type TypografResult = {
  input: string;
  output: string;
  changed: boolean;
  stats: TypografStats;
  warnings: string[];
};

const CATEGORY_RULES: Record<RuleCategoryId, string[]> = {
  quotes: ["common/punctuation/quote", "common/punctuation/quoteLink"],
  spaces: ["common/space/*", "common/nbsp/*", "ru/nbsp/*"],
  dashes: ["ru/dash/*", "en-US/dash/*", "en-GB/dash/*"],
  punctuation: ["common/punctuation/*", "ru/punctuation/*"],
  numbers: ["common/number/*", "ru/number/*"],
  currency: ["ru/money/*"],
  phones: ["ru/other/phone-number"],
  symbols: ["common/symbols/*", "ru/symbols/*"],
  russian: ["ru/date/*", "ru/typo/*", "ru/other/*"],
  english: ["en-US/*", "en-GB/*"],
  yo: []
};

const CATEGORY_ENABLE_RULES: Partial<Record<RuleCategoryId, string[]>> = {
  currency: ["ru/money/*"]
};

const PROFILE_DISABLE_RULES: Record<TypografSettings["profile"], string[]> = {
  default: ["ru/optalign/*", "common/html/*"],
  strict: ["common/html/*"],
  minimal: [
    "common/html/*",
    "ru/typo/*",
    "ru/other/phone-number",
    "ru/punctuation/ano",
    "common/number/digitGrouping"
  ]
};

let safeEyo: Eyo | null = null;

export function typographText(input: string, settings: TypografSettings): TypografResult {
  const warnings: string[] = [];

  if (!input) {
    return {
      input,
      output: input,
      changed: false,
      stats: buildStats(input, input),
      warnings
    };
  }

  const tp = new Typograf({
    locale: settings.locale,
    htmlEntity: { type: "default" }
  });

  const disableRules = new Set<string>([
    ...PROFILE_DISABLE_RULES[settings.profile],
    ...settings.disabledRules
  ]);

  for (const [category, rules] of Object.entries(CATEGORY_RULES) as Array<
    [RuleCategoryId, string[]]
  >) {
    if (!settings.enabledCategories[category]) {
      rules.forEach((rule) => disableRules.add(rule));
    }
  }

  const enableRules = new Set<string>();
  for (const [category, rules] of Object.entries(CATEGORY_ENABLE_RULES) as Array<
    [RuleCategoryId, string[]]
  >) {
    if (settings.enabledCategories[category]) {
      rules.forEach((rule) => enableRules.add(rule));
    }
  }

  if (enableRules.size > 0) {
    tp.enableRule([...enableRules]);
  }

  if (disableRules.size > 0) {
    tp.disableRule([...disableRules]);
  }

  let output = tp.execute(input);
  output = applySafeCurrencyRules(output, settings);

  if (settings.enabledCategories.yo && settings.yoMode === "safe") {
    output = getSafeEyo().restore(output);
  } else if (!settings.enabledCategories.yo || settings.yoMode === "off") {
    warnings.push("Ёфикация отключена.");
  }

  if (settings.nbspMode === "html") {
    output = output.replace(/\u00a0/g, "&nbsp;").replace(/\u202f/g, "&#8239;");
  }

  return {
    input,
    output,
    changed: output !== input,
    stats: buildStats(input, output),
    warnings
  };
}

function applySafeCurrencyRules(output: string, settings: TypografSettings) {
  if (!settings.enabledCategories.currency) {
    return output;
  }

  return output.replace(
    /(^|[^\d])(\d[\d \u00a0\u202f.,]*\d|\d)[ \u00a0\u202f]+(руб|р)\.(?=$|[\s,;:!?])/giu,
    "$1$2\u00a0₽"
  );
}

export function buildStats(input: string, output: string): TypografStats {
  return {
    changedCharacters: countChangedCharacters(input, output),
    replacements: estimateReplacementCount(input, output),
    inputLength: input.length,
    outputLength: output.length
  };
}

function getSafeEyo() {
  if (!safeEyo) {
    safeEyo = new Eyo();
    safeEyo.dictionary.set(safeDictionary);
  }

  return safeEyo;
}

function countChangedCharacters(input: string, output: string) {
  const maxLength = Math.max(input.length, output.length);
  let count = 0;

  for (let index = 0; index < maxLength; index += 1) {
    if (input[index] !== output[index]) {
      count += 1;
    }
  }

  return count;
}

function estimateReplacementCount(input: string, output: string) {
  if (input === output) {
    return 0;
  }

  const normalizedInput = input.split(/\s+/).filter(Boolean).length;
  const normalizedOutput = output.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.abs(normalizedInput - normalizedOutput) + countChangedCharacters(input, output));
}
