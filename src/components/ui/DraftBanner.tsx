/**
 * DraftBanner — warning banner for legal pages pending counsel review.
 *
 * Controlled by `NEXT_PUBLIC_LEGAL_REVIEWED`. While it is unset, every legal
 * page carries a visible warning that its content is structural and unreviewed.
 * Setting it to "true" after counsel has signed the documents off removes the
 * banners across all of them at once.
 *
 * The default is the banner, deliberately: the failure mode of forgetting to
 * remove a warning is a visibly unfinished page, whereas the failure mode of
 * defaulting to hidden is publishing unreviewed legal text as though it had been
 * checked — which is the sort of mistake that is discovered by a regulator.
 */
export function DraftBanner({ document }: { document: string }) {
  if (process.env.NEXT_PUBLIC_LEGAL_REVIEWED?.trim().toLowerCase() === "true") {
    return null;
  }

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
      <p className="mt-3 border-t border-warn/30 pt-3 font-mono text-[11px]">
        Remove this banner across all legal pages by setting
        NEXT_PUBLIC_LEGAL_REVIEWED=true once counsel has approved them.
      </p>
    </div>
  );
}
