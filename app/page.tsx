"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  Eye,
  Info,
  Keyboard,
  ListChecks,
  MousePointer2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Type,
  type LucideIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  onTauriEvent,
  registerShortcut,
  setFloatingWindowVisible
} from "@/lib/desktop";
import {
  cloneDefaultSettings,
  MAX_CUSTOM_REPLACEMENT_LENGTH,
  MAX_CUSTOM_REPLACEMENTS,
  RULE_CATEGORIES,
  type CustomReplacementRule,
  type RuleCategoryId,
  type TypografProfile
} from "@/lib/settings";
import { typographText } from "@/lib/typograf-engine";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";

const SAMPLE_TEXT =
  'ООО "Ромашка" -- 12 мая 2026 г., тел. +7 999 123-45-67, цена 1500 руб. Все еще тестируем.';

const DONATION_URLS = {
  boosty: "https://boosty.to/evgenbond/donate",
  donationAlerts: "https://www.donationalerts.com/r/evgenbond"
} as const;

const PROFILE_LABELS: Record<TypografProfile, string> = {
  default: "Стандартный",
  strict: "Строгий",
  minimal: "Минимальный"
};

const PROFILE_DESCRIPTIONS: Record<TypografProfile, string> = {
  default:
    "Повседневная типографика: почти все правила включены, HTML-правила и оптическое выравнивание отключены.",
  strict:
    "Более издательский режим: включает больше правил, в том числе оптическое выравнивание.",
  minimal:
    "Самый осторожный режим: меньше вмешивается в телефоны, числа и специфические русские правила."
};

type SettingsSectionId =
  | "system"
  | "languages"
  | "rules"
  | "button"
  | "results"
  | "preview"
  | "about";

type SettingsSection = {
  id: SettingsSectionId;
  title: string;
  description: string;
  icon: LucideIcon;
};

const SECTIONS: SettingsSection[] = [
  {
    id: "system",
    title: "Настройки",
    description: "Статус, хоткей, звуки и тема.",
    icon: SlidersHorizontal
  },
  {
    id: "languages",
    title: "Профили",
    description: "Строгость правил и формат пробелов.",
    icon: ListChecks
  },
  {
    id: "rules",
    title: "Правила",
    description: "Категории Typograf.",
    icon: BookOpen
  },
  {
    id: "button",
    title: "Кнопка",
    description: "Floating-кнопка и прозрачность.",
    icon: MousePointer2
  },
  {
    id: "results",
    title: "Результаты",
    description: "Последний статус без текста выделения.",
    icon: CheckCircle2
  },
  {
    id: "preview",
    title: "Проверка",
    description: "Локальный предпросмотр правил.",
    icon: Eye
  },
  {
    id: "about",
    title: "О приложении",
    description: "Приватность и ограничения MVP.",
    icon: Info
  }
];

