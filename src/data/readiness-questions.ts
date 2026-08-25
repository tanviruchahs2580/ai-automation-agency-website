import type { ReadinessCategoryKey } from "@/lib/readiness";

export interface ReadinessQuestion {
  id: string;
  category: ReadinessCategoryKey;
  question: string;
  help: string;
}

/**
 * Indicative self-assessment. Scores are estimates based on self-reported
 * answers, not an audited methodology.
 */

export const readinessQuestions: ReadinessQuestion[] = [
  {
    id: "q1:process",
    category: "process",
    question: "Are your core processes documented and repeatable?",
    help: "Automation amplifies whatever structure already exists — including chaos.",
  },
  {
    id: "q2:process",
    category: "process",
    question: "Can you measure volume, time and error rates for key workflows?",
    help: "Baselines make automation benefits provable rather than anecdotal.",
  },
  {
    id: "q3:data",
    category: "data",
    question: "Is your operational data accessible via APIs or databases?",
    help: "Data locked in PDFs and tribal knowledge limits what AI can reliably use.",
  },
  {
    id: "q4:data",
    category: "data",
    question: "Do you know where sensitive data lives and who may access it?",
    help: "Classification is prerequisite to any AI touching regulated content.",
  },
  {
    id: "q5:infrastructure",
    category: "infrastructure",
    question: "Do you have cloud or server infrastructure your team controls?",
    help: "Somewhere to run workloads, integrate systems and manage secrets.",
  },
  {
    id: "q6:infrastructure",
    category: "infrastructure",
    question: "Is there basic engineering practice: version control, staging, backups?",
    help: "Production AI inherits the discipline of the platform beneath it.",
  },
  {
    id: "q7:opportunity",
    category: "opportunity",
    question: "Can you name processes consuming significant staff hours weekly?",
    help: "Concrete targets beat vague ambitions every time.",
  },
  {
    id: "q8:opportunity",
    category: "opportunity",
    question: "Is there executive sponsorship for AI investment this year?",
    help: "Sustained programs need funded ownership, not enthusiasm alone.",
  },
  {
    id: "q9:governance",
    category: "governance",
    question: "Are there defined rules for what AI may and may not do?",
    help: "Written boundaries enable fast delivery without repeated escalations.",
  },
  {
    id: "q10:governance",
    category: "governance",
    question: "Would you be able to explain an AI-made decision to a client or auditor?",
    help: "If not today, logging and approval design must come before autonomy.",
  },
];
