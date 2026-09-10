import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate } from "../lib/finance-utils";

describe("finance store helpers", () => {
  it("formats Brazilian currency consistently", () => {
    expect(formatCurrency(1234.5)).toContain("1.234,50");
    expect(formatCurrency(undefined)).toBe("—");
  });

  it("formats an ISO date for the Brazilian UI", () => {
    expect(formatDate("2026-09-15")).toMatch(/15/);
    expect(formatDate("data-invalida")).toBe("data-invalida");
  });
});
