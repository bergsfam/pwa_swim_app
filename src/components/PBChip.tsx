interface ChipProps {
  className?: string;
}

const PBChip = ({ className }: ChipProps) => (
  <span className={`inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 ${className ?? ''}`}>
    PB
  </span>
);

export default PBChip;
