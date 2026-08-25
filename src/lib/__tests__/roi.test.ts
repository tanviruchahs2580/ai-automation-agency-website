import { describe, expect, it } from "vitest";
import { computeRoi } from "@/lib/roi";

const base = {
  employees: 10,
  averageSalary: 52000,
  hoursPerTask: 0.5,
  tasksPerWeek: 40,
  errorCostPerTask: 0,
  currentSoftwareCostAnnual: 0,
  automationRatePercent: 50,
  estimatedAnnualInvestment: 24000,
};

describe("computeRoi", () => {
  it("computes labour cost from hours and salary", () => {
    const r = computeRoi(base);
    // weeklyHours = 10 * 40 * 0.5 = 200; hourly = 52000/2080 = 25
    expect(r.weeklyHours).toBe(200);
    expect(r.hourlyCost).toBeCloseTo(25);
    // annualLabor = 200 * 48 * 25 = 240000
    expect(r.annualLaborCost).toBe(240000);
  });

  it("applies automation rate to automatable cost", () => {
    const r = computeRoi(base);
    // automatable = (240000 + 0) * 0.5 = 120000
    expect(r.automatableCostAnnual).toBe(120000);
  });

  it("includes error and software costs in manual cost", () => {
    const r = computeRoi({
      ...base,
      errorCostPerTask: 1,
      currentSoftwareCostAnnual: 9600,
    });
    // errorAnnual = 400 tasks/wk * 48 * 1 = 19200
    expect(r.annualErrorCost).toBe(19200);
    expect(r.annualManualCost).toBe(240000 + 19200 + 9600);
  });

  it("subtracts investment from savings", () => {
    const r = computeRoi(base);
    expect(r.estimatedAnnualSavings).toBe(120000 - 24000);
    expect(r.estimatedRoiPercent).toBeCloseTo(((120000 - 24000) / 24000) * 100);
  });

  it("computes payback months", () => {
    const r = computeRoi(base);
    // monthly saving = 120000/12 = 10000; payback = 24000/10000 = 2.4
    expect(r.paybackMonths).toBeCloseTo(2.4);
  });

  it("returns null ROI when investment is zero", () => {
    const r = computeRoi({ ...base, estimatedAnnualInvestment: 0 });
    expect(r.estimatedRoiPercent).toBeNull();
    expect(r.paybackMonths).toBeNull();
  });

  it("handles zero/negative inputs safely", () => {
    const r = computeRoi({
      ...base,
      employees: -5,
      averageSalary: NaN,
      tasksPerWeek: undefined as unknown as number,
    });
    expect(r.annualManualCost).toBeGreaterThanOrEqual(0);
  });

  it("clamps automation rate to [0,100]", () => {
    const r = computeRoi({ ...base, automationRatePercent: 150 });
    expect(r.automatableCostAnnual).toBe(240000);
  });
});
