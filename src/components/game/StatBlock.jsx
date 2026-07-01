import { NumberTicker } from "@/components/magicui/number-ticker";
import { cn } from "@/lib/utils";

export function StatBlock({ label, value, suffix = "", className }) {
  return (
    <div className={cn("rounded border border-tablet-border bg-bg/30 px-2 py-1.5 min-w-0", className)}>
      <div className="text-[0.6rem] uppercase tracking-wider text-parchment/50 truncate">{label}</div>
      <div className="text-sm text-amber-bright font-semibold tabular-nums leading-tight">
        <NumberTicker value={value} className="text-amber-bright text-sm" />
        {suffix && <span className="text-[0.65rem] text-parchment/40 font-normal">{suffix}</span>}
      </div>
    </div>
  );
}
