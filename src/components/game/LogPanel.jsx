import { useEffect, useRef } from "react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { TabletPanel } from "./TabletPanel";

function YearEntry({ entry }) {
  return (
    <BlurFade duration={0.35} offset={8}>
      <div className="py-2 border-b border-dashed border-amber/15 leading-relaxed">
        <div className="text-amber-bright font-semibold mb-1">— ROK {entry.year} —</div>
        {entry.starved > 0 && (
          <div className="text-clay-red">{entry.starved} osób zmarło z głodu.</div>
        )}
        {entry.immigrants > 0 && (
          <div className="text-nile-green">{entry.immigrants} nowych osadników przybyło do miasta.</div>
        )}
        {entry.plague && (
          <div className="text-clay-red">Zaraza nawiedziła miasto — połowa ludności zmarła.</div>
        )}
        {entry.harvest && (
          <div>
            Zebrano {entry.harvest.yieldPerAcre} buszli z akra ({entry.harvest.harvested} razem).
          </div>
        )}
        {entry.harvest?.ratsAte > 0 && (
          <div className="text-clay-red">Szczury zjadły {entry.harvest.ratsAte} buszli zboża.</div>
        )}
        {entry.impeached && (
          <div className="text-clay-red text-base font-semibold">{entry.impeached}</div>
        )}
      </div>
    </BlurFade>
  );
}

export function LogPanel({ entries }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries.length]);

  return (
    <TabletPanel className="mb-4">
      <div id="log-scroll" ref={scrollRef} className="h-64 overflow-y-auto text-sm pr-1">
        {entries.length === 0 && (
          <div className="text-parchment/40 italic">Kadencja się rozpoczyna...</div>
        )}
        {entries.map((entry, i) => (
          <YearEntry key={i} entry={entry} />
        ))}
      </div>
    </TabletPanel>
  );
}
