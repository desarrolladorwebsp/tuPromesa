type Props = {
  label?: string;
  className?: string;
  onClick?: () => void;
};

export default function CaseSectionLink({
  label = "Denunciar mi caso",
  className = "",
  onClick,
}: Props) {
  return (
    <a
      href="/#registrar-reclamo"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md bg-red px-6 py-3 text-center font-bold uppercase text-white transition hover:bg-red-hover ${className}`}
    >
      {label}
    </a>
  );
}
