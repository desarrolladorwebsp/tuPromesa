import type { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<"a"> & { href: `/#${string}` };

export default function HomeSectionLink(props: Props) {
  // Native anchors replace the current fragment and scroll even on repeat visits.
  return <a {...props} />;
}
