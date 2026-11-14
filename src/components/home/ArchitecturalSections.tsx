import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import styles from "./ArchitecturalSections.module.css";

/**
 * Homepage composition — "Architectural Night" (owner-approved target
 * reference, 706×1536 mobile): architectural hero over the supplied dusk
 * building photograph, five-cell industry strip, six grouped service cards
 * and the Proven Approach banner.
 *
 * Adapted from the supplied starter (kit §05) into the repository's real
 * system: global design tokens instead of a hard-coded palette bridge, the
 * existing Button/SectionHeader primitives, `next/image` for the photographic
 * assets, and theme-aware surfaces below the hero (the hero and banner are
 * photographic dark compositions in both themes; the rest of the page follows
 * the active theme).
 *
 * Feature contracts: this composition replaces homepage teasers only — every
 * removed teaser's content remains available on its dedicated route
 * (docs/redesign/DECISIONS.md). ScrollDepthTracker stays mounted in page.tsx
 * (FC-21). All 7 service records and 12 industries remain reachable via
 * /services, /solutions and /industries; the six cards and five strip cells
 * are visual groupings, not the complete indexes.
 */

type IconName =
  | "finance"
  | "healthcare"
  | "manufacturing"
  | "government"
  | "enterprise"
  | "strategy"
  | "agents"
  | "software"
  | "infrastructure"
  | "operations"
  | "security";

/** First-party 24-grid line icons in the reference's orange line style. */
function LineIcon({ name }: { name: IconName }) {
  const common = {
    className: styles.icon,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "finance":
    case "strategy":
      return (
        <svg {...common}>
          <path d="M3 19h18" />
          <path d="M5 16l5-5 3 2 6-7" />
          <path d="M15 6h4v4" />
        </svg>
      );
    case "healthcare":
      return (
        <svg {...common}>
          <path d="M12 20s-7.5-4.5-8.5-9.2C2.6 6.2 8 3.8 12 8c4-4.2 9.4-1.8 8.5 2.8C19.5 15.5 12 20 12 20Z" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      );
    case "manufacturing":
      return (
        <svg {...common}>
          <path d="M3 21V9l6 3V8l6 4V5l6 3v13Z" />
          <path d="M7 16h2m3 0h2m3 0h2M7 21v-3h3v3" />
        </svg>
      );
    case "government":
      return (
        <svg {...common}>
          <path d="m3 9 9-5 9 5" />
          <path d="M4 10h16M5 10v9m4-9v9m6-9v9m4-9v9M3 21h18" />
        </svg>
      );
    case "enterprise":
      return (
        <svg {...common}>
          <path d="M4 21V5h10v16M14 10h6v11M7 8h2m2 0h1M7 12h2m2 0h1M7 16h2m2 0h1m4-2h2m-2 4h2" />
          <path d="M2 21h20" />
        </svg>
      );
    case "agents":
      return (
        <svg {...common}>
          <rect x="5" y="7" width="14" height="12" rx="3" />
          <path d="M12 4v3M9 12h.01M15 12h.01M9 16h6M3 11v4m18-4v4" />
        </svg>
      );
    case "software":
      return (
        <svg {...common}>
          <path d="m8 5-6 7 6 7M16 5l6 7-6 7" />
        </svg>
      );
    case "infrastructure":
      return (
        <svg {...common}>
          <path d="M7 18.5a4.5 4.5 0 0 1-.5-9A6.2 6.2 0 0 1 18 8a4.9 4.9 0 0 1-.5 10.5H7Z" />
          <path d="M12 20V12m-3 3 3-3 3 3" />
        </svg>
      );
    case "operations":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="3" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );
    case "security":
      return (
        <svg {...common}>
          <path d="M12 3 20 6v5.5c0 4.7-3.2 7.7-8 9.5-4.8-1.8-8-4.8-8-9.5V6l8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
  }
}

/* All destinations verified against src/app routes (docs/redesign/
   ROUTE-AND-FEATURE-INVENTORY.md). Enterprise intentionally leads to the
   industry index — no invented sector route. */
const industryItems: Array<{ label: string; href: string; icon: IconName }> = [
  { label: "Finance", href: "/industries/financial-services", icon: "finance" },
  { label: "Healthcare", href: "/industries/healthcare", icon: "healthcare" },
  { label: "Manufacturing", href: "/industries/manufacturing", icon: "manufacturing" },
  { label: "Government", href: "/industries/government", icon: "government" },
  { label: "Enterprise", href: "/industries", icon: "enterprise" },
];

