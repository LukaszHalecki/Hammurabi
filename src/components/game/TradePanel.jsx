import { useMemo, useState } from "react";
import {
  COMMODITIES,
  createEmptyTrade,
  getMaxBuy,
  getMaxSell,
  getTradeSummary,
} from "@/game/trade";
import { HammurabiGame } from "@/game/hammurabiEngine";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { TabletPanel } from "./TabletPanel";

function TradeSlider({ label, value, max, price, onChange, tone }) {
  const cost = value * price;
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[0.6rem] text-parchment/50">
        <span>{label}</span>
        <span className={tone}>{value} · {cost} ⊙</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="game-slider w-full"
        disabled={max === 0}
      />
    </div>
  );
}

function TradeTile({ commodity, state, values, onChange }) {
  const stock = state[commodity.stockKey];
  const buyPrice = state.prices[commodity.buyKey];
  const sellPrice = state.prices[commodity.sellKey];
  const maxBuy = getMaxBuy(state, commodity);
  const maxSell = getMaxSell(state, commodity);

  const setBuy = (buy) => onChange({ buy, sell: buy > 0 ? 0 : values.sell });
  const setSell = (sell) => onChange({ buy: sell > 0 ? 0 : values.buy, sell });

  return (
    <div className="rounded border border-tablet-border bg-bg/25 p-2 space-y-1.5">
      <div className="flex justify-between items-baseline gap-1">
        <span className="text-xs text-amber-bright font-medium">{commodity.label}</span>
        <span className="text-[0.6rem] text-parchment/45">{stock} {commodity.unit}</span>
      </div>
      <div className="text-[0.55rem] text-parchment/40">
        kup {buyPrice} ⊙ · sprzedaj {sellPrice} ⊙
      </div>
      <TradeSlider
        label="Kup"
        value={values.buy}
        max={maxBuy}
        price={buyPrice}
        onChange={setBuy}
        tone="text-amber-bright/80"
      />
      <TradeSlider
        label="Sprzedaj"
        value={values.sell}
        max={maxSell}
        price={sellPrice}
        onChange={setSell}
        tone="text-nile-green/80"
      />
    </div>
  );
}

export function TradePanel({ state, onSubmit, error }) {
  const [trade, setTrade] = useState(createEmptyTrade);
  const [plantAcres, setPlantAcres] = useState(0);

  const summary = useMemo(() => getTradeSummary(state, trade), [state, trade]);
  const maxPlant = Math.min(state.acres, state.peasants * HammurabiGame.MAX_ACRES_PER_PEASANT);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ trade, plantAcres });
    setTrade(createEmptyTrade());
    setPlantAcres(0);
  };

  return (
    <TabletPanel compact>
      <h2 className="text-[0.6rem] uppercase tracking-[0.15em] text-parchment/45 mb-1">Handel</h2>
      <p className="text-[0.6rem] text-parchment/35 mb-2">Wszystko za srebro. Zakup zawsze droższy niż sprzedaż.</p>

      <form onSubmit={handleSubmit} className="space-y-2">
        {error && <div className="text-clay-red text-[0.7rem]">{error}</div>}

        <div className="grid grid-cols-2 gap-1.5">
          {COMMODITIES.map((commodity) => (
            <TradeTile
              key={commodity.id}
              commodity={commodity}
              state={state}
              values={trade[commodity.id]}
              onChange={(next) => setTrade((prev) => ({ ...prev, [commodity.id]: next }))}
            />
          ))}
        </div>

        <div className="flex justify-between text-[0.65rem] px-1 py-1 rounded bg-bg/30 border border-tablet-border/60">
          <span className="text-parchment/50">Srebro po handlu</span>
          <span className={summary.silverAfter < 0 ? "text-clay-red" : "text-amber-bright"}>
            {state.silver} → {summary.silverAfter} ⊙
          </span>
        </div>

        <div className="rounded border border-tablet-border bg-bg/25 p-2">
          <div className="flex justify-between text-[0.6rem] text-parchment/50 mb-1">
            <span>Zasiew (akr)</span>
            <span>{plantAcres} / {maxPlant}</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxPlant}
            value={plantAcres}
            onChange={(e) => setPlantAcres(parseInt(e.target.value, 10))}
            className="game-slider w-full"
          />
        </div>

        <ShimmerButton type="submit" className="w-full py-2" background="#1a1611" shimmerColor="#e8ab5e">
          <span className="text-amber-bright font-semibold text-xs">Zatwierdź rok</span>
        </ShimmerButton>
      </form>
    </TabletPanel>
  );
}
