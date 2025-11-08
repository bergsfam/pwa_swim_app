interface ConvertedBadgeProps {
  note: string;
}

const ConvertedBadge = ({ note }: ConvertedBadgeProps) => (
  <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-orange-300">
    Converted
    <span className="ml-1 text-[0.55rem] normal-case text-orange-200/80">{note}</span>
  </span>
);

export default ConvertedBadge;
