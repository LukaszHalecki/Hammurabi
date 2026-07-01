import { useEffect, useRef } from "react";
import { TabletPanel } from "./TabletPanel";

function YearEntry({ entry }) {
  return (
    <div className="py-1 border-b border-dashed border-amber/10 leading-snug text-[0.7rem]">
      <div className="text-amber-bright/90 font-medium">R{entry.year}</div>
      {entry.trades?.map((text, i) => (
        <div key={i} className="text-parchment/70">{text}</div>
      ))}
      {entry.starved > 0 && <div className="text-clay-red">{entry.starved} zmarło z głodu</div>}
      {entry.immigrants > 0 && <div className="text-nile-green">+{entry.immigrants} osadników</div>}
      {entry.plague && <div className="text-clay-red">Zaraza — połowa ludności</div>}
      {entry.harvest && (
        <div className="text-parchment/80">
          Żniwa {entry.harvest.harvested} buszli · jedzenie {entry.harvest.feedGrain}
        </div>
      )}
      {entry.harvest?.ratsAte > 0 && <div className="text-clay-red">Szczury: −{entry.harvest.ratsAte}</div>}
      {entry.impeached && <div className="text-clay-red font-medium">{entry.impeached}</div>}
    </div>
  );
}

export function EventsPanel({ entries }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries.length]);

  return (
    <TabletPanel className="mb-2" compact>
      <h2 className="text-[0.6rem] uppercase tracking-[0.15em] text-parchment/45 mb-1">Wydarzenia</h2>
      <div id="log-scroll" ref={scrollRef} className="h-24 overflow-y-auto pr-0.5">
        {entries.length === 0 && (
          <div className="text-parchment/35 italic text-[0.7rem]">Kadencja się rozpoczyna…</div>
        )}
        {entries.map((entry, i) => (
          <YearEntry key={i} entry={entry} />
        ))}
      </div>
    </TabletPanel>
  );
}
