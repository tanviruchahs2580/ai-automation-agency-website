import { Tag } from "@/components/ui/Tag";
import { disclaimers } from "@/data/disclaimers";

/**
 * Marks content that describes a reference architecture rather than a verified
 * client engagement.
 *
 * Rendered only when the underlying record says so — the call site reads
 * `CaseStudy.isExampleArchitecture`. That field previously existed in the data
 * and in the type but was read by nothing: the badge and the honesty note were
 * hard-coded, so adding a genuinely verified client study would have stamped it
 * "not a client engagement" and printed a note saying its outcome metrics had
 * been deliberately omitted.
 *
 * A verified study renders no badge at all rather than a "verified" counterpart.
 * There is no verification claim this codebase can make yet — the `CaseStudy`
 * type carries no outcome-metrics field — and inventing one would be the exact
 * failure the honesty rule exists to prevent.
 */
export function ExampleBadge() {
  return (
    <Tag accent>{disclaimers.exampleArchitectureBadge}</Tag>
  );
}
