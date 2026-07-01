import { useState, useCallback } from "react";
import { HammurabiGame } from "@/game/hammurabiEngine";
import { Particles } from "@/components/magicui/particles";
import { Dashboard } from "@/components/game/Dashboard";
import { EventsPanel } from "@/components/game/EventsPanel";
import { TradePanel } from "@/components/game/TradePanel";
import { GameOver } from "@/components/game/GameOver";

function buildLogEntry(prevState, events) {
  const harvest = events.find((e) => e.type === "harvest");
  const impeachment = events.find((e) => e.type === "impeachment");
  const trades = events.filter((e) => e.type === "trade").map((e) => e.text);

  return {
    year: prevState.year,
    trades,
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

      <main className="w-full max-w-3xl relative">
        <header className="text-center mb-6">
          <h1 className="title-font text-4xl md:text-5xl text-amber-100">HAMURABI</h1>
          <p className="text-sm text-parchment/60 mt-1">Rządź Sumerem przez 10 lat. Handluj mądrze, nie dopuść do głodu.</p>
        </header>

        <Dashboard state={state} />
        <EventsPanel entries={entries} />
        {evaluation && <GameOver evaluation={evaluation} onRestart={handleRestart} />}
        {!evaluation && <TradePanel state={state} onSubmit={handleSubmit} error={error} />}
      </main>
    </div>
  );
}
