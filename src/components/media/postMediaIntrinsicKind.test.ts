import { describe, expect, it } from "vitest";
import { classifyPostMediaIntrinsic } from "./postMediaIntrinsicKind";

describe("classifyPostMediaIntrinsic", () => {
  it("4:5 → moldura feed_4_5", () => {
    expect(classifyPostMediaIntrinsic(1080, 1350)).toBe("feed_4_5");
  });

  it("3:4 → moldura phone_3_4 (distinta de 4:5)", () => {
    expect(classifyPostMediaIntrinsic(1080, 1440)).toBe("phone_3_4");
  });

  it("1:1 → moldura square", () => {
    expect(classifyPostMediaIntrinsic(1080, 1080)).toBe("square");
  });

  it("9:16 cai no vertical mais próximo (phone_3_4) com corte seguro", () => {
    expect(classifyPostMediaIntrinsic(1080, 1920)).toBe("phone_3_4");
  });

  it("paisagem → landscape", () => {
    expect(classifyPostMediaIntrinsic(1600, 900)).toBe("landscape");
  });

  it("vertical fora de tolerância usa fallback seguro 4:5", () => {
    expect(classifyPostMediaIntrinsic(1000, 1500)).toBe("feed_4_5");
  });

  it("dimensões inválidas assumem 4:5 até carregar", () => {
    expect(classifyPostMediaIntrinsic(0, 0)).toBe("feed_4_5");
  });
});
