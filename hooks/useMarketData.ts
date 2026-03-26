import { useCallback, useEffect, useState } from "react";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export type AssetRow = {
  symbol: string;
  name?: string;
  price: number;
  changePct: number;
};

type OHLCVPoint = {
  datetime: string;
  close: number;
};

type AssetSeries = {
  asset_id: string;
  name?: string;
  ohlcv: OHLCVPoint[];
};

type MarketResponse = {
  crypto?: AssetSeries[];
  us_stock?: AssetSeries[];
};

export function useMarketData(range = "1d") {
  const [rows, setRows] = useState<AssetRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/product/markets/graph-data?range=${range}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: MarketResponse = await res.json();

      const series = data.crypto ?? [];
      const parsed: AssetRow[] = series
        .map((s) => {
          const points = s.ohlcv ?? [];
          if (!points.length) return null;
          const sorted = [...points].sort(
            (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
          );
          const first = sorted[0];
          const last = sorted[sorted.length - 1];
          const changePct =
            first.close === 0
              ? 0
              : ((last.close - first.close) / first.close) * 100;
          return {
            symbol: s.asset_id,
            name: s.name,
            price: last.close,
            changePct,
          };
        })
        .filter(Boolean) as AssetRow[];

      setRows(parsed);
    } catch (e: any) {
      setError(e.message ?? "Failed to load market data");
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rows, isLoading, error, refetch: fetchData };
}