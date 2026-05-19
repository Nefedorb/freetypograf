import {
  delay,
  getActiveAppContext,
  readClipboardText,
  sendCopyShortcut,
  sendPasteShortcut,
  writeClipboardText
} from "@/lib/desktop";
import type { LastResult, TypografSettings } from "@/lib/settings";
import { resolveSettingsForActiveContext } from "@/lib/active-app-context";
import { typographText } from "@/lib/typograf-engine";

export type ClipboardFlowResult = {
  status: "success" | "no-selection" | "no-changes" | "error" | "paused";
  lastResult: LastResult;
};

export async function runClipboardTypograf(settings: TypografSettings): Promise<ClipboardFlowResult> {
  if (settings.paused) {
    return buildFlowResult("paused", false, 0, 0, "Типограф на паузе.");
  }

  try {
    const activeContext = await safeGetActiveAppContext();
    const previousClipboard = await safeReadClipboard();

    await sendCopyShortcut();
    await delay(140);

    const selectedText = await safeReadClipboard();
    if (!selectedText) {
      return buildFlowResult("no-selection", false, 0, 0, "Не удалось получить выделенный текст.");
    }

    const effectiveSettings = resolveSettingsForActiveContext(settings, activeContext);
    const result = typographText(selectedText, effectiveSettings);
    if (!result.changed) {
      return buildFlowResult("no-changes", false, 0, 0, "Изменений нет.");
    }

    await writeClipboardText(result.output);
    await delay(60);
    await sendPasteShortcut();

    if (settings.privacy.restoreClipboard) {
      window.setTimeout(() => {
        void writeClipboardText(previousClipboard);
      }, 350);
    }

    return buildFlowResult(
      "success",
      true,
      result.stats.changedCharacters,
      result.stats.replacements,
      `Готово: изменено ${result.stats.changedCharacters} симв.`
    );
  } catch {
    return buildFlowResult("error", false, 0, 0, "Не удалось типографировать выделение.");
  }
}

function buildFlowResult(
  status: ClipboardFlowResult["status"],
  changed: boolean,
  changedCharacters: number,
  replacements: number,
  message: string
): ClipboardFlowResult {
  return {
    status,
    lastResult: {
      changed,
      changedCharacters,
      replacements,
      message,
      at: new Date().toISOString()
    }
  };
}

async function safeReadClipboard() {
  try {
    return await readClipboardText();
  } catch {
    return "";
  }
}

async function safeGetActiveAppContext() {
  try {
    return await getActiveAppContext();
  } catch {
    return null;
  }
}