export default function SettingsPage() {
  const { settings, patchSettings, lastResult } = useSettings();
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("system");
  const [hotkeyDraft, setHotkeyDraft] = useState<string | null>(null);
  const [previewInput, setPreviewInput] = useState(SAMPLE_TEXT);

  const activeSectionMeta = SECTIONS.find((section) => section.id === activeSection) ?? SECTIONS[0];
  const hotkeyValue = hotkeyDraft ?? settings.hotkey;
  const preview = useMemo(
    () => typographText(previewInput, settings),
    [previewInput, settings]
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    if (settings.theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [settings.theme]);

  useEffect(() => {
    void registerShortcut(settings.hotkey);
  }, [settings.hotkey]);

  useEffect(() => {
    void setFloatingWindowVisible(settings.floatingButton.enabled);
  }, [settings.floatingButton.enabled]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    void onTauriEvent("typograf-toggle-pause", () => {
      patchSettings((current) => ({ ...current, paused: !current.paused }));
    }).then((unlisten) => {
      cleanup = unlisten;
    });

    return () => cleanup?.();
  }, [patchSettings]);

  const updateCategory = (id: RuleCategoryId, value: boolean) => {
    patchSettings((current) => ({
      ...current,
      enabledCategories: {
        ...current.enabledCategories,
        [id]: value
      }
    }));
  };

  const resetSettings = () => {
    patchSettings(() => cloneDefaultSettings());
  };

  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-full">
        <aside className="flex w-[280px] shrink-0 flex-col border-r bg-muted/30">
          <div className="flex h-20 items-center border-b px-5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Type className="size-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight">Типограф</h1>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <Button
                  key={section.id}
                  className={cn(
                    "h-auto w-full justify-start rounded-xl px-3 py-2.5 text-left",
                    isActive
                      ? "border border-border bg-background text-foreground shadow-sm hover:bg-background"
                      : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  )}
                  variant="ghost"
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon className="mt-0.5 size-4 shrink-0 self-start" />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">{section.title}</span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {section.description}
                    </span>
                  </span>
                </Button>
              );
            })}
          </nav>

          <div className="border-t p-3">
            <DonationCard />
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-8">
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold tracking-tight">{activeSectionMeta.title}</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {activeSectionMeta.description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                aria-label={settings.paused ? "Снять с паузы" : "Поставить на паузу"}
                className="size-7"
                size="icon"
                variant="outline"
                onClick={() =>
                  patchSettings((current) => ({ ...current, paused: !current.paused }))
                }
              >
                {settings.paused ? <Play className="size-4" /> : <Pause className="size-4" />}
              </Button>
              <StatusIndicator paused={settings.paused} />
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-8 py-6">
              {activeSection === "system" ? (
                <SystemSection
                  hotkeyDraft={hotkeyValue}
                  resetSettings={resetSettings}
                  setHotkeyDraft={setHotkeyDraft}
                  settings={settings}
                  patchSettings={patchSettings}
                />
              ) : null}
              {activeSection === "languages" ? (
                <LanguagesSection settings={settings} patchSettings={patchSettings} />
              ) : null}
              {activeSection === "rules" ? (
                <RulesSection
                  settings={settings}
                  patchSettings={patchSettings}
                  updateCategory={updateCategory}
                />
              ) : null}
              {activeSection === "button" ? (
                <ButtonSection settings={settings} patchSettings={patchSettings} />
              ) : null}
              {activeSection === "results" ? (
                <ResultsSection
                  lastResult={lastResult}
                  settings={settings}
                  patchSettings={patchSettings}
                />
              ) : null}
              {activeSection === "preview" ? (
                <PreviewSection
                  preview={preview}
                  previewInput={previewInput}
                  setPreviewInput={setPreviewInput}
                />
              ) : null}
              {activeSection === "about" ? <AboutSection /> : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type SettingsPatch = ReturnType<typeof useSettings>["patchSettings"];
type SettingsValue = ReturnType<typeof useSettings>["settings"];
type LastResultValue = ReturnType<typeof useSettings>["lastResult"];

function PreferencePanel({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="gap-0 rounded-2xl py-0 shadow-sm">
      <CardHeader className="gap-1 px-5 pb-1 pt-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="px-5 pb-4 pt-3">{children}</CardContent>
    </Card>
  );
}

function StatusIndicator({ paused }: { paused: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium",
        paused
          ? "border-border bg-muted text-muted-foreground"
          : "border-primary/20 bg-primary/10 text-primary"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          paused ? "bg-muted-foreground" : "bg-primary"
        )}
      />
      {paused ? "Пауза" : "Активен"}
    </span>
  );
}

