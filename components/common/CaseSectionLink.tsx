import HomeSectionLink from "@/components/common/HomeSectionLink";

type Props = {
  label?: string;
  className?: string;
  onClick?: () => void;
  variant?: "button" | "text";
};

export default function CaseSectionLink({
  label = "Denunciar mi caso",
  className = "",
  onClick,
  variant = "button",
}: Props) {
  const style = variant === "button"
    ? "inline-flex items-center justify-center rounded-md bg-red px-6 py-3 text-center font-bold uppercase text-white transition hover:bg-red-hover"
    : "text-sm text-[var(--color-text-secondary)] transition-colors hover:text-white";

  return (
    <HomeSectionLink
      href="/#registrar-reclamo"
      onClick={onClick}
      className={`${style} ${className}`}
    >
      {label}
    </HomeSectionLink>
  );
}
