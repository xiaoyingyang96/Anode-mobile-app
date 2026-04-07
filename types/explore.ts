export type MobileSectionId = 'assets' | 'top_stories' | 'daily_recaps' | 'policy_updates';

export type ListMode = 'Top Assets' | 'Watchlist' | 'US Stock';

export type MarketOverviewData = {
  total_market_cap: number;
  total_market_cap_change_24h: number;
  total_volume_24h: number;
  total_volume_24h_change: number;
  bitcoin_dominance: number;
  bitcoin_dominance_24h_change: number;
  ethereum_dominance: number;
  ethereum_dominance_24h_change: number;
  last_updated: string;
};

export type AssetRow = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
};

export type AssetPriceSeries = {
  asset_id: string;
  name: string;
  ohlcv: Array<{
    datetime: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
};

export type MarketGraphResponse = {
  crypto: AssetPriceSeries[];
  us_stock: AssetPriceSeries[];
};

export type NewsStory = {
  id: string | number;
  title: string;
  url?: string;
  image_url?: string | null;
  summary?: string;
  naive_class?: number; // -1 negative, 0 neutral, 1 positive
  published_at?: string;
  publisher?: string;
  sources?: string[];
  tags?: string[];
  takeaways?: string[];
  /** key = full name (e.g. "bitcoin"), value = ticker symbol (e.g. "BTC") */
  crypto_assets?: Record<string, string>;
  trad_assets?: Record<string, string>;
};

export type DailyRecapItem = { text: string };

export type DailyRecap = {
  id: string | number;
  date: string;
  items: DailyRecapItem[];
  crypto_assets?: Record<string, unknown>;
};

export type GovernmentPolicy = {
  id: string | number;
  title: string;
  agency_short?: string;
  agency_long?: string;
  region?: string;
  published_at?: string;
};

export type CoinbaseTicker = {
  pid: string;
  price: number;
  change24hPct: number;
};
