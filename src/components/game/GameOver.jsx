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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-4"
    >
      <TabletPanel shine>
        <h2 className="title-font text-amber-bright text-xl mb-2">KONIEC KADENCJI</h2>
        <p className="mb-1">{RATING_TEXT[evaluation.rating]}</p>
        <p className="text-sm text-parchment/80">Średni głód rocznie: {(evaluation.avgStarvation * 100).toFixed(1)}%</p>
        <p className="text-sm text-parchment/80">Akrów na osobę: {evaluation.acresPerCapita.toFixed(1)}</p>
        <p className="text-sm text-parchment/80 mb-4">Łącznie zmarło z głodu: {evaluation.totalStarved}</p>
        <ShimmerButton onClick={onRestart} className="w-full py-2.5" background="#1a1611" shimmerColor="#e8ab5e">
          <span className="text-amber-bright font-semibold text-sm">Nowa kadencja</span>
        </ShimmerButton>
      </TabletPanel>
    </motion.div>
  );
}
