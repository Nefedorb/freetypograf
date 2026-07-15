"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Check, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runClipboardTypograf } from "@/lib/clipboard-flow";
import {
  clampFloatingPosition,
  getFloatingScreenBounds,
  type FloatingPosition
} from "@/lib/floating-position";
import {
  onTauriEvent,
  registerShortcut,
  setFloatingPosition,
  setFloatingWindowVisible,
  showSettingsWindow
} from "@/lib/desktop";
import { playResultSound } from "@/lib/sounds";
import { useSettings } from "@/hooks/use-settings";

type DragState = {
  startPointerX: number;
  startPointerY: number;
  startWindowX: number;
  startWindowY: number;
  lastPosition: FloatingPosition;
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
  const positionFrameRef = useRef<number | null>(null);
  const pendingPositionRef = useRef<FloatingPosition | null>(null);
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

  const sendFloatingPosition = useCallback((position: FloatingPosition) => {
    void setFloatingPosition(position.x, position.y).catch(() => undefined);
  }, []);

  const flushFloatingPosition = useCallback(
    (position: FloatingPosition) => {
      if (positionFrameRef.current !== null) {
        window.cancelAnimationFrame(positionFrameRef.current);
        positionFrameRef.current = null;
      }

      pendingPositionRef.current = null;
      sendFloatingPosition(position);
    },
    [sendFloatingPosition]
  );

  const queueFloatingPosition = useCallback(
    (position: FloatingPosition) => {
      pendingPositionRef.current = position;
      if (positionFrameRef.current !== null) {
        return;
      }

      positionFrameRef.current = window.requestAnimationFrame(() => {
        positionFrameRef.current = null;
        const nextPosition = pendingPositionRef.current;
        pendingPositionRef.current = null;
        if (nextPosition) {
          sendFloatingPosition(nextPosition);
        }
      });
    },
    [sendFloatingPosition]
  );

  const commitFloatingPosition = useCallback(
    (position: FloatingPosition) => {
      const nextPosition = clampFloatingPosition(position, getFloatingScreenBounds());
      flushFloatingPosition(nextPosition);
      patchSettings((current) => ({
        ...current,
        floatingButton: {
          ...current.floatingButton,
          x: nextPosition.x,
          y: nextPosition.y
        }
      }));
    },
    [flushFloatingPosition, patchSettings]
  );

  const run = useCallback(async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    const result = await runClipboardTypograf(settings);
    playResultSound(settings.sounds, result.status);
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
      if (positionFrameRef.current !== null) {
        window.cancelAnimationFrame(positionFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    void registerShortcut(settings.hotkey).catch(() => undefined);
  }, [settings.hotkey]);

  useEffect(() => {
    if (!settings.floatingButton.enabled) {
      return;
    }

    const nextPosition = clampFloatingPosition(
      { x: settings.floatingButton.x, y: settings.floatingButton.y },
      getFloatingScreenBounds()
    );
    sendFloatingPosition(nextPosition);

    if (
      nextPosition.x !== settings.floatingButton.x ||
      nextPosition.y !== settings.floatingButton.y
    ) {
      patchSettings((current) => ({
        ...current,
        floatingButton: {
          ...current.floatingButton,
          x: nextPosition.x,
          y: nextPosition.y
        }
      }));
    }
  }, [
    patchSettings,
    sendFloatingPosition,
    settings.floatingButton.enabled,
    settings.floatingButton.x,
    settings.floatingButton.y
  ]);

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
    const startPosition = clampFloatingPosition(
      { x: settings.floatingButton.x, y: settings.floatingButton.y },
      getFloatingScreenBounds()
    );
    dragRef.current = {
      startPointerX: event.screenX,
      startPointerY: event.screenY,
      startWindowX: startPosition.x,
      startWindowY: startPosition.y,
      lastPosition: startPosition,
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

    const nextPosition = clampFloatingPosition(
      {
        x: drag.startWindowX + deltaX,
        y: drag.startWindowY + deltaY
      },
      getFloatingScreenBounds()
    );
    drag.lastPosition = nextPosition;
    queueFloatingPosition(nextPosition);
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!drag || !drag.moved) {
      return;
    }

    suppressClickRef.current = true;
    commitFloatingPosition({
      x: drag.startWindowX + event.screenX - drag.startPointerX,
      y: drag.startWindowY + event.screenY - drag.startPointerY
    });
  };

  const handlePointerCancel = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || !drag.moved) {
      return;
    }

    suppressClickRef.current = true;
    commitFloatingPosition(drag.lastPosition);
  };

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      void showSettingsWindow().catch(() => undefined);
      return;
    }

    clickTimerRef.current = window.setTimeout(() => {
      clickTimerRef.current = null;
      void run();
    }, 220);
  };

  const handleHideFloating = useCallback(() => {
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
    void setFloatingWindowVisible(false).catch(() => undefined);
  }, [patchSettings]);

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
          onPointerCancel={handlePointerCancel}
        >
          <Type className="size-7" />
        </Button>
        <Button
          aria-label="Скрыть плавающую кнопку"
          className="absolute left-full top-0 z-10 ml-1 size-5 rounded-full border-border/80 bg-background/95 p-0 text-muted-foreground shadow-sm backdrop-blur hover:bg-accent hover:text-foreground"
          size="icon"
          title="Скрыть плавающую кнопку"
          type="button"
          variant="outline"
          onClick={handleHideFloating}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <X className="size-3.5" />
        </Button>
        {resultBadgeValue !== null ? (
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
        ) : null}
      </div>
    </main>
  );
}
