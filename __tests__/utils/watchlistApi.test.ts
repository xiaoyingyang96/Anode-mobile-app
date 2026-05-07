import { watchlistApi } from '@/utils/watchlistApi';
import { Watchlist } from '@/types/watchlist';

const mockGetSession = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
    },
  },
}));

const mockWatchlists: Watchlist[] = [
  {
    id: 1,
    name: 'My Watchlist',
    assets_count: 3,
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    asset_tickers: [
      { ticker: 'BTC', name: 'Bitcoin' },
      { ticker: 'ETH', name: 'Ethereum' },
    ],
  },
];

const mockSession = { data: { session: { access_token: 'mock-token-123' } } };
const mockNoSession = { data: { session: null } };

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('watchlistApi.fetchAll', () => {
  it('returns watchlists on success', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWatchlists),
    });

    const result = await watchlistApi.fetchAll();
    expect(result).toEqual({ ok: true, data: mockWatchlists });
  });

  it('returns error when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(mockNoSession);

    const result = await watchlistApi.fetchAll();
    expect(result).toEqual({ ok: false, error: 'Not authenticated' });
  });

  it('returns error when HTTP response is not ok', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const result = await watchlistApi.fetchAll();
    expect(result).toEqual({ ok: false, error: 'HTTP 401' });
  });

  it('returns error when fetch throws', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

    const result = await watchlistApi.fetchAll();
    expect(result).toEqual({ ok: false, error: 'Network failure' });
  });

  it('sends Authorization header with bearer token', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await watchlistApi.fetchAll();

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer mock-token-123');
  });
});

describe('watchlistApi.create', () => {
  it('creates a watchlist and returns it', async () => {
    const newWatchlist: Watchlist = { ...mockWatchlists[0], id: 2, name: 'New List' };
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(newWatchlist)),
    });

    const result = await watchlistApi.create('New List');
    expect(result).toEqual({ ok: true, data: newWatchlist });
  });

  it('sends POST request with name in body', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockWatchlists[0])),
    });

    await watchlistApi.create('Test List');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ name: 'Test List' });
  });

  it('returns error when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(mockNoSession);

    const result = await watchlistApi.create('New');
    expect(result).toEqual({ ok: false, error: 'Not authenticated' });
  });
});

describe('watchlistApi.update', () => {
  it('returns ok on success', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    const result = await watchlistApi.update(1, { name: 'Updated', is_default: false });
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it('sends PUT request', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    await watchlistApi.update(1, { name: 'Updated', is_default: true });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.method).toBe('PUT');
  });

  it('returns error on failure', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await watchlistApi.update(999, { name: 'X', is_default: false });
    expect(result).toEqual({ ok: false, error: 'HTTP 404' });
  });
});

describe('watchlistApi.delete', () => {
  it('returns ok on success', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    const result = await watchlistApi.delete(1);
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it('sends DELETE request', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    await watchlistApi.delete(1);

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.method).toBe('DELETE');
  });

  it('returns error on failure', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

    const result = await watchlistApi.delete(1);
    expect(result).toEqual({ ok: false, error: 'HTTP 500' });
  });
});

describe('watchlistApi.addAssetsBatch', () => {
  it('returns ok on success', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    const result = await watchlistApi.addAssetsBatch(1, [
      { ticker: 'BTC', name: 'Bitcoin' },
    ]);
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it('returns error when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(mockNoSession);

    const result = await watchlistApi.addAssetsBatch(1, []);
    expect(result).toEqual({ ok: false, error: 'Not authenticated' });
  });
});

describe('watchlistApi.removeAsset', () => {
  it('returns ok on success', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    const result = await watchlistApi.removeAsset(1, 'BTC');
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it('uppercases the ticker in the URL', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    await watchlistApi.removeAsset(1, 'btc');

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/BTC');
  });
});
