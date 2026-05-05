const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type MarketBar = {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adj_close: number;
  volume: number;
};

type MarketSeries = {
  asset_id: string;
  name?: string;
  ohlcv: MarketBar[];
};

type MarketGraphResponse = {
  crypto?: MarketSeries[];
};

type OpenAIResponse = {
  output_text?: string;
  model?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-5.4-mini";

const PRICE_WORDS = [
  "price",
  "trading",
  "trade",
  "worth",
  "cost",
  "quote",
  "latest",
  "current",
  "today",
  "doing",
  "valued",
];

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "be",
  "for",
  "get",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "of",
  "on",
  "price",
  "show",
  "tell",
  "the",
  "today",
  "trade",
  "trading",
  "value",
  "what",
  "whats",
  "worth",
]);

const SYMBOL_ALIASES: Record<string, string> = {
  bitcoin: "BTC",
  btc: "BTC",
  ethereum: "ETH",
  eth: "ETH",
  solana: "SOL",
  sol: "SOL",
  ripple: "XRP",
  xrp: "XRP",
  dogecoin: "DOGE",
  doge: "DOGE",
  avalanche: "AVAX",
  avax: "AVAX",
  aave: "AAVE",
  chainlink: "LINK",
  link: "LINK",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeAssetId(symbol: string): string {
  const trimmed = symbol.trim().toUpperCase();
  if (!trimmed) throw new Error("Symbol is required.");
  return trimmed.includes("-") ? trimmed : `${trimmed}-USD`;
}

function sortBarsAscending(bars: MarketBar[]): MarketBar[] {
  return [...bars].sort(
    (a, b) =>
      new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );
}

function extractPriceSymbol(message: string): string | null {
  const normalized = message.trim().toLowerCase();
  if (!normalized) return null;

  const hasPriceIntent = PRICE_WORDS.some((word) => normalized.includes(word));
  if (!hasPriceIntent) return null;

  const tokens = normalized.match(/[a-z0-9-]+/g) ?? [];
  for (const token of tokens) {
    if (SYMBOL_ALIASES[token]) return SYMBOL_ALIASES[token];
    if (/^[a-z]{2,10}-usd$/.test(token)) {
      return token.replace(/-usd$/, "").toUpperCase();
    }
    if (/^[a-z]{2,10}$/.test(token) && !STOP_WORDS.has(token)) {
      const upper = token.toUpperCase();
      if (upper.length <= 5) return upper;
    }
  }

  return null;
}

async function fetchPriceContext(symbol: string) {
  const assetId = normalizeAssetId(symbol);
  const upstreamUrl =
    `https://pinkpenguin.anode.news/api/product/markets/graph-data?range=1d&tickers=${encodeURIComponent(
      assetId
    )}`;

  const upstreamRes = await fetch(upstreamUrl);
  if (!upstreamRes.ok) {
    throw new Error(`Price upstream failed with HTTP ${upstreamRes.status}.`);
  }

  const payload = (await upstreamRes.json()) as MarketGraphResponse;
  const series = (payload.crypto ?? []).find((item) => item.asset_id === assetId);
  if (!series) {
    throw new Error(`Symbol ${assetId} was not found in upstream market data.`);
  }

  const bars = sortBarsAscending(series.ohlcv ?? []);
  if (!bars.length) {
    throw new Error(`No price history returned for ${assetId}.`);
  }

  const first = bars[0];
  const last = bars[bars.length - 1];
  const changePct =
    first.close === 0 ? 0 : ((last.close - first.close) / first.close) * 100;

  return {
    symbol: assetId.replace(/-USD$/, ""),
    assetId,
    name: series.name ?? null,
    price: last.close,
    currency: "USD",
    high: Math.max(...bars.map((bar) => bar.high)),
    low: Math.min(...bars.map((bar) => bar.low)),
    changePct,
    asOf: last.datetime,
    source: "pinkpenguin.anode.news",
  };
}

function buildSystemPrompt() {
  return [
    "You are Anode Assistant, a concise crypto market assistant.",
    "Answer clearly and briefly.",
    "If live price context is provided, treat it as the source of truth.",
    "Do not invent prices or market facts.",
    "If price context is missing for a price question, say you could not retrieve the latest price.",
    "Do not provide financial advice.",
  ].join(" ");
}

function buildUserInput(message: string, priceContext: unknown | null) {
  if (!priceContext) return `User message: ${message}`;
  return [
    `User message: ${message}`,
    "Live market context:",
    JSON.stringify(priceContext),
    "Use the live market context when answering.",
  ].join("\n");
}

function extractOpenAIText(response: OpenAIResponse): string {
  if (response.output_text?.trim()) {
    return response.output_text.trim();
  }

  const parts =
    response.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text" || item.type === "text")
      .map((item) => item.text?.trim())
      .filter((item): item is string => Boolean(item)) ?? [];

  return parts.join("\n").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Use POST for this endpoint.",
      },
    });
  }

  if (!OPENAI_API_KEY) {
    return json(500, {
      error: {
        code: "OPENAI_API_KEY_MISSING",
        message: "OPENAI_API_KEY is not configured for chatbot_assistant.",
      },
    });
  }

  try {
    const { message } = await req.json();
    const userMessage = String(message ?? "").trim();
    if (!userMessage) {
      return json(400, {
        error: {
          code: "INVALID_MESSAGE",
          message: "Message is required.",
        },
      });
    }

    let priceContext: unknown | null = null;
    const priceSymbol = extractPriceSymbol(userMessage);
    if (priceSymbol) {
      try {
        priceContext = await fetchPriceContext(priceSymbol);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Price lookup failed.";
        priceContext = { error: message, symbol: priceSymbol };
      }
    }

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: buildSystemPrompt(),
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildUserInput(userMessage, priceContext),
              },
            ],
          },
        ],
      }),
    });

    const openaiData = (await openaiRes.json()) as OpenAIResponse & {
      error?: { message?: string };
    };

    if (!openaiRes.ok) {
      console.error(
        "OPENAI_UPSTREAM_ERROR",
        JSON.stringify({
          status: openaiRes.status,
          body: openaiData,
          model: OPENAI_MODEL,
        })
      );
      return json(502, {
        error: {
          code: "OPENAI_UPSTREAM_ERROR",
          message:
            openaiData?.error?.message ??
            `OpenAI request failed with HTTP ${openaiRes.status}.`,
        },
      });
    }

    const reply = extractOpenAIText(openaiData);
    if (!reply) {
      console.error(
        "EMPTY_OPENAI_RESPONSE",
        JSON.stringify({
          body: openaiData,
          model: OPENAI_MODEL,
        })
      );
      return json(502, {
        error: {
          code: "EMPTY_OPENAI_RESPONSE",
          message: "OpenAI returned an empty response.",
        },
      });
    }

    return json(200, {
      reply,
      source: "openai",
      model: openaiData.model ?? OPENAI_MODEL,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json(500, {
      error: {
        code: "INTERNAL_ERROR",
        message,
      },
    });
  }
});
