import { useMemo, useState } from "react";
import { COMMODITIES, createEmptyTrade, getTradeSummary } from "@/game/trade";
import { HammurabiGame } from "@/game/hammurabiEngine";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { TabletPanel } from "./TabletPanel";

const CURRENCY_LABEL = {
  grain: "zboże",
  silver: "srebro",
};

function TradeRow({ commodity, state, values, onChange }) {
  const stock = state[commodity.stockKey];
  const buyPrice = state.prices[commodity.priceKey];
  const sellPrice = state.prices[commodity.sellPriceKey];
  const currency = CURRENCY_LABEL[commodity.currency];

  return (
    <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 items-end py-3 border-b border-dashed border-amber/10 last:border-0">
      <div>
        <div className="text-amber-bright font-medium">{commodity.label}</div>
        <div className="text-[0.7rem] text-parchment/50 mt-0.5">
          Posiadasz: {stock} {commodity.unit}
        </div>
        <div className="text-[0.7rem] text-parchment/40">
          Kupno {buyPrice} {currency} · Sprzedaż {sellPrice} {currency}
        </div>
      </div>

      <label className="text-xs block">
        <span className="block mb-1 uppercase tracking-widest text-[0.65rem] text-parchment/60">Kup</span>
        <input
          type="number"
          min="0"
          value={values.buy}
          onChange={(e) => onChange("buy", e.target.value)}
          className="w-full px-2 py-1.5 rounded bg-bg border border-tablet-border text-amber-bright focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20"
        />
      </label>

      <label className="text-xs block">
        <span className="block mb-1 uppercase tracking-widest text-[0.65rem] text-parchment/60">Sprzedaj</span>
        <input
          type="number"
          min="0"
          value={values.sell}
          onChange={(e) => onChange("sell", e.target.value)}
          className="w-full px-2 py-1.5 rounded bg-bg border border-tablet-border text-amber-bright focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20"
        />
      </label>
    </div>
  );
}

export function TradePanel({ state, onSubmit, error }) {
  const [trade, setTrade] = useState(createEmptyTrade);
  const [feedGrain, setFeedGrain] = useState(0);
  const [plantAcres, setPlantAcres] = useState(0);

  const summary = useMemo(() => getTradeSummary(state, trade), [state, trade]);
  const grainNeeded = HammurabiGame.getGrainNeeded(state);

  const handleTradeChange = (id, field, value) => {
    const amount = Math.max(0, parseInt(value, 10) || 0);
    setTrade((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: amount },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ trade, feedGrain, plantAcres });
    setTrade(createEmptyTrade());
    setFeedGrain(0);
    setPlantAcres(0);
  };

  const suggestFeed = () => setFeedGrain(grainNeeded);
  const suggestPlant = () => setPlantAcres(Math.min(state.acres, state.peasants * HammurabiGame.MAX_ACRES_PER_PEASANT));

  return (
    <TabletPanel>
      <h2 className="text-xs uppercase tracking-[0.2em] text-parchment/50 mb-1">Handel</h2>
      <p className="text-xs text-parchment/40 mb-4">
        Ziemię płacisz zbożem. Zboże, chłopów i wojowników rozliczasz srebrem ze skarbca.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-clay-red text-sm">{error}</div>}

        <div>
          {COMMODITIES.map((commodity) => (
            <TradeRow
              key={commodity.id}
              commodity={commodity}
              state={state}
              values={trade[commodity.id]}
              onChange={(field, value) => handleTradeChange(commodity.id, field, value)}
            />
          ))}
        </div>

        <div className="rounded border border-tablet-border bg-bg/40 p-3 text-xs text-parchment/70 space-y-1">
          <div>Saldo po handlu:</div>
          <div className={summary.grainAfter < 0 ? "text-clay-red" : "text-amber-bright"}>
            Zboże: {state.grain} → {summary.grainAfter} buszli
          </div>
          <div className={summary.silverAfter < 0 ? "text-clay-red" : "text-amber-bright"}>
            Srebro: {state.silver} → {summary.silverAfter}
          </div>
        </div>

        <div className="border-t border-tablet-border pt-4">
          <h3 className="text-xs uppercase tracking-[0.2em] text-parchment/50 mb-3">Zarządzanie rokiem</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs block">
              <span className="block mb-1 uppercase tracking-widest text-[0.65rem] text-parchment/60">
                Zboże na wyżywienie
                <button type="button" onClick={suggestFeed} className="ml-2 text-amber/70 hover:text-amber">
                  (min. {grainNeeded})
                </button>
              </span>
              <input
                type="number"
                min="0"
                value={feedGrain}
                onChange={(e) => setFeedGrain(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2 py-1.5 rounded bg-bg border border-tablet-border text-amber-bright focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20"
              />
            </label>
            <label className="text-xs block">
              <span className="block mb-1 uppercase tracking-widest text-[0.65rem] text-parchment/60">
                Akrów do obsiania
                <button type="button" onClick={suggestPlant} className="ml-2 text-amber/70 hover:text-amber">
                  (max)
                </button>
              </span>
              <input
                type="number"
                min="0"
                value={plantAcres}
                onChange={(e) => setPlantAcres(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2 py-1.5 rounded bg-bg border border-tablet-border text-amber-bright focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20"
              />
            </label>
          </div>
        </div>

        <ShimmerButton type="submit" className="w-full py-2.5" background="#1a1611" shimmerColor="#e8ab5e">
          <span className="text-amber-bright font-semibold text-sm">Zatwierdź handel i przejdź rok</span>
        </ShimmerButton>
      </form>
    </TabletPanel>
  );
}
