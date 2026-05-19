import type { TypografSettings } from "@/lib/settings";

export type ActiveAppContext = {
  platform: string;
  processName: string;
  windowTitle: string;
};

const TILDA_MARKERS = ["tilda", "tilda.cc", "tilda.ws", "tilda publishing"] as const;

export function resolveSettingsForActiveContext(
  settings: TypografSettings,
  context: ActiveAppContext | null
): TypografSettings {
  if (!settings.autoProfiles.tilda || !isTildaContext(context)) {
    return settings;
  }

  return {
    ...settings,
    nbspMode: "tilda"
  };
}

export function isTildaContext(context: ActiveAppContext | null | undefined) {
  if (!context) {
    return false;
  }

  const haystack = `${context.processName} ${context.windowTitle}`.toLowerCase();
  return TILDA_MARKERS.some((marker) => haystack.includes(marker));
}
