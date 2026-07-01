// game.js — czysta logika gry Hamurabi.

import { applyTrade, createEmptyTrade, normalizeTrade } from "./trade.js";

const TOTAL_YEARS = 10;
const BUSHELS_PER_PEASANT = 15;
const BUSHELS_PER_WARRIOR = 30;
const BUSHELS_PER_ACRE_SEED = 0.5;
const MAX_ACRES_PER_PEASANT = 10;
const IMPEACHMENT_STARVATION_RATIO = 0.45;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createPricePair(minSell, maxSell, markupMin = 1, markupMax = 3) {
  const sell = randInt(minSell, maxSell);
  const buy = sell + randInt(markupMin, markupMax);
  return { buy, sell };
}

function createMarketPrices() {
  const land = createPricePair(15, 22);
  const grain = createPricePair(2, 4);
  const peasant = createPricePair(8, 12);
  const warrior = createPricePair(25, 35, 2, 5);
  return {
    landBuy: land.buy,
    landSell: land.sell,
    grainBuy: grain.buy,
    grainSell: grain.sell,
    peasantBuy: peasant.buy,
    peasantSell: peasant.sell,
    warriorBuy: warrior.buy,
    warriorSell: warrior.sell,
  };
}

function createInitialState() {
  return {
    year: 1,
    peasants: 90,
    warriors: 5,
    acres: 1000,
    grain: 2800,
    silver: 500,
    prices: createMarketPrices(),
    starvedLastYear: 0,
    immigrantsLastYear: 5,
    plagueLastYear: false,
    totalStarved: 0,
    starvationHistory: [],
    gameOver: false,
    endReason: null,
  };
}

function getPopulation(state) {
  return state.peasants + state.warriors;
}

function getGrainNeeded(state) {
  return state.peasants * BUSHELS_PER_PEASANT + state.warriors * BUSHELS_PER_WARRIOR;
}

function getFeedBreakdown(state) {
  const peasants = state.peasants * BUSHELS_PER_PEASANT;
  const warriors = state.warriors * BUSHELS_PER_WARRIOR;
  return { peasants, warriors, total: peasants + warriors };
}

