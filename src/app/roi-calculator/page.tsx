import { PageHero } from "@/components/layout/PageHero";
import { CtaSection } from "@/components/layout/CtaSection";
import { ROICalculator } from "@/components/calculators/ROICalculator";
import { JsonLd } from "@/components/ui/Accordion";
import { buildMetadata, softwareJsonLd } from "@/lib/seo";
import { Suspense } from "react";

export const metadata = buildMetadata({
  title: "ROI Calculator",
  description:
    "Estimate the annual cost of manual processes and the potential return from automation — using your numbers, clearly labelled as indicative estimates.",
  path: "/roi-calculator",
});

export default function RoiCalculatorPage() {
  return (
    <>
      <JsonLd
        data={softwareJsonLd({
          name: "VANTIQ ROI Calculator",
          description:
            "Estimate the annual cost of manual processes and the potential return from automation.",
          path: "/roi-calculator",
        })}
      />
      <PageHero
        eyebrow="ROI calculator"
        title="What is manual work actually costing you?"
        lead="Adjust the assumptions on the left; results update instantly. Everything is derived from your inputs — nothing is pulled from thin air or benchmark folklore."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "ROI Calculator", path: "/roi-calculator" },
        ]}
      />

      <section className="section-y">
        <div className="container-x">
          <Suspense
            fallback={
              <div
                className="card-surface flex min-h-72 items-center justify-center p-12"
                aria-hidden="true"
              >
                <span className="signal-loader">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            }
          >
            <ROICalculator />
          </Suspense>

          <details className="mx-auto mt-14 max-w-3xl rounded-lg border border-line bg-surface p-7">
            <summary className="cursor-pointer font-semibold">
              Methodology &amp; assumptions
            </summary>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
              <li>
                Weekly labour hours = employees × tasks/week × hours/task;
                annualised over 48 working weeks at salary ÷ 2,080 hourly cost.
              </li>
              <li>
                Annual manual cost adds error/rework cost (tasks × cost per task)
                plus current software spend.
              </li>
              <li>
                Savings apply your automation-rate assumption to that total, then
                subtract expected solution investment.
              </li>
              <li>
                ROI = savings ÷ investment; payback = months until investment is
                recovered by monthly savings.
              </li>
            </ul>
            <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-faint">
              Disclaimer: this calculator provides an indicative estimate and is
              not a financial guarantee. Real business cases require process-level
              measurement — which is part of every discovery we run.
            </p>
          </details>
        </div>
      </section>

      <CtaSection
        eyebrow="Validate the model"
        title="Pressure-test these numbers with an engineer."
        secondaryLabel="Check My Readiness Too"
        secondaryHref="/ai-readiness"
      />
    </>
  );
}
