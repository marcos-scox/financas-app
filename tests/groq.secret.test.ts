import { describe, expect, it } from "vitest";

describe("Groq secret", () => {
  it("accepts the configured credential on the models endpoint", async () => {
    const key = process.env.GROQ_API_KEY;
    expect(key, "GROQ_API_KEY must be configured").toBeTruthy();
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    expect(response.ok).toBe(true);
  }, 30000);
});
