import { useState, useCallback } from "react";
import { HammurabiGame } from "@/game/hammurabiEngine";
import { Particles } from "@/components/magicui/particles";
import { TabletPanel } from "@/components/game/TabletPanel";
import { StatBlock } from "@/components/game/StatBlock";
import { LogPanel } from "@/components/game/LogPanel";
import { DecisionForm } from "@/components/game/DecisionForm";
import { GameOver } from "@/components/game/GameOver";

function buildLogEntry(prevState, events) {
  const harvest = events.find((e) => e.type === "harvest");
  const impeachment = events.find((e) => e.type === "impeachment");
  return {
    year: prevState.year,
    starved: prevState.starvedLastYear,
    immigrants: prevState.immigrantsLastYear,
    plague: prevState.plagueLastYear,
    harvest: harvest ? harvest.data : null,
    impeached: impeachment ? impeachment.text : null,
  };
}

export default function App() {
  const [state, setState] = useState(() => HammurabiGame.createInitialState());
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  const handleSubmit = useCallback((decision) => {
    setError(null);
    const prevYear = state.year;
    const result = HammurabiGame.playTurn(state, decision);

    const errorEvent = result.events.find((ev) => ev.type === "error");
    if (errorEvent) {
      setError(errorEvent.text);
      return;
    }

    // Wydarzenia (starved/immigrants/plague) dotyczą właśnie zakończonego roku,
    // więc bierzemy je z nowego stanu, ale numer roku ze starego.
    const logEntry = buildLogEntry({ ...result.state, year: prevYear }, result.events);
    setEntries((prev) => [...prev, logEntry]);
    setState(result.state);

    if (result.state.gameOver) {
      setEvaluation(HammurabiGame.evaluateGame(result.state));
    }
  }, [state]);

  const handleRestart = () => {
    setState(HammurabiGame.createInitialState());
    setEntries([]);
    setError(null);
    setEvaluation(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <Particles className="absolute inset-0 -z-10" quantity={70} color="#c98a3e" size={0.5} ease={70} />

      <main className="w-full max-w-2xl relative">
        <header className="text-center mb-6">
          <h1 className="title-font text-4xl md:text-5xl text-amber-100">HAMURABI</h1>
          <p className="text-sm text-parchment/60 mt-1">Rządź Sumerem przez 10 lat. Nie dopuść do głodu.</p>
        </header>

        <TabletPanel className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-4" shine>
          <StatBlock label="Rok" value={state.year} />
          <StatBlock label="Ludność" value={state.population} />
          <StatBlock label="Akry" value={state.acres} />
          <StatBlock label="Zboże" value={state.grain} />
          <StatBlock label="Cena ziemi" value={state.landPrice} />
        </TabletPanel>

        <LogPanel entries={entries} />

        {evaluation && <GameOver evaluation={evaluation} onRestart={handleRestart} />}

        {!evaluation && <DecisionForm onSubmit={handleSubmit} error={error} />}
      </main>
    </div>
  );
}