// decision = { trade, plantAcres }
function playTurn(state, decision) {
  const s = { ...state };
  const events = [];

  const trade = normalizeTrade(decision.trade ?? createEmptyTrade());
  const tradeResult = applyTrade(s, trade);
  if (tradeResult.events.some((event) => event.type === "error")) {
    return tradeResult;
  }

  events.push(...tradeResult.events);

  let { acres, grain, peasants, warriors } = tradeResult.state;
  const plantAcres = Math.max(0, decision.plantAcres || 0);

  const seedCost = plantAcres * BUSHELS_PER_ACRE_SEED;
  if (plantAcres > acres) {
    events.push({ type: "error", text: `Posiadasz tylko ${acres} akrów ziemi.` });
    return { state: s, events };
  }
  if (plantAcres > peasants * MAX_ACRES_PER_PEASANT) {
    events.push({
      type: "error",
      text: `${peasants} chłopów obrobi najwyżej ${peasants * MAX_ACRES_PER_PEASANT} akrów.`,
    });
    return { state: s, events };
  }
  if (seedCost > grain) {
    events.push({
      type: "error",
      text: `Zasiew ${plantAcres} akrów wymaga ${seedCost} buszli, a masz tylko ${grain}.`,
    });
    return { state: s, events };
  }
  grain -= seedCost;

  const yieldPerAcre = randInt(1, 6);
  const harvested = plantAcres * yieldPerAcre;
  grain += harvested;

  let ratsAte = 0;
  if (Math.random() < 0.4) {
    ratsAte = Math.floor(grain * (randInt(5, 20) / 100));
    grain -= ratsAte;
  }

  const grainNeeded = peasants * BUSHELS_PER_PEASANT + warriors * BUSHELS_PER_WARRIOR;
  const feedGrain = Math.min(grain, grainNeeded);
  grain -= feedGrain;

  let starved = 0;
  if (feedGrain < grainNeeded) {
    const deficit = grainNeeded - feedGrain;
    const peasantsStarved = Math.min(peasants, Math.floor(deficit / BUSHELS_PER_PEASANT));
    const remainingDeficit = deficit - peasantsStarved * BUSHELS_PER_PEASANT;
    const warriorsStarved = Math.min(warriors, Math.ceil(remainingDeficit / BUSHELS_PER_WARRIOR));
    starved = Math.min(getPopulation(tradeResult.state), peasantsStarved + warriorsStarved);
    peasants = Math.max(0, peasants - peasantsStarved);
    warriors = Math.max(0, warriors - warriorsStarved);
    events.push({
      type: "famine",
      text: `Brak zboża na wyżywienie — ${starved} osób zmarło z głodu.`,
    });
  }

  const populationBefore = getPopulation(tradeResult.state);
  const starvationRatio = populationBefore > 0 ? starved / populationBefore : 0;
  const starvationHistory = [...s.starvationHistory, starvationRatio];

  if (starvationRatio > IMPEACHMENT_STARVATION_RATIO) {
    return {
      state: {
        ...tradeResult.state,
        peasants,
        warriors,
        grain,
        starvedLastYear: starved,
        totalStarved: s.totalStarved + starved,
        starvationHistory,
        gameOver: true,
        endReason: "impeachment",
      },
      events: [
        ...events,
        { type: "impeachment", text: `Zagłodziłeś ${starved} ludzi w jednym roku!` },
      ],
    };
  }

  let plague = false;
  const populationAfterStarvation = peasants + warriors;
  if (populationAfterStarvation > 0 && Math.random() < 0.15) {
    plague = true;
    peasants = Math.floor(peasants / 2);
    warriors = Math.floor(warriors / 2);
    events.push({ type: "plague", text: "Zaraza nawiedziła miasto! Połowa ludności zmarła." });
  }

  const acresPerCapita = populationAfterStarvation > 0 ? acres / populationAfterStarvation : 0;
  const prosperity = Math.floor(grain / 1000 + acresPerCapita / 5);
  const immigrants = Math.max(0, randInt(0, 5) + Math.min(10, prosperity) - (starved > 0 ? 5 : 0));
  peasants += immigrants;

  const nextYear = s.year + 1;
  const gameOver = nextYear > TOTAL_YEARS;

  const newState = {
    ...tradeResult.state,
    year: gameOver ? s.year : nextYear,
    peasants,
    warriors,
    acres,
    grain,
    prices: createMarketPrices(),
    starvedLastYear: starved,
    immigrantsLastYear: immigrants,
    plagueLastYear: plague,
    totalStarved: s.totalStarved + starved,
    starvationHistory,
    gameOver,
    endReason: gameOver ? "completed" : null,
  };

  events.push({
    type: "harvest",
    text: `Rok ${s.year}: zebrano ${yieldPerAcre} buszli/akr (${harvested} razem). Wyżywiono lud za ${feedGrain} buszli.`,
    data: { yieldPerAcre, harvested, ratsAte, starved, immigrants, feedGrain },
  });

  return { state: newState, events };
}

function evaluateGame(state) {
  const avgStarvation =
    state.starvationHistory.reduce((a, b) => a + b, 0) / (state.starvationHistory.length || 1);
  const population = getPopulation(state);
  const acresPerCapita = population > 0 ? state.acres / population : 0;

  let rating;
  if (state.endReason === "impeachment") {
    rating = "impeached";
  } else if (avgStarvation > 0.33 || acresPerCapita < 7) {
    rating = "impeached";
  } else if (avgStarvation > 0.1 || acresPerCapita < 9) {
    rating = "poor";
  } else if (avgStarvation > 0.03 || acresPerCapita < 10) {
    rating = "average";
  } else {
    rating = "excellent";
  }

  return { rating, avgStarvation, acresPerCapita, totalStarved: state.totalStarved };
}

export const HammurabiGame = {
  createInitialState,
  playTurn,
  evaluateGame,
  getPopulation,
  getGrainNeeded,
  getFeedBreakdown,
  TOTAL_YEARS,
  BUSHELS_PER_PEASANT,
  BUSHELS_PER_WARRIOR,
  MAX_ACRES_PER_PEASANT,
};
