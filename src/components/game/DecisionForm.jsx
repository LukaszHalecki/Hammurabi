import { useState } from "react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { TabletPanel } from "./TabletPanel";

const FIELDS = [
  { name: "buyAcres", label: "Kup akrów" },
  { name: "sellAcres", label: "Sprzedaj akrów" },
  { name: "feedGrain", label: "Zboże na wyżywienie" },
  { name: "plantAcres", label: "Akrów do obsiania" },
];

export function DecisionForm({ onSubmit, error }) {
  const [values, setValues] = useState({ buyAcres: 0, sellAcres: 0, feedGrain: 0, plantAcres: 0 });

  const handleChange = (name, value) => {
    setValues((v) => ({ ...v, [name]: parseInt(value, 10) || 0 }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <TabletPanel as="form">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <div className="text-clay-red text-sm">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <label key={f.name} className="text-xs block">
              <span className="block mb-1 uppercase tracking-widest text-[0.7rem] text-parchment/60">
                {f.label}
              </span>
              <input
                type="number"
                min="0"
                value={values[f.name]}
                onChange={(e) => handleChange(f.name, e.target.value)}
                className="w-full px-2 py-1.5 rounded bg-bg border border-tablet-border text-amber-bright focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20"
              />
            </label>
          ))}
        </div>
        <ShimmerButton type="submit" className="w-full py-2.5 mt-2" background="#1a1611" shimmerColor="#e8ab5e">
          <span className="text-amber-bright font-semibold text-sm">Zatwierdź rok</span>
        </ShimmerButton>
      </form>
    </TabletPanel>
  );
}
