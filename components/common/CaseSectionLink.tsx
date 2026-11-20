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
    // A native anchor scrolls back to the form even when the URL already has this hash.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a
      href="/#registrar-reclamo"
      onClick={onClick}
      className={`${style} ${className}`}
    >
      {label}
    </a>
  );
}