/* Six visual groupings per the reference. The seven canonical service detail
   records remain complete on /services — these cards link to real routes;
   Automation Engineering stays reachable from the services index (spec §6.5). */
const serviceItems: Array<{
  title: string;
  href: string;
  icon: IconName;
  description: string;
}> = [
  {
    title: "AI Strategy & Consulting",
    href: "/services/ai-strategy",
    icon: "strategy",
    description: "Prioritise the right opportunities and architecture.",
  },
  {
    title: "AI Agents & Automation",
    href: "/solutions/ai-agents",
    icon: "agents",
    description: "Connect governed agents to the work and tools they need.",
  },
  {
    title: "AI Software Development",
    href: "/services/software-engineering",
    icon: "software",
    description: "Build reliable platforms, copilots and products.",
  },
  {
    title: "AI Infrastructure & Cloud",
    href: "/services/data-ai-infrastructure",
    icon: "infrastructure",
    description: "Engineer the data, inference and runtime foundation.",
  },
  {
    title: "AI Operations & Monitoring",
    href: "/services/ai-operations",
    icon: "operations",
    description: "Monitor, evaluate and improve deployed systems.",
  },
  {
    title: "Security & Governance",
    href: "/services/security",
    icon: "security",
    description: "Put identity, policy and human approval in the system.",
  },
];

export function ArchitecturalSections() {
  return (
    <div className={styles.root}>
      <ArchitecturalHero />
      <IndustryStrip />
      <section className={styles.servicesSection} aria-labelledby="ark-services-heading">
        <div className={styles.container}>
          <SectionHeader
            eyebrow="Our end-to-end services"
            title="AI Engineering Services"
            lead="Strategy, development and operations — all in one place."
            id="ark-services-heading"
          />
          <ServiceGrid />
          <ProvenApproach />
        </div>
      </section>
    </div>
  );
}

function ArchitecturalHero() {
  return (
    <section className={styles.hero} aria-labelledby="ark-home-heading">
      <Image
        src="/images/arkyon-hero-architecture.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.heroImage}
      />
      <div className={styles.heroOverlay} aria-hidden="true" />
      <div className={`${styles.container} ${styles.heroContent}`}>
        <p className={styles.eyebrow}>
          AI Engineering &amp; Automation
          <span className={styles.eyebrowRule} aria-hidden="true" />
        </p>
        <h1 id="ark-home-heading" className={styles.heroTitle}>
          Build the AI systems your business{" "}
          <span>actually needs.</span>
        </h1>
        <p className={styles.heroLead}>
          From strategy to operations, we engineer intelligent systems that
          deliver measurable business value.
        </p>
        <div className={styles.heroActions}>
          <Button href="/start-a-project" dataCtaId="home-architectural-primary">
            Start a Project <span aria-hidden="true">→</span>
          </Button>
          <Button
            href="/approach"
            variant="quiet"
            dataCtaId="home-architectural-secondary"
            className={styles.secondaryButton}
          >
            Explore Our Approach <span aria-hidden="true">▷</span>
          </Button>
        </div>
      </div>
    </section>
  );
}

function IndustryStrip() {
  return (
    <nav className={styles.industryWrap} aria-label="Industries">
      <div className={styles.industryStrip}>
        {industryItems.map((item) => (
          <Link key={item.label} href={item.href} className={styles.industryItem}>
            <LineIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function ServiceGrid() {
  return (
    <div className={styles.serviceGrid}>
      {serviceItems.map((item) => (
        <Link key={item.title} href={item.href} className={styles.serviceCard}>
          <LineIcon name={item.icon} />
          <span className={styles.serviceTitle}>{item.title}</span>
          <span className={styles.serviceDescription}>{item.description}</span>
          <span className={styles.serviceArrow} aria-hidden="true">↗</span>
        </Link>
      ))}
    </div>
  );
}

function ProvenApproach() {
  return (
    <section className={styles.approach} aria-labelledby="ark-approach-heading">
      <Image
        src="/images/arkyon-hero-architecture.webp"
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 78rem"
        className={styles.approachImage}
      />
      <div className={styles.approachOverlay} aria-hidden="true" />
      <div className={styles.approachContent}>
        <p className={styles.approachEyebrow}>Proven approach</p>
        <h2 id="ark-approach-heading">From idea to impact with confidence.</h2>
        <p>A structured, transparent and collaborative process.</p>
        <Link href="/approach" className={styles.approachLink}>
          Learn More <span aria-hidden="true">→</span>
        </Link>
      </div>
      <Link
        href="/approach"
        className={styles.approachAction}
        aria-label="Explore the approach in detail"
      >
        <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
