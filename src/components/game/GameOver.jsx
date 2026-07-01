import { motion } from "motion/react";
import { TabletPanel } from "./TabletPanel";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

const RATING_TEXT = {
  excellent: "Rządy godne Charlemagne'a i Jeffersona.",
  average: "Rządy przeciętne — miasto przetrwało, ale bez chwały.",
  poor: "Rządy twarde jak Nero — lud cię nie wspomina dobrze.",
  impeached: "Zostałeś obalony. Lud okrzyknął cię hańbą tronu.",
};

export function GameOver({ evaluation, onRestart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-2"
    >
      <TabletPanel shine compact>
        <h2 className="title-font text-amber-bright text-sm mb-1">KONIEC KADENCJI</h2>
        <p className="text-xs mb-1">{RATING_TEXT[evaluation.rating]}</p>
        <p className="text-[0.65rem] text-parchment/70">Głód: {(evaluation.avgStarvation * 100).toFixed(1)}% · akr/os: {evaluation.acresPerCapita.toFixed(1)} · zmarło: {evaluation.totalStarved}</p>
        <ShimmerButton onClick={onRestart} className="w-full py-2 mt-2" background="#1a1611" shimmerColor="#e8ab5e">
          <span className="text-amber-bright font-semibold text-xs">Nowa kadencja</span>
        </ShimmerButton>
      </TabletPanel>
    </motion.div>
  );
}
