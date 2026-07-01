// Handel — kupno i sprzedaż czterech dóbr wyłącznie za srebro.
// Cena zakupu jest zawsze wyższa niż cena sprzedaży.

export const COMMODITIES = [
  {
    id: "land",
    label: "Ziemia",
    unit: "akr",
    stockKey: "acres",
    buyKey: "landBuy",
    sellKey: "landSell",
  },
  {
    id: "grain",
    label: "Zboże",
    unit: "buszli",
    stockKey: "grain",
    buyKey: "grainBuy",
    sellKey: "grainSell",
  },
  {
    id: "peasants",
    label: "Chłopi",
    unit: "os.",
    stockKey: "peasants",
    buyKey: "peasantBuy",
    sellKey: "peasantSell",
  },
  {
    id: "warriors",
    label: "Wojowie",
    unit: "os.",
    stockKey: "warriors",
    buyKey: "warriorBuy",
    sellKey: "warriorSell",
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
  const key = mode === "buy" ? commodity.buyKey : commodity.sellKey;
  return amount * getPrice(prices, key);
}

export function getMaxBuy(state, commodity) {
  const price = getPrice(state.prices, commodity.buyKey);
  return price > 0 ? Math.floor(state.silver / price) : 0;
}

export function getMaxSell(state, commodity) {
  const stock = state[commodity.stockKey] ?? 0;
  if (commodity.id === "peasants") {
    return Math.max(0, stock - MIN_PEASANTS);
  }
  return stock;
}

export function getTradeSummary(state, trade) {
  const normalized = normalizeTrade(trade);
  let silverDelta = 0;
  const lines = [];

  for (const commodity of COMMODITIES) {
    const { buy, sell } = normalized[commodity.id];
    if (buy > 0) {
      const cost = tradeCost(state.prices, commodity, buy, "buy");
      silverDelta -= cost;
      lines.push({ commodity: commodity.id, mode: "buy", amount: buy, silver: cost });
    }
    if (sell > 0) {
      const gain = tradeCost(state.prices, commodity, sell, "sell");
      silverDelta += gain;
      lines.push({ commodity: commodity.id, mode: "sell", amount: sell, silver: gain });
    }
  }

  return {
    normalized,
    silverDelta,
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
    if (sell > getMaxSell(state, commodity)) {
      return { ok: false, error: `Za mało ${commodity.label.toLowerCase()} do sprzedaży.` };
    }
    if (buy > getMaxBuy(state, commodity)) {
      return { ok: false, error: `Za mało srebra na zakup ${commodity.label.toLowerCase()}.` };
    }
  }

  const summary = getTradeSummary(state, normalized);
  if (summary.silverAfter < 0) {
    return {
      ok: false,
      error: `Brakuje ${Math.abs(summary.silverAfter)} srebra w skarbcu.`,
    };
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
  const next = { ...state };

  for (const line of summary.lines) {
    const commodity = COMMODITIES.find((c) => c.id === line.commodity);
    if (!commodity) continue;

    if (line.mode === "buy") {
      next[commodity.stockKey] += line.amount;
      next.silver -= line.silver;
      events.push({
        type: "trade",
        text: `Kupiono ${line.amount} ${commodity.unit} ${commodity.label.toLowerCase()} za ${line.silver} srebra.`,
      });
    } else {
      next[commodity.stockKey] -= line.amount;
      next.silver += line.silver;
      events.push({
        type: "trade",
        text: `Sprzedano ${line.amount} ${commodity.unit} ${commodity.label.toLowerCase()} za ${line.silver} srebra.`,
      });
    }
  }

  return { state: next, events };
}
