import { Icon } from "@/components/ui/Icon";

/**
 * ComplianceStamp — small "reviewed" stamp for SOC 2 / ISO / GDPR readiness
 * callouts. Rotates 2° on hover. Sparing use only; never implies a
 * certification that does not exist (status text is explicit).
 */
export function ComplianceStamp({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <p className="inline-flex items-center gap-2 rounded-lg border border-brass/40 bg-brass/10 px-3 py-2 transition-transform duration-200 hover:rotate-2">
      <Icon name="stamp" size={16} className="text-brass" />
      <span className="text-sm font-medium">{label}</span>
      <span className="mono-label uppercase text-brass">{status}</span>
    </p>
  );
}
