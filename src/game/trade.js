// Handel — jednolita logika kupna i sprzedaży czterech dóbr rynkowych.
// Ziemia płacona jest zbożem (jak w oryginalnym Hamurabi),
// pozostałe dobra — srebrem z skarbca.

export const COMMODITIES = [
  {
    id: "land",
    label: "Ziemia",
    unit: "akr",
    stockKey: "acres",
    currency: "grain",
    priceKey: "land",
    sellPriceKey: "land",
  },
  {
    id: "grain",
    label: "Zboże",
    unit: "buszli",
    stockKey: "grain",
    currency: "silver",
    priceKey: "grainBuy",
    sellPriceKey: "grainSell",
  },
  {
    id: "peasants",
    label: "Chłopi",
    unit: "os.",
    stockKey: "peasants",
    currency: "silver",
    priceKey: "peasantBuy",
    sellPriceKey: "peasantSell",
  },
  {
    id: "warriors",
    label: "Wojowie",
    unit: "os.",
    stockKey: "warriors",
    currency: "silver",
    priceKey: "warriorBuy",
    sellPriceKey: "warriorSell",
  },
];

const MIN_PEASANTS = 1;

export function createEmptyTrade() {
  return {
    land: { buy: 0, sell: 0 },
    grain: { buy: 0, sell: 0 },
    peasants: { buy: 0, sell: 0 },
    warriors: { buy: 0, sell: 0 },
  };
}

export function normalizeTrade(trade) {
  const normalized = createEmptyTrade();
  for (const { id } of COMMODITIES) {
    const entry = trade?.[id] ?? {};
    normalized[id] = {
      buy: Math.max(0, Math.floor(entry.buy ?? 0)),
      sell: Math.max(0, Math.floor(entry.sell ?? 0)),
    };
  }
  return normalized;
}

function getPrice(prices, key) {
  return prices[key] ?? 0;
}

function tradeCost(prices, commodity, amount, mode) {
  const priceKey = mode === "buy" ? commodity.priceKey : commodity.sellPriceKey;
  return amount * getPrice(prices, priceKey);
}

export function getTradeSummary(state, trade) {
  const normalized = normalizeTrade(trade);
  let grainDelta = 0;
  let silverDelta = 0;
  const lines = [];

  for (const commodity of COMMODITIES) {
    const { buy, sell } = normalized[commodity.id];
    if (buy > 0) {
      const cost = tradeCost(state.prices, commodity, buy, "buy");
      if (commodity.currency === "grain") grainDelta -= cost;
      else silverDelta -= cost;
      lines.push({
        commodity: commodity.id,
        mode: "buy",
        amount: buy,
        cost,
        currency: commodity.currency,
      });
    }
    if (sell > 0) {
      const gain = tradeCost(state.prices, commodity, sell, "sell");
      if (commodity.currency === "grain") grainDelta += gain;
      else silverDelta += gain;
      lines.push({
        commodity: commodity.id,
        mode: "sell",
        amount: sell,
        gain,
        currency: commodity.currency,
      });
    }
  }

  return {
    normalized,
    grainDelta,
    silverDelta,
    grainAfter: state.grain + grainDelta,
    silverAfter: state.silver + silverDelta,
    lines,
  };
}

export function validateTrade(state, trade) {
  const normalized = normalizeTrade(trade);

  for (const commodity of COMMODITIES) {
    const { buy, sell } = normalized[commodity.id];
    if (buy > 0 && sell > 0) {
      return {
        ok: false,
        error: `Nie możesz jednocześnie kupować i sprzedawać: ${commodity.label.toLowerCase()}.`,
      };
    }
  }

  const summary = getTradeSummary(state, normalized);

  if (summary.grainAfter < 0) {
    return {
      ok: false,
      error: `Brakuje ${Math.abs(summary.grainAfter)} buszli zboża na ten handel.`,
    };
  }
  if (summary.silverAfter < 0) {
    return {
      ok: false,
      error: `Brakuje ${Math.abs(summary.silverAfter)} srebra w skarbcu na ten handel.`,
    };
  }

  const land = normalized.land;
  if (land.sell > state.acres) {
    return { ok: false, error: `Posiadasz tylko ${state.acres} akrów ziemi.` };
  }

  const grain = normalized.grain;
  if (grain.sell > state.grain) {
    return { ok: false, error: `W spichlerzu jest tylko ${state.grain} buszli zboża.` };
  }

  const peasants = normalized.peasants;
  if (peasants.sell > state.peasants - MIN_PEASANTS) {
    const maxSell = Math.max(0, state.peasants - MIN_PEASANTS);
    return {
      ok: false,
      error: `Możesz sprzedać najwyżej ${maxSell} chłopów (w mieście musi zostać co najmniej ${MIN_PEASANTS}).`,
    };
  }

  const warriors = normalized.warriors;
  if (warriors.sell > state.warriors) {
    return { ok: false, error: `Masz tylko ${state.warriors} wojowników.` };
  }

  return { ok: true, normalized, summary };
}

export function applyTrade(state, trade) {
  const validation = validateTrade(state, trade);
  if (!validation.ok) {
    return { state, events: [{ type: "error", text: validation.error }] };
  }

  const { summary } = validation;
  const events = [];

  let acres = state.acres;
  let grain = state.grain;
  let silver = state.silver;
  let peasants = state.peasants;
  let warriors = state.warriors;

  for (const line of summary.lines) {
    if (line.commodity === "land") {
      if (line.mode === "buy") {
        acres += line.amount;
        grain -= line.cost;
        events.push({
          type: "trade",
          text: `Kupiono ${line.amount} akrów za ${line.cost} buszli zboża.`,
        });
      } else {
        acres -= line.amount;
        grain += line.gain;
        events.push({
          type: "trade",
          text: `Sprzedano ${line.amount} akrów za ${line.gain} buszli zboża.`,
        });
      }
    }

    if (line.commodity === "grain") {
      if (line.mode === "buy") {
        grain += line.amount;
        silver -= line.cost;
        events.push({
          type: "trade",
          text: `Sprowadzono ${line.amount} buszli zboża za ${line.cost} srebra.`,
        });
      } else {
        grain -= line.amount;
        silver += line.gain;
        events.push({
          type: "trade",
          text: `Wywieziono ${line.amount} buszli zboża za ${line.gain} srebra.`,
        });
      }
    }

    if (line.commodity === "peasants") {
      if (line.mode === "buy") {
        peasants += line.amount;
        silver -= line.cost;
        events.push({
          type: "trade",
          text: `Przyjęto ${line.amount} chłopów za ${line.cost} srebra.`,
        });
      } else {
        peasants -= line.amount;
        silver += line.gain;
        events.push({
          type: "trade",
          text: `Wypędzono ${line.amount} chłopów, skarbiec zyskał ${line.gain} srebra.`,
        });
      }
    }

    if (line.commodity === "warriors") {
      if (line.mode === "buy") {
        warriors += line.amount;
        silver -= line.cost;
        events.push({
          type: "trade",
          text: `Zaciągnięto ${line.amount} wojowników za ${line.cost} srebra.`,
        });
      } else {
        warriors -= line.amount;
        silver += line.gain;
        events.push({
          type: "trade",
          text: `Rozwiązano ${line.amount} wojowników, skarbiec zyskał ${line.gain} srebra.`,
        });
      }
    }
  }

  return {
    state: {
      ...state,
      acres,
      grain,
      silver,
      peasants,
      warriors,
    },
    events,
  };
}
