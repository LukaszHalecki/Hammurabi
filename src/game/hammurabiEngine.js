// game.js — czysta logika gry Hamurabi.
// Zasada: (stan + decyzja gracza) -> nowy stan. Zero DOM, zero window.
// Dzięki temu ten sam plik można podpiąć pod backend (PHP/Node) do trybu turowego,
// albo wywołać z testów, bez dotykania warstwy renderowania.

const TOTAL_YEARS = 10;
const BUSHELS_PER_PERSON = 20;   // ile zboża potrzebuje 1 osoba rocznie, by nie głodować
const BUSHELS_PER_ACRE_SEED = 0.5; // ile zboża trzeba zasiać na 1 akr
const MAX_ACRES_PER_PERSON = 10;   // ilu akrów może obrobić 1 osoba
const IMPEACHMENT_STARVATION_RATIO = 0.45; // >45% zmarłych w roku = koniec gry

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Tworzy początkowy stan gry (wartości zgodne z oryginałem Ahla z 1973: 95 osób,
// 1000 akrów, 2800 buszli zboża).
function createInitialState() {
  return {
    year: 1,
    population: 95,
    acres: 1000,
    grain: 2800,
    landPrice: randInt(17, 26), // buszli za akr w tym roku
    starvedLastYear: 0,
    immigrantsLastYear: 5,
    plagueLastYear: false,
    totalStarved: 0,
    starvationHistory: [], // % zmarłych w każdym roku, do oceny końcowej
    gameOver: false,
    endReason: null, // 'impeachment' | 'completed'
    log: [],
  };
}

// decision = { buyAcres, sellAcres, feedGrain, plantAcres }
// Zwraca nowy stan (nie mutuje oryginału).
function playTurn(state, decision) {
  const s = { ...state };
  const events = [];

  const buyAcres = Math.max(0, decision.buyAcres || 0);
  const sellAcres = Math.max(0, decision.sellAcres || 0);
  const feedGrain = Math.max(0, decision.feedGrain || 0);
  const plantAcres = Math.max(0, decision.plantAcres || 0);

  // --- Walidacja handlu ziemią ---
  if (buyAcres > 0 && sellAcres > 0) {
    events.push({ type: 'error', text: 'Nie możesz kupować i sprzedawać ziemi w tym samym roku.' });
    return { state: s, events };
  }
  if (sellAcres > s.acres) {
    events.push({ type: 'error', text: `Posiadasz tylko ${s.acres} akrów. Nie możesz sprzedać ${sellAcres}.` });
    return { state: s, events };
  }
  const landCost = buyAcres * s.landPrice;
  if (landCost > s.grain) {
    events.push({ type: 'error', text: `Masz tylko ${s.grain} buszli zboża. Nie stać cię na ${buyAcres} akrów.` });
    return { state: s, events };
  }

  let grain = s.grain - landCost + sellAcres * s.landPrice;
  let acres = s.acres - sellAcres + buyAcres;

  // --- Wyżywienie ludności ---
  if (feedGrain > grain) {
    events.push({ type: 'error', text: `Nie masz aż ${feedGrain} buszli zboża.` });
    return { state: s, events };
  }
  grain -= feedGrain;

  // --- Zasiew ---
  const seedCost = plantAcres * BUSHELS_PER_ACRE_SEED;
  if (plantAcres > acres) {
    events.push({ type: 'error', text: `Posiadasz tylko ${acres} akrów ziemi.` });
    return { state: s, events };
  }
  if (plantAcres > s.population * MAX_ACRES_PER_PERSON) {
    events.push({ type: 'error', text: `${s.population} ludzi obrobi najwyżej ${s.population * MAX_ACRES_PER_PERSON} akrów.` });
    return { state: s, events };
  }
  if (seedCost > grain) {
    events.push({ type: 'error', text: `Zasiew ${plantAcres} akrów wymaga ${seedCost} buszli, a masz tylko ${grain}.` });
    return { state: s, events };
  }
  grain -= seedCost;

  // --- Zbiory ---
  const yieldPerAcre = randInt(1, 6);
  const harvested = plantAcres * yieldPerAcre;
  grain += harvested;

  // --- Szczury ---
  let ratsAte = 0;
  if (Math.random() < 0.4) {
    ratsAte = Math.floor(grain * (randInt(5, 20) / 100));
    grain -= ratsAte;
  }

  // --- Głód ---
  const grainNeeded = s.population * BUSHELS_PER_PERSON;
  let starved = 0;
  if (feedGrain < grainNeeded) {
    starved = Math.floor((grainNeeded - feedGrain) / BUSHELS_PER_PERSON);
    starved = Math.min(starved, s.population);
  }
  let population = s.population - starved;

  const starvationRatio = s.population > 0 ? starved / s.population : 0;
  const starvationHistory = [...s.starvationHistory, starvationRatio];

  if (starvationRatio > IMPEACHMENT_STARVATION_RATIO) {
    return {
      state: {
        ...s,
        grain, acres, population, starvedLastYear: starved,
        totalStarved: s.totalStarved + starved,
        starvationHistory,
        gameOver: true,
        endReason: 'impeachment',
      },
      events: [{ type: 'impeachment', text: `Zagłodziłeś ${starved} ludzi w jednym roku!` }],
    };
  }

  // --- Plaga (15% szans, jeśli przeżyli głód) ---
  let plague = false;
  if (population > 0 && Math.random() < 0.15) {
    plague = true;
    population = Math.floor(population / 2);
    events.push({ type: 'plague', text: 'Zaraza nawiedziła miasto! Połowa ludności zmarła.' });
  }

  // --- Imigracja (im lepiej gracz radzi sobie, tym więcej przybyszów) ---
  const acresPerCapita = population > 0 ? acres / population : 0;
  const prosperity = Math.floor((grain / 1000) + acresPerCapita / 5);
  const immigrants = Math.max(0, randInt(0, 5) + Math.min(10, prosperity) - (starved > 0 ? 5 : 0));
  population += immigrants;

  const nextYear = s.year + 1;
  const gameOver = nextYear > TOTAL_YEARS;

  const newState = {
    ...s,
    year: gameOver ? s.year : nextYear,
    population,
    acres,
    grain,
    landPrice: randInt(17, 26),
    starvedLastYear: starved,
    immigrantsLastYear: immigrants,
    plagueLastYear: plague,
    totalStarved: s.totalStarved + starved,
    starvationHistory,
    gameOver,
    endReason: gameOver ? 'completed' : null,
  };

  events.push({
    type: 'harvest',
    text: `Rok ${s.year}: zebrano ${yieldPerAcre} buszli/akr (${harvested} razem).`,
    data: { yieldPerAcre, harvested, ratsAte, starved, immigrants },
  });

  return { state: newState, events };
}

// Ocena końcowa — zwraca { rating, avgStarvation, acresPerCapita }
function evaluateGame(state) {
  const avgStarvation =
    state.starvationHistory.reduce((a, b) => a + b, 0) / (state.starvationHistory.length || 1);
  const acresPerCapita = state.population > 0 ? state.acres / state.population : 0;

  let rating;
  if (state.endReason === 'impeachment') {
    rating = 'impeached';
  } else if (avgStarvation > 0.33 || acresPerCapita < 7) {
    rating = 'impeached';
  } else if (avgStarvation > 0.1 || acresPerCapita < 9) {
    rating = 'poor';
  } else if (avgStarvation > 0.03 || acresPerCapita < 10) {
    rating = 'average';
  } else {
    rating = 'excellent';
  }

  return { rating, avgStarvation, acresPerCapita, totalStarved: state.totalStarved };
}

export const HammurabiGame = { createInitialState, playTurn, evaluateGame, TOTAL_YEARS };
