"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readLastResult,
  readSettings,
  type LastResult,
  type TypografSettings,
  writeLastResult,
  writeSettings
} from "@/lib/settings";

export function useSettings() {
  const [settings, setSettingsState] = useState<TypografSettings>(() => readSettings());
  const [lastResult, setLastResultState] = useState<LastResult | null>(() => readLastResult());

  useEffect(() => {
    const syncSettings = () => setSettingsState(readSettings());
    const syncResult = () => setLastResultState(readLastResult());

    window.addEventListener("storage", syncSettings);
    window.addEventListener("typograf-settings-changed", syncSettings);
    window.addEventListener("typograf-result-changed", syncResult);

    return () => {
      window.removeEventListener("storage", syncSettings);
      window.removeEventListener("typograf-settings-changed", syncSettings);
      window.removeEventListener("typograf-result-changed", syncResult);
    };
  }, []);

  const setSettings = useCallback((next: TypografSettings) => {
    writeSettings(next);
    setSettingsState(next);
  }, []);

  const patchSettings = useCallback(
    (patch: (current: TypografSettings) => TypografSettings) => {
      setSettings(patch(readSettings()));
    },
    [setSettings]
  );

  const setLastResult = useCallback((result: LastResult | null) => {
    writeLastResult(result);
    setLastResultState(result);
  }, []);

  return {
    settings,
    setSettings,
    patchSettings,
    lastResult,
    setLastResult
  };
}
