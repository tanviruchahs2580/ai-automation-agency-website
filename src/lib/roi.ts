/**
 * ROI model — pure functions, unit-tested.
 *
 * All outputs are indicative estimates based entirely on user-supplied
 * assumptions. The UI must always label results as "Estimated".
 */

export interface RoiInputs {
  /** Employees performing the process. */
  employees: number;
  /** Average fully-loaded annual salary per employee (USD). */
  averageSalary: number;
  /** Average hours to complete one task manually. */
  hoursPerTask: number;
  /** Tasks each employee handles per week. */
  tasksPerWeek: number;
  /** Rework / error cost per task (USD). Set 0 if not applicable. */
  errorCostPerTask: number;
  /** Annual cost of current software supporting this process (USD). */
  currentSoftwareCostAnnual: number;
  /** Share of the workload that could realistically be automated (0–100). */
  automationRatePercent: number;
  /** Expected annual solution investment (USD) used for ROI and payback. */
  estimatedAnnualInvestment: number;
}

export interface RoiResults {
  hourlyCost: number;
  weeklyTasks: number;
  weeklyHours: number;
  annualLaborCost: number;
  annualErrorCost: number;
  annualManualCost: number;
  automatableCostAnnual: number;
  estimatedAnnualSavings: number;
  estimatedRoiPercent: number | null;
  paybackMonths: number | null;
}

const WEEKS_PER_YEAR = 48;
const HOURS_PER_YEAR = 2080;

function safeNumber(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function computeRoi(inputs: RoiInputs): RoiResults {
  const employees = safeNumber(inputs.employees);
  const averageSalary = safeNumber(inputs.averageSalary);
  const hoursPerTask = Math.max(0, inputs.hoursPerTask || 0);
  const tasksPerWeek = Math.max(0, inputs.tasksPerWeek || 0);
  const errorCostPerTask = Math.max(0, inputs.errorCostPerTask || 0);
  const softwareCost = Math.max(0, inputs.currentSoftwareCostAnnual || 0);
  const rate = Math.min(
    100,
    Math.max(0, inputs.automationRatePercent || 0),
  ) / 100;
  const investment = Math.max(0, inputs.estimatedAnnualInvestment || 0);

  const hourlyCost = averageSalary / HOURS_PER_YEAR;
  const weeklyTasks = employees * tasksPerWeek;
  const weeklyHours = weeklyTasks * hoursPerTask;

  const annualLaborCost = weeklyHours * WEEKS_PER_YEAR * hourlyCost;
  const annualErrorCost = weeklyTasks * WEEKS_PER_YEAR * errorCostPerTask;
  const annualManualCost = annualLaborCost + annualErrorCost + softwareCost;

  const automatableCostAnnual =
    (annualLaborCost + annualErrorCost) * rate +
    softwareCost * rate;

  const estimatedAnnualSavings = automatableCostAnnual - investment;

  const estimatedRoiPercent =
    investment > 0
      ? ((automatableCostAnnual - investment) / investment) * 100
      : null;

  const paybackMonths =
    investment > 0 && automatableCostAnnual > 0
      ? (investment / automatableCostAnnual) * 12
      : null;

  return {
    hourlyCost,
    weeklyTasks,
    weeklyHours,
    annualLaborCost,
    annualErrorCost,
    annualManualCost,
    automatableCostAnnual,
    estimatedAnnualSavings,
    estimatedRoiPercent,
    paybackMonths,
  };
}
