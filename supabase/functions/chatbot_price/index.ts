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

  try {
    const { symbol } = await req.json();
    const assetId = normalizeAssetId(String(symbol ?? ""));
    const upstreamUrl =
      `https://pinkpenguin.anode.news/api/product/markets/graph-data?range=1d&tickers=${encodeURIComponent(
        assetId
      )}`;

    const upstreamRes = await fetch(upstreamUrl);
    if (!upstreamRes.ok) {
      return json(502, {
        error: {
          code: "UPSTREAM_ERROR",
          message: `Price upstream failed with HTTP ${upstreamRes.status}.`,
        },
      });
    }

    const payload = (await upstreamRes.json()) as MarketGraphResponse;
    const series = (payload.crypto ?? []).find((item) => item.asset_id === assetId);

    if (!series) {
      return json(404, {
        error: {
          code: "SYMBOL_NOT_FOUND",
          message: `Symbol ${assetId} was not found in upstream market data.`,
        },
      });
    }

    const bars = sortBarsAscending(series.ohlcv ?? []);
    if (!bars.length) {
      return json(404, {
        error: {
          code: "NO_PRICE_HISTORY",
          message: `No price history returned for ${assetId}.`,
        },
      });
    }

    const first = bars[0];
    const last = bars[bars.length - 1];
    const changePct =
      first.close === 0 ? 0 : ((last.close - first.close) / first.close) * 100;

    return json(200, {
      symbol: assetId.replace(/-USD$/, ""),
      assetId,
      name: series.name ?? null,
      price: last.close,
      currency: "USD",
      open: first.open,
      high: Math.max(...bars.map((bar) => bar.high)),
      low: Math.min(...bars.map((bar) => bar.low)),
      close: last.close,
      changePct,
      asOf: last.datetime,
      source: "pinkpenguin.anode.news",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const code = message === "Symbol is required." ? "INVALID_SYMBOL" : "INTERNAL_ERROR";

    return json(code === "INVALID_SYMBOL" ? 400 : 500, {
      error: {
        code,
        message,
      },
    });
  }
});
