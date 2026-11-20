import { afterEach, expect, it, vi } from "vitest";
import { faq, localAssistant } from "./assistant";

afterEach(() => vi.unstubAllGlobals());

it("matches an unfamiliar phrase to approved guidance using an available browser model", async () => {
  const destroy = vi.fn();
  vi.stubGlobal("LanguageModel", {
    availability: async () => "available",
    create: async () => ({ prompt: async () => "0", destroy }),
  });
  const reply = await localAssistant.ask({ question: "Could you give me the elevator pitch?", path: "/" });
  expect(reply).toEqual({ answer: faq[0].answer, source: "on-device-ai" });
  expect(destroy).toHaveBeenCalledOnce();
});

it("keeps the guide usable when a model needs a download", async () => {
  const create = vi.fn();
  vi.stubGlobal("LanguageModel", { availability: async () => "downloadable", create });
  expect((await localAssistant.ask({ question: "Something unfamiliar", path: "/" })).source).toBe("local-faq");
  expect(create).not.toHaveBeenCalled();
});
