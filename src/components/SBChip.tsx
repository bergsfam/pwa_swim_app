interface ChipProps {
  className?: string;
}

const SBChip = ({ className }: ChipProps) => (
  <span className={`inline-flex items-center rounded-full bg-sky-500/20 px-2 py-0.5 text-xs font-semibold text-sky-300 ${className ?? ''}`}>
    SB
  </span>
);

export default SBChip;
