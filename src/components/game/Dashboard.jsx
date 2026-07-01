import { HammurabiGame } from "@/game/hammurabiEngine";
import { TabletPanel } from "./TabletPanel";
import { StatBlock } from "./StatBlock";

export function Dashboard({ state }) {
  const feed = HammurabiGame.getFeedBreakdown(state);

  return (
    <TabletPanel className="mb-2" shine compact>
      <h2 className="text-[0.6rem] uppercase tracking-[0.15em] text-parchment/45 mb-1.5">Podsumowanie</h2>
      <div className="grid grid-cols-4 gap-1.5 mb-1.5">
        <StatBlock label="Rok" value={state.year} suffix={`/${HammurabiGame.TOTAL_YEARS}`} />
        <StatBlock label="Chłopi" value={state.peasants} />
        <StatBlock label="Wojowie" value={state.warriors} />
        <StatBlock label="Srebro" value={state.silver} />
        <StatBlock label="Akry" value={state.acres} />
        <StatBlock label="Zboże" value={state.grain} />
        <StatBlock label="Jedzenie" value={feed.total} suffix=" /rok" />
        <StatBlock label="Ludność" value={HammurabiGame.getPopulation(state)} />
      </div>
      <div className="text-[0.6rem] text-parchment/40 leading-snug">
        Wyżywienie: chłop {HammurabiGame.BUSHELS_PER_PEASANT} · woj {HammurabiGame.BUSHELS_PER_WARRIOR} buszli/os.
        ({feed.peasants}+{feed.warriors})
      </div>
    </TabletPanel>
  );
}
