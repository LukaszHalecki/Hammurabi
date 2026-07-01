import { NumberTicker } from "@/components/magicui/number-ticker";

export function StatBlock({ label, value, prefix = "" }) {
  return (
    <div className="border-l-2 border-amber pl-3">
      <div className="text-[0.7rem] uppercase tracking-widest text-parchment/60">{label}</div>
      <div className="text-xl md:text-2xl text-amber-bright font-semibold">
        {prefix}
        <NumberTicker value={value} className="text-amber-bright" />
      </div>
    </div>
  );
}
