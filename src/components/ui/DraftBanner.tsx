/**
 * DraftBanner — prominent warn banner for legal pages whose content still
 * requires counsel review (§13). Stays until launch-checklist task 7
 * (legal review) is signed off, then the page is deleted with it.
 */
export function DraftBanner({ document }: { document: string }) {
  return (
    <div
      role="note"
      aria-label="Draft document warning"
      className="rounded-lg border border-warn/40 bg-warn/10 p-5 text-sm leading-relaxed text-warn"
    >
      <p className="mono-label uppercase">Draft — legal review required</p>
      <p className="mt-2">
        This {document} is structural placeholder content. It must be drafted
        or approved by qualified legal counsel before this site handles real
        submissions publicly. Do not treat it as legal advice.
      </p>
    </div>
  );
}
