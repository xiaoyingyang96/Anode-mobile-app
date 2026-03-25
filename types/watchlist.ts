export type AssetTicker = {
  ticker: string;
  name: string;
};

export interface Watchlist {
  id: number;
  name: string;
  assets_count: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  asset_tickers: AssetTicker[];
}

export interface CryptoPriceData {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adj_close: number;
  volume: number;
}

export interface WatchlistOHLCVData {
  ticker: string;
  asset_pair: string;
  name: string;
  price_data: { '1d'?: CryptoPriceData[] };
}

export interface WatchlistOHLCVResponse {
  data: WatchlistOHLCVData[];
  missing_tickers: { asset: string; range_missing: string[] }[];
  unsupported_tickers: string[];
}

export interface NewsStory {
  id: string | number;
  title: string;
  summary?: string;
  image_url?: string;
  publisher?: string;
  published_at?: string;
  naive_class?: -1 | 0 | 1;
  crypto_assets?: Record<string, unknown>;
  url?: string;
}

export interface WatchlistAssetStories {
  ticker: string;
  name: string;
  related_stories: NewsStory[];
}

export interface WatchlistStoriesResponse {
  data: WatchlistAssetStories[];
  unsupported_tickers: string[];
}

export type Row = {
  ticker: string;
  name: string;
  series: CryptoPriceData[];
  price: number;
  prevClose: number;
  changePct: number;
  open24h: number;
  high24h: number;
  low24h: number;
  asset_pair?: string;
};
