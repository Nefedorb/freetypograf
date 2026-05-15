"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { Check, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runClipboardTypograf } from "@/lib/clipboard-flow";
import {
  onTauriEvent,
  registerShortcut,
  setFloatingWindowVisible,
  setFloatingPosition,
  showSettingsWindow
} from "@/lib/desktop";
import { useSettings } from "@/hooks/use-settings";

type DragState = {
  startPointerX: number;
  startPointerY: number;
  startWindowX: number;
  startWindowY: number;
  moved: boolean;
};

const RESULT_BADGE_TIMEOUT_MS = 2500;

export default function FloatingButtonPage() {
  const { settings, patchSettings, setLastResult } = useSettings();
  const [busy, setBusy] = useState(false);
  const [resultBadgeValue, setResultBadgeValue] = useState<number | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const clickTimerRef = useRef<number | null>(null);
  const resultBadgeTimerRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  const showResultBadge = useCallback((changedCharacters: number) => {
    if (resultBadgeTimerRef.current) {
      window.clearTimeout(resultBadgeTimerRef.current);
    }

    setResultBadgeValue(changedCharacters);
    resultBadgeTimerRef.current = window.setTimeout(() => {
      setResultBadgeValue(null);
      resultBadgeTimerRef.current = null;
    }, RESULT_BADGE_TIMEOUT_MS);
  }, []);

  const run = useCallback(async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    const result = await runClipboardTypograf(settings);
    setLastResult(settings.privacy.rememberLastResult ? result.lastResult : null);
    if (result.status === "success" || result.status === "no-changes") {
      showResultBadge(result.lastResult.changedCharacters);
    }
    setBusy(false);
  }, [busy, settings, setLastResult, showResultBadge]);

  useEffect(() => {
    document.documentElement.classList.add("floating-html");
    document.body.classList.add("floating-body");
    return () => {
      document.documentElement.classList.remove("floating-html");
      document.body.classList.remove("floating-body");
      if (resultBadgeTimerRef.current) {
        window.clearTimeout(resultBadgeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    void registerShortcut(settings.hotkey);
  }, [settings.hotkey]);

  useEffect(() => {
    if (settings.floatingButton.enabled) {
      void setFloatingPosition(settings.floatingButton.x, settings.floatingButton.y);
    }
  }, [settings.floatingButton.enabled, settings.floatingButton.x, settings.floatingButton.y]);

  useEffect(() => {
    let shortcutCleanup: (() => void) | undefined;
    let pauseCleanup: (() => void) | undefined;

    void onTauriEvent("typograf-shortcut", () => {
      void run();
    }).then((unlisten) => {
      shortcutCleanup = unlisten;
    });

    void onTauriEvent("typograf-toggle-pause", () => {
      patchSettings((current) => ({ ...current, paused: !current.paused }));
    }).then((unlisten) => {
      pauseCleanup = unlisten;
    });

    return () => {
      shortcutCleanup?.();
      pauseCleanup?.();
    };
  }, [patchSettings, run]);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startPointerX: event.screenX,
      startPointerY: event.screenY,
      startWindowX: settings.floatingButton.x,
      startWindowY: settings.floatingButton.y,
      moved: false
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }

    const deltaX = event.screenX - drag.startPointerX;
    const deltaY = event.screenY - drag.startPointerY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 4) {
      drag.moved = true;
    }

    const x = Math.max(0, Math.round(drag.startWindowX + deltaX));
    const y = Math.max(0, Math.round(drag.startWindowY + deltaY));
    void setFloatingPosition(x, y);
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (!drag || !drag.moved) {
      return;
    }

    suppressClickRef.current = true;
    const x = Math.max(0, Math.round(drag.startWindowX + event.screenX - drag.startPointerX));
    const y = Math.max(0, Math.round(drag.startWindowY + event.screenY - drag.startPointerY));
    patchSettings((current) => ({
      ...current,
      floatingButton: {
        ...current.floatingButton,
        x,
        y
      }
    }));
  };

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      void showSettingsWindow();
      return;
    }

    clickTimerRef.current = window.setTimeout(() => {
      clickTimerRef.current = null;
      void run();
    }, 220);
  };

  const handleHideFloating = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }

    patchSettings((current) => ({
      ...current,
      floatingButton: {
        ...current.floatingButton,
        enabled: false
      }
    }));
    void setFloatingWindowVisible(false);
  };

  return (
    <main
      className="grid h-screen w-screen place-items-center overflow-hidden bg-transparent p-2"
      style={{ opacity: settings.floatingButton.opacity }}
    >
      <div className="relative">
        <Button
          aria-label="Типографировать выделенный текст"
          className="size-16 rounded-full border border-border/80 bg-background/95 text-foreground shadow-lg backdrop-blur hover:bg-accent"
          disabled={busy}
          size="icon"
          title={settings.paused ? "Типограф на паузе" : "Один клик — обработать, два — настройки"}
          variant="outline"
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <Type className="size-7" />
        </Button>
        {resultBadgeValue === null ? (
          <Button
            aria-label="Скрыть плавающую кнопку"
            className="absolute -right-0.5 -top-0.5 size-5 rounded-full border bg-primary p-0 text-primary-foreground shadow-sm hover:bg-primary/90"
            size="icon"
            title="Скрыть плавающую кнопку"
            type="button"
            onClick={handleHideFloating}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <X className="size-3" />
          </Button>
        ) : (
          <span
            aria-live="polite"
            className="absolute left-1/2 top-0 flex h-6 min-w-11 -translate-x-1/2 -translate-y-1 items-center justify-center gap-1 rounded-full border border-border bg-background/95 px-2 text-xs font-semibold text-foreground shadow-sm backdrop-blur animate-in fade-in zoom-in-95 duration-200"
            role="status"
            title={`Изменено ${resultBadgeValue} символов`}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <span>{resultBadgeValue}</span>
            <Check className="size-3 animate-pulse text-primary" />
          </span>
        )}
      </div>
    </main>
  );
}
