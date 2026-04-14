import { supabase } from '@/lib/supabase';
import { AssetTicker, Watchlist } from '@/types/watchlist';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE) {
  console.warn('[watchlistApi] EXPO_PUBLIC_API_URL is not set. API calls will fail.');
}

type ApiResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export const watchlistApi = {
  async fetchAll(): Promise<ApiResult<Watchlist[]>> {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/api/users/watchlist`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Watchlist[] = await res.json();
      return { ok: true, data };
    } catch (e: any) {
      return { ok: false, error: e.message ?? 'Failed to fetch watchlists' };
    }
  },

  // async create(name: string): Promise<ApiResult<Watchlist>> {
  //   try {
  //     const headers = await authHeaders();
  //     const res = await fetch(`${API_BASE}/api/users/watchlist`, {
  //       method: 'POST',
  //       headers,
  //       body: JSON.stringify({ name }),
  //     });
  //     if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //     const data: Watchlist = await res.json();
  //     return { ok: true, data };
  //   } catch (e: any) {
  //     return { ok: false, error: e.message ?? 'Failed to create watchlist' };
  //   }
  // },
  async create(name: string): Promise<ApiResult<Watchlist>> {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/api/users/watchlist`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name }),
      });
      const responseText = await res.text();
      console.log('create response:', responseText);  // 加这行
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Watchlist = JSON.parse(responseText);
      return { ok: true, data };
    } catch (e: any) {
      return { ok: false, error: e.message ?? 'Failed to create watchlist' };
    }
  },
  async update(id: number, payload: { name: string; is_default: boolean }): Promise<ApiResult> {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/api/users/watchlist/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, data: undefined };
    } catch (e: any) {
      return { ok: false, error: e.message ?? 'Failed to update watchlist' };
    }
  },

  async delete(id: number): Promise<ApiResult> {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/api/users/watchlist/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, data: undefined };
    } catch (e: any) {
      return { ok: false, error: e.message ?? 'Failed to delete watchlist' };
    }
  },

  async duplicate(watchlist: Watchlist): Promise<ApiResult<Watchlist>> {
    const createResult = await watchlistApi.create(`${watchlist.name} (Copy)`);
    if (!createResult.ok) return createResult;

    if (watchlist.asset_tickers.length > 0) {
      const addResult = await watchlistApi.addAssetsBatch(
        createResult.data.id,
        watchlist.asset_tickers,
      );
      if (!addResult.ok) return { ok: false, error: addResult.error };
    }

    return { ok: true, data: createResult.data };
  },

  async addAssetsBatch(watchlistId: number, assets: AssetTicker[]): Promise<ApiResult> {
    try {
      const headers = await authHeaders();
      const res = await fetch(
        `${API_BASE}/api/users/watchlist/${watchlistId}/assets/batch`,
        { method: 'POST', headers, body: JSON.stringify({ assets }) },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, data: undefined };
    } catch (e: any) {
      return { ok: false, error: e.message ?? 'Failed to add assets' };
    }
  },

  async removeAsset(watchlistId: number, ticker: string): Promise<ApiResult> {
    try {
      const headers = await authHeaders();
      const res = await fetch(
        `${API_BASE}/api/users/watchlist/${watchlistId}/assets/${ticker}`,
        { method: 'DELETE', headers },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, data: undefined };
    } catch (e: any) {
      return { ok: false, error: e.message ?? 'Failed to remove asset' };
    }
  },

  async fetchOHLCV(tickers: string[]): Promise<ApiResult<any>> {
    try {
      const headers = await authHeaders();
      const q = tickers.join(',');
      const res = await fetch(
        `${API_BASE}/api/users/watchlist-details/ohlcv?tickers=${q}&ranges=1d`,
        { headers },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { ok: true, data };
    } catch (e: any) {
      return { ok: false, error: e.message ?? 'Failed to fetch price data' };
    }
  },

  async fetchStories(tickers: string[]): Promise<ApiResult<any>> {
    try {
      const headers = await authHeaders();
      const q = tickers.join(',');
      const res = await fetch(
        `${API_BASE}/api/users/watchlist-details/stories?tickers=${q}`,
        { headers },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { ok: true, data };
    } catch (e: any) {
      return { ok: false, error: e.message ?? 'Failed to fetch stories' };
    }
  },
};
