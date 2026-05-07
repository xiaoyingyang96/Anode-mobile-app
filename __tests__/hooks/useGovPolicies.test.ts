import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useGovPolicies } from '@/hooks/useGovPolicies';

const mockPolicies = [
  {
    id: '1',
    title: 'Crypto Regulation Act',
    content: 'Details...',
    agency_short: 'SEC',
    agency_long: 'Securities and Exchange Commission',
    region: 'US',
    tags: ['crypto', 'regulation'],
    published_at: '2024-01-01T00:00:00Z',
    url: 'https://example.com/policy/1',
  },
  {
    id: '2',
    title: 'Digital Assets Framework',
    content: 'More details...',
    agency_short: 'CFTC',
    agency_long: 'Commodity Futures Trading Commission',
    region: 'US',
    tags: ['digital assets'],
    published_at: '2024-01-02T00:00:00Z',
    url: 'https://example.com/policy/2',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('useGovPolicies', () => {
  it('starts with isLoading true', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    const { result } = renderHook(() => useGovPolicies());
    expect(result.current.isLoading).toBe(true);
  });

  it('fetches policies on mount and sets isLoading false', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPolicies),
    });

    const { result } = renderHook(() => useGovPolicies());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.govPolicies).toEqual(mockPolicies);
    expect(result.current.hasMore).toBe(true);
  });

  it('sets hasMore to false when empty array returned', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { result } = renderHook(() => useGovPolicies());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasMore).toBe(false);
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGovPolicies());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.govPolicies).toEqual([]);
  });

  it('handles non-ok HTTP response gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
    });

    const { result } = renderHook(() => useGovPolicies());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.govPolicies).toEqual([]);
  });

  it('loadMore appends policies from next page', async () => {
    const page2 = [
      {
        id: '3',
        title: 'Stablecoin Act',
        content: '',
        agency_short: 'FED',
        agency_long: 'Federal Reserve',
        region: 'US',
        tags: [],
        published_at: '2024-01-03T00:00:00Z',
        url: '',
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPolicies) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(page2) });

    const { result } = renderHook(() => useGovPolicies());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.isLoadingMore).toBe(false));

    expect(result.current.govPolicies).toEqual([...mockPolicies, ...page2]);
  });
});
