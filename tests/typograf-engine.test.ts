import { describe, expect, it } from "vitest";
import { cloneDefaultSettings } from "@/lib/settings";
import { typographText } from "@/lib/typograf-engine";

function run(input: string) {
  return typographText(input, cloneDefaultSettings()).output;
}

describe("typograf rules", () => {
  it("ставит русские кавычки и тире", () => {
    const output = run('"Привет" -- сказал редактор');

    expect(output).toContain("«Привет»");
    expect(output).toContain("—");
  });

  it("нормализует пробелы и NBSP для инициалов", () => {
    const output = run("А. С. Пушкин написал текст");

    expect(output).toContain("А.\u00a0С.\u00a0Пушкин");
  });

  it("обрабатывает даты и годы", () => {
    const output = run("12 мая 2026 г.");

    expect(output).toContain("12\u00a0мая");
    expect(output).toContain("2026\u00a0г.");
  });

  it("обрабатывает числа и проценты", () => {
    const output = run("Скидка 5 % и 10 - 12 кг.");

    expect(output).toContain("5%");
    expect(output).toContain("12\u00a0кг.");
  });

  it("обрабатывает валюту", () => {
    const output = run("Цена 1500 руб.");

    expect(output).toContain("1500\u00a0₽");
  });

  it("форматирует телефоны", () => {
    const output = run("тел. +7 999 1234567");

    expect(output).toContain("+7\u00a0999\u00a0123-45-67");
  });

  it("заменяет типовые символы", () => {
    const output = run("(c), (tm), (r), ->");

    expect(output).toContain("©");
    expect(output).toContain("™");
    expect(output).toContain("®");
    expect(output).toContain("→");
  });

  it("делает только безопасную ёфикацию", () => {
    const output = run("Артем Семенов и все остальные");

    expect(output).toContain("Артём");
    expect(output).toContain("Семёнов");
    expect(output).toContain("все остальные");
  });

  it("умеет отдавать HTML NBSP", () => {
    const settings = cloneDefaultSettings();
    settings.nbspMode = "html";

    const output = typographText("А. С. Пушкин", settings).output;

    expect(output).toContain("А.&nbsp;С.&nbsp;Пушкин");
  });
});
