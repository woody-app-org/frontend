import { describe, expect, it } from "vitest";
import {
  classifyMediaFormat,
  classifyMediaFormatFromDimensions,
  getFormatCssAspectRatio,
  getMediaAspectRatio,
  getMediaContainerClass,
  isWoodyFeedFormat,
  isWoodySupportedMediaFormat,
} from "./woodyMediaFormats";

describe("getMediaAspectRatio", () => {
  it("calcula largura ÷ altura", () => {
    expect(getMediaAspectRatio(800, 1000)).toBeCloseTo(0.8);
  });

  it("retorna null para dimensões inválidas", () => {
    expect(getMediaAspectRatio(0, 1000)).toBeNull();
    expect(getMediaAspectRatio(800, 0)).toBeNull();
    expect(getMediaAspectRatio(null, undefined)).toBeNull();
    expect(getMediaAspectRatio(-1, 10)).toBeNull();
  });
});

describe("classifyMediaFormat", () => {
  it("classifica 4:5 (exato e dentro da tolerância)", () => {
    expect(classifyMediaFormat(0.8)).toBe("feed_4_5");
    expect(classifyMediaFormat(0.79)).toBe("feed_4_5");
    expect(classifyMediaFormat(0.82)).toBe("feed_4_5");
  });

  it("classifica 3:4", () => {
    expect(classifyMediaFormat(0.75)).toBe("phone_3_4");
    expect(classifyMediaFormat(0.73)).toBe("phone_3_4");
    expect(classifyMediaFormat(0.77)).toBe("phone_3_4");
  });

  it("classifica 1:1", () => {
    expect(classifyMediaFormat(1.0)).toBe("square_1_1");
    expect(classifyMediaFormat(0.99)).toBe("square_1_1");
    expect(classifyMediaFormat(1.02)).toBe("square_1_1");
  });

  it("classifica 9:16", () => {
    expect(classifyMediaFormat(0.5625)).toBe("story_9_16");
    expect(classifyMediaFormat(0.55)).toBe("story_9_16");
    expect(classifyMediaFormat(0.58)).toBe("story_9_16");
  });

  it("cai em original fora das tolerâncias (paisagem ou proporção desconhecida)", () => {
    expect(classifyMediaFormat(1.5)).toBe("original");
    expect(classifyMediaFormat(0.6)).toBe("original");
    expect(classifyMediaFormat(0)).toBe("original");
    expect(classifyMediaFormat(null)).toBe("original");
  });

  it("classifica a partir de dimensões", () => {
    expect(classifyMediaFormatFromDimensions(1080, 1350)).toBe("feed_4_5");
    expect(classifyMediaFormatFromDimensions(1080, 1440)).toBe("phone_3_4");
    expect(classifyMediaFormatFromDimensions(1080, 1080)).toBe("square_1_1");
    expect(classifyMediaFormatFromDimensions(1080, 1920)).toBe("story_9_16");
  });
});

describe("isWoodySupportedMediaFormat / isWoodyFeedFormat", () => {
  it("reconhece formatos oficiais", () => {
    expect(isWoodySupportedMediaFormat("feed_4_5")).toBe(true);
    expect(isWoodySupportedMediaFormat("story_9_16")).toBe(true);
    expect(isWoodySupportedMediaFormat("original")).toBe(false);
  });

  it("9:16 não é formato de feed; 4:5/3:4/1:1 são", () => {
    expect(isWoodyFeedFormat("feed_4_5")).toBe(true);
    expect(isWoodyFeedFormat("phone_3_4")).toBe(true);
    expect(isWoodyFeedFormat("square_1_1")).toBe(true);
    expect(isWoodyFeedFormat("story_9_16")).toBe(false);
    expect(isWoodyFeedFormat("original")).toBe(false);
  });
});

describe("getMediaContainerClass / getFormatCssAspectRatio", () => {
  it("mapeia formato para classe de moldura", () => {
    expect(getMediaContainerClass("feed_4_5")).toBe("mediaFrame--4x5");
    expect(getMediaContainerClass("phone_3_4")).toBe("mediaFrame--3x4");
    expect(getMediaContainerClass("square_1_1")).toBe("mediaFrame--1x1");
    expect(getMediaContainerClass("story_9_16")).toBe("mediaFrame--9x16");
    expect(getMediaContainerClass("original")).toBe("mediaFrame--4x5");
  });

  it("expõe aspect-ratio CSS", () => {
    expect(getFormatCssAspectRatio("feed_4_5")).toBe("4 / 5");
    expect(getFormatCssAspectRatio("phone_3_4")).toBe("3 / 4");
    expect(getFormatCssAspectRatio("square_1_1")).toBe("1 / 1");
    expect(getFormatCssAspectRatio("story_9_16")).toBe("9 / 16");
    expect(getFormatCssAspectRatio("original")).toBe("4 / 5");
  });
});
