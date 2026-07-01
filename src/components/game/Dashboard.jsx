import { HammurabiGame } from "@/game/hammurabiEngine";
import { TabletPanel } from "./TabletPanel";
import { StatBlock } from "./StatBlock";

export function Dashboard({ state }) {
  const population = HammurabiGame.getPopulation(state);
  const grainNeeded = HammurabiGame.getGrainNeeded(state);

  return (
    <TabletPanel className="mb-4" shine>
      <h2 className="text-xs uppercase tracking-[0.2em] text-parchment/50 mb-4">Podsumowanie</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatBlock label="Rok" value={state.year} suffix={` / ${HammurabiGame.TOTAL_YEARS}`} />
        <StatBlock label="Ludność" value={population} />
        <StatBlock label="Chłopi" value={state.peasants} />
        <StatBlock label="Wojowie" value={state.warriors} />
        <StatBlock label="Akry" value={state.acres} />
        <StatBlock label="Zboże" value={state.grain} />
        <StatBlock label="Srebro" value={state.silver} />
        <StatBlock label="Wyżywienie / rok" value={grainNeeded} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs border-t border-tablet-border pt-3">
        <PriceTag label="Ziemia" value={`${state.prices.land} zboża/akr`} />
        <PriceTag label="Zboże" value={`${state.prices.grainBuy}↓ / ${state.prices.grainSell}↑ srebra`} />
        <PriceTag label="Chłopi" value={`${state.prices.peasantBuy}↓ / ${state.prices.peasantSell}↑`} />
        <PriceTag label="Wojowie" value={`${state.prices.warriorBuy}↓ / ${state.prices.warriorSell}↑`} />
      </div>
    </TabletPanel>
  );
}

function PriceTag({ label, value }) {
  return (
    <div className="text-parchment/60">
      <div className="uppercase tracking-widest text-[0.65rem] mb-0.5">{label}</div>
      <div className="text-amber-bright/90">{value}</div>
    </div>
  );
}