async function openDonationUrl(url: (typeof DONATION_URLS)[keyof typeof DONATION_URLS]) {
  try {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function DonationCard() {
  return (
    <div className="px-1">
      <p className="truncate text-sm font-medium">Поддержать разработчика</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <DonationLink
          href={DONATION_URLS.boosty}
          imageClassName="max-h-5 max-w-[84px]"
          logo="/brands/boosty.svg"
          name="Boosty"
        />
        <DonationLink
          href={DONATION_URLS.donationAlerts}
          imageClassName="max-h-4 max-w-[92px]"
          logo="/brands/donationalerts.svg"
          name="DonationAlerts"
        />
      </div>
    </div>
  );
}

function DonationLink({
  href,
  imageClassName,
  logo,
  name
}: {
  href: (typeof DONATION_URLS)[keyof typeof DONATION_URLS];
  imageClassName: string;
  logo: string;
  name: string;
}) {
  return (
    <button
      aria-label={`Открыть ${name}`}
      className="flex h-8 items-center justify-center rounded-lg border bg-background px-2 transition-colors hover:bg-muted"
      type="button"
      onClick={() => void openDonationUrl(href)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={name} className={imageClassName} src={logo} />
    </button>
  );
}

function SystemSection({
  hotkeyDraft,
  resetSettings,
  setHotkeyDraft,
  settings,
  patchSettings
}: {
  hotkeyDraft: string;
  resetSettings: () => void;
  setHotkeyDraft: (value: string | null) => void;
  settings: SettingsValue;
  patchSettings: SettingsPatch;
}) {
  return (
    <>
      <PreferencePanel
        title="Основное"
        description="Главные параметры запуска и текущий режим работы."
      >
        <FieldGroup>
          <Field orientation="horizontal">
            <Switch
              checked={!settings.paused}
              onCheckedChange={(active) =>
                patchSettings((current) => ({ ...current, paused: !active }))
              }
            />
            <FieldContent>
              <FieldTitle>Типограф активен</FieldTitle>
              <FieldDescription>
                Когда включена пауза, floating-кнопка и хоткей не меняют текст.
              </FieldDescription>
            </FieldContent>
            <StatusIndicator paused={settings.paused} />
          </Field>

          <Field>
            <FieldLabel>
              <Keyboard className="size-4" />
              Хоткей
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                className="max-w-sm"
                value={hotkeyDraft}
                onBlur={() => {
                  patchSettings((current) => ({
                    ...current,
                    hotkey: hotkeyDraft.trim() || current.hotkey
                  }));
                  setHotkeyDraft(null);
                }}
                onChange={(event) => setHotkeyDraft(event.target.value)}
              />
              <Button
                variant="outline"
                onClick={() =>
                  patchSettings((current) => ({
                    ...current,
                    hotkey: "CommandOrControl+Shift+T"
                  }))
                }
              >
                <RotateCcw className="size-4" />
                Сброс
              </Button>
            </div>
            <FieldDescription>
              Сейчас: <Kbd>{settings.hotkey}</Kbd>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </PreferencePanel>

      <PreferencePanel title="Звуки" description="Локальные короткие сигналы результата.">
        <FieldGroup>
          <Field orientation="horizontal">
            <Switch
              checked={settings.sounds.enabled}
              onCheckedChange={(enabled) =>
                patchSettings((current) => ({
                  ...current,
                  sounds: { ...current.sounds, enabled }
                }))
              }
            />
            <FieldContent>
              <FieldTitle>Использовать звуки</FieldTitle>
              <FieldDescription>
                Сигналы не требуют сети и не содержат пользовательский текст.
              </FieldDescription>
            </FieldContent>
          </Field>
          <Field>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel>
                <Bell className="size-4" />
                Громкость
              </FieldLabel>
              <span className="text-sm text-muted-foreground">{settings.sounds.volume}</span>
            </div>
            <Slider
              max={10}
              min={0}
              step={1}
              value={[settings.sounds.volume]}
              onValueChange={([volume]) =>
                patchSettings((current) => ({
                  ...current,
                  sounds: { ...current.sounds, volume: volume ?? 0 }
                }))
              }
            />
          </Field>
        </FieldGroup>
      </PreferencePanel>

      <PreferencePanel title="Оформление" description="Тема окна настроек и кнопки.">
        <FieldGroup>
          <Field>
            <FieldLabel>Тема приложения</FieldLabel>
            <Select
              value={settings.theme}
              onValueChange={(theme: "system" | "light" | "dark") =>
                patchSettings((current) => ({ ...current, theme }))
              }
            >
              <SelectTrigger className="max-w-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Системная</SelectItem>
                <SelectItem value="light">Светлая</SelectItem>
                <SelectItem value="dark">Темная</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Separator />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={resetSettings}>
              <RotateCcw className="size-4" />
              Сбросить настройки
            </Button>
          </div>
        </FieldGroup>
      </PreferencePanel>
    </>
  );
}

function LanguagesSection({
  settings,
  patchSettings
}: {
  settings: SettingsValue;
  patchSettings: SettingsPatch;
}) {
  return (
    <PreferencePanel
      title="Профиль типографики"
      description="Профиль определяет строгость правил, а NBSP — формат неразрывных пробелов."
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Профиль</FieldLabel>
          <Select
            value={settings.profile}
            onValueChange={(profile: TypografProfile) =>
              patchSettings((current) => ({ ...current, profile }))
            }
          >
            <SelectTrigger className="max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROFILE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>{PROFILE_DESCRIPTIONS[settings.profile]}</FieldDescription>
        </Field>

        <Field>
          <FieldLabel>NBSP</FieldLabel>
          <Select
            value={settings.nbspMode}
            onValueChange={(nbspMode: "unicode" | "html") =>
              patchSettings((current) => ({ ...current, nbspMode }))
            }
          >
            <SelectTrigger className="max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unicode">Unicode NBSP</SelectItem>
              <SelectItem value="html">HTML entities</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field orientation="horizontal">
          <Switch
            checked={settings.yoMode === "safe" && settings.enabledCategories.yo}
            onCheckedChange={(checked) =>
              patchSettings((current) => ({
                ...current,
                yoMode: checked ? "safe" : "off",
                enabledCategories: {
                  ...current.enabledCategories,
                  yo: checked
                }
              }))
            }
          />
          <FieldContent>
            <FieldTitle>Безопасная ёфикация</FieldTitle>
            <FieldDescription>Только уверенные замены через eyo-kernel.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
    </PreferencePanel>
  );
}

function RulesSection({
  patchSettings,
  settings,
  updateCategory
}: {
  patchSettings: SettingsPatch;
  settings: SettingsValue;
  updateCategory: (id: RuleCategoryId, value: boolean) => void;
}) {
  const [replacementDrafts, setReplacementDrafts] = useState<
    Record<string, Pick<CustomReplacementRule, "from" | "to">>
  >({});
  const [newReplacement, setNewReplacement] = useState({ from: "", to: "" });

  const updateReplacementDraft = (
    id: string,
    patch: Partial<Pick<CustomReplacementRule, "from" | "to">>
  ) => {
    setReplacementDrafts((current) => {
      const rule = settings.customReplacements.find((item) => item.id === id);
      const previous = current[id] ?? {
        from: rule?.from ?? "",
        to: rule?.to ?? ""
      };

      return {
        ...current,
        [id]: {
          ...previous,
          ...patch
        }
      };
    });
  };

  const commitReplacementDraft = (rule: CustomReplacementRule) => {
    const draft = replacementDrafts[rule.id];
    if (!draft) {
      return;
    }

    const from = draft.from.trim();
    const to = draft.to.trim();

    setReplacementDrafts((current) => {
      const next = { ...current };
      delete next[rule.id];
      return next;
    });

    patchSettings((current) => ({
      ...current,
      customReplacements: from
        ? current.customReplacements.map((item) =>
            item.id === rule.id ? { ...item, from, to } : item
          )
        : current.customReplacements.filter((item) => item.id !== rule.id)
    }));
  };

  const updateCustomReplacement = (id: string, patch: Partial<CustomReplacementRule>) => {
    patchSettings((current) => ({
      ...current,
      customReplacements: current.customReplacements.map((rule) =>
        rule.id === id ? { ...rule, ...patch } : rule
      )
    }));
  };

  const removeCustomReplacement = (id: string) => {
    setReplacementDrafts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    patchSettings((current) => ({
      ...current,
      customReplacements: current.customReplacements.filter((rule) => rule.id !== id)
    }));
  };

  const addCustomReplacement = () => {
    const from = newReplacement.from.trim();
    const to = newReplacement.to.trim();

    if (!from || settings.customReplacements.length >= MAX_CUSTOM_REPLACEMENTS) {
      return;
    }

    patchSettings((current) => ({
      ...current,
      customReplacements: [
        ...current.customReplacements,
        {
          id: createCustomReplacementId(),
          from,
          to,
          enabled: true
        }
      ]
    }));
    setNewReplacement({ from: "", to: "" });
  };

  return (
    <>
      <PreferencePanel
        title="Категории правил"
        description="Отключение категории добавляет связанные правила Typograf в disable-list."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {RULE_CATEGORIES.map((category) => (
            <label
              key={category.id}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
                settings.enabledCategories[category.id] ? "bg-background" : "bg-muted/60"
              )}
            >
              <Checkbox
                checked={settings.enabledCategories[category.id]}
                onCheckedChange={(checked) => updateCategory(category.id, checked === true)}
              />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-medium">{category.title}</span>
                <span className="text-xs leading-5 text-muted-foreground">
                  {category.description}
                </span>
              </span>
            </label>
          ))}
          <label
            className={cn(
              "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
              settings.builtInReplacements.emailToElectronicMail
                ? "bg-background"
                : "bg-muted/60"
            )}
          >
            <Checkbox
              checked={settings.builtInReplacements.emailToElectronicMail}
              onCheckedChange={(checked) =>
                patchSettings((current) => ({
                  ...current,
                  builtInReplacements: {
                    ...current.builtInReplacements,
                    emailToElectronicMail: checked === true
                  }
                }))
              }
            />
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-sm font-medium">E-mail → электронная почта</span>
              <span className="text-xs leading-5 text-muted-foreground">
                Не трогает настоящие адреса.
              </span>
            </span>
          </label>
        </div>
      </PreferencePanel>

      <PreferencePanel
        title="Свои правила"
        description="Правила применяются как обычный текст, без регулярных выражений."
      >
        <FieldGroup className="gap-3">
          {settings.customReplacements.map((rule) => {
            const draft = replacementDrafts[rule.id];
            const from = draft?.from ?? rule.from;
            const to = draft?.to ?? rule.to;

            return (
              <Field key={rule.id} className="rounded-xl border p-3">
                <div className="flex items-start gap-3">
                  <Switch
                    aria-label="Включить правило"
                    checked={rule.enabled}
                    onCheckedChange={(enabled) =>
                      updateCustomReplacement(rule.id, { enabled })
                    }
                  />
                  <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-2">
                    <Input
                      aria-label="Что меняем"
                      maxLength={MAX_CUSTOM_REPLACEMENT_LENGTH}
                      placeholder="Что меняем"
                      value={from}
                      onBlur={() => commitReplacementDraft(rule)}
                      onChange={(event) =>
                        updateReplacementDraft(rule.id, { from: event.target.value })
                      }
                    />
                    <Input
                      aria-label="На что меняем"
                      maxLength={MAX_CUSTOM_REPLACEMENT_LENGTH}
                      placeholder="На что меняем"
                      value={to}
                      onBlur={() => commitReplacementDraft(rule)}
                      onChange={(event) =>
                        updateReplacementDraft(rule.id, { to: event.target.value })
                      }
                    />
                  </div>
                  <Button
                    aria-label="Удалить правило"
                    className="shrink-0"
                    size="icon"
                    type="button"
                    variant="outline"
                    onClick={() => removeCustomReplacement(rule.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </Field>
            );
          })}

          <Field className="rounded-xl border border-dashed p-3">
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <Input
                maxLength={MAX_CUSTOM_REPLACEMENT_LENGTH}
                placeholder="Что меняем"
                value={newReplacement.from}
                onChange={(event) =>
                  setNewReplacement((current) => ({
                    ...current,
                    from: event.target.value
                  }))
                }
              />
              <Input
                maxLength={MAX_CUSTOM_REPLACEMENT_LENGTH}
                placeholder="На что меняем"
                value={newReplacement.to}
                onChange={(event) =>
                  setNewReplacement((current) => ({
                    ...current,
                    to: event.target.value
                  }))
                }
              />
              <Button
                type="button"
                variant="outline"
                disabled={
                  !newReplacement.from.trim() ||
                  settings.customReplacements.length >= MAX_CUSTOM_REPLACEMENTS
                }
                onClick={addCustomReplacement}
              >
                <Plus className="size-4" />
                Добавить правило
              </Button>
            </div>
            {settings.customReplacements.length >= MAX_CUSTOM_REPLACEMENTS ? (
              <FieldDescription>
                Достигнут лимит: {MAX_CUSTOM_REPLACEMENTS} правил.
              </FieldDescription>
            ) : null}
          </Field>
        </FieldGroup>
      </PreferencePanel>
    </>
  );
}

function createCustomReplacementId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function ButtonSection({
  settings,
  patchSettings
}: {
  settings: SettingsValue;
  patchSettings: SettingsPatch;
}) {
  return (
    <PreferencePanel
      title="Плавающая кнопка"
      description="Always-on-top окно запускает clipboard-flow и хранит позицию после drag."
    >
      <FieldGroup>
        <Field orientation="horizontal">
          <Switch
            checked={settings.floatingButton.enabled}
            onCheckedChange={(enabled) =>
              patchSettings((current) => ({
                ...current,
                floatingButton: { ...current.floatingButton, enabled }
              }))
            }
          />
          <FieldContent>
            <FieldTitle>Показывать кнопку</FieldTitle>
            <FieldDescription>Вернуть скрытую кнопку можно из tray или здесь.</FieldDescription>
          </FieldContent>
        </Field>

        <Field orientation="horizontal">
          <Switch
            checked={settings.floatingButton.showResultBadge}
            onCheckedChange={(showResultBadge) =>
              patchSettings((current) => ({
                ...current,
                floatingButton: {
                  ...current.floatingButton,
                  showResultBadge
                }
              }))
            }
          />
          <FieldContent>
            <FieldTitle>Верхний индикатор результата</FieldTitle>
            <FieldDescription>
              После обработки кратко показывает количество измененных символов.
            </FieldDescription>
          </FieldContent>
        </Field>

        <Field>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Прозрачность</FieldLabel>
            <span className="text-sm text-muted-foreground">
              {Math.round(settings.floatingButton.opacity * 100)}%
            </span>
          </div>
          <Slider
            max={1}
            min={0.45}
            step={0.05}
            value={[settings.floatingButton.opacity]}
            onValueChange={([opacity]) =>
              patchSettings((current) => ({
                ...current,
                floatingButton: {
                  ...current.floatingButton,
                  opacity: opacity ?? current.floatingButton.opacity
                }
              }))
            }
          />
        </Field>
      </FieldGroup>
    </PreferencePanel>
  );
}

function ResultsSection({
  lastResult,
  settings,
  patchSettings
}: {
  lastResult: LastResultValue;
  settings: SettingsValue;
  patchSettings: SettingsPatch;
}) {
  return (
    <>
      <PreferencePanel title="Последний результат" description="Хранится только статус, без текста.">
        {lastResult ? (
          <div className="grid gap-4 rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{lastResult.message}</span>
              <Badge variant={lastResult.changed ? "default" : "secondary"}>
                {lastResult.changed ? "Изменено" : "Без замен"}
              </Badge>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
              <span>{lastResult.changedCharacters} симв.</span>
              <span>{lastResult.replacements} замен</span>
              <span>{new Date(lastResult.at).toLocaleString("ru-RU")}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Результатов пока нет.</p>
        )}
      </PreferencePanel>

      <PreferencePanel
        title="Хранение статуса"
        description="Можно отключить даже локальное сохранение счетчиков."
      >
        <FieldSet>
          <Field orientation="horizontal">
            <Switch
              checked={settings.privacy.rememberLastResult}
              onCheckedChange={(rememberLastResult) =>
                patchSettings((current) => ({
                  ...current,
                  privacy: { ...current.privacy, rememberLastResult }
                }))
              }
            />
            <FieldContent>
              <FieldTitle>Запоминать последний статус</FieldTitle>
              <FieldDescription>Сохраняются только счетчики и время обработки.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldSet>
      </PreferencePanel>
    </>
  );
}

function PreviewSection({
  preview,
  previewInput,
  setPreviewInput
}: {
  preview: ReturnType<typeof typographText>;
  previewInput: string;
  setPreviewInput: (value: string) => void;
}) {
  return (
    <PreferencePanel
      title="Проверка правил"
      description="Предпросмотр работает локально и не вызывает clipboard-flow."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="preview-input">Исходный текст</Label>
          <Textarea
            className="min-h-52 resize-none"
            id="preview-input"
            value={previewInput}
            onChange={(event) => setPreviewInput(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="preview-output">Результат</Label>
          <Textarea
            readOnly
            className="min-h-52 resize-none bg-muted/40"
            id="preview-output"
            value={preview.output}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant={preview.changed ? "default" : "secondary"}>
          {preview.changed ? "Есть изменения" : "Без изменений"}
        </Badge>
        <span>{preview.stats.changedCharacters} измененных символов</span>
        <span>{preview.stats.replacements} оценочных замен</span>
      </div>
    </PreferencePanel>
  );
}

function AboutSection() {
  return (
    <>
      <PreferencePanel
        title="Приватность"
        description="Типографирование выполняется локально внутри приложения."
      >
        <div className="grid gap-3">
          <InfoRow icon={ShieldCheck} title="Локальная обработка">
            Текст не отправляется во внешние API и не пишется в логи.
          </InfoRow>
          <InfoRow icon={Type} title="Plain text MVP">
            На первом этапе вставляется только обычный текст без RTF/HTML-форматирования.
          </InfoRow>
          <InfoRow icon={Keyboard} title="Windows input">
            В elevated/admin-приложениях системная вставка может блокироваться Windows.
          </InfoRow>
        </div>
      </PreferencePanel>

    </>
  );
}

function InfoRow({
  icon: Icon,
  title,
  children
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border bg-background p-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
