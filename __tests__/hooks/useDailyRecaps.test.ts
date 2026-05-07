import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useDailyRecaps } from '@/hooks/useDailyRecaps';

const mockRecaps = [
  {
    date: '2024-01-01',
    items: [{ text: 'BTC recap.', sources: [] }],
    crypto_assets: { bitcoin: 'BTC' },
  },
  {
    date: '2024-01-02',
    items: [{ text: 'ETH recap.', sources: [] }],
    crypto_assets: { ethereum: 'ETH' },
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('useDailyRecaps', () => {
  it('starts with isLoading true', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    const { result } = renderHook(() => useDailyRecaps());
    expect(result.current.isLoading).toBe(true);
  });

  it('fetches recaps on mount and sets isLoading false', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRecaps),
    });

    const { result } = renderHook(() => useDailyRecaps());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.recaps).toEqual(mockRecaps);
    expect(result.current.error).toBeNull();
  });

  it('sets hasMore to false when empty array returned', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { result } = renderHook(() => useDailyRecaps());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasMore).toBe(false);
  });

  it('sets error and empty recaps when fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection refused'));

    const { result } = renderHook(() => useDailyRecaps());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Connection refused');
    expect(result.current.recaps).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });

  it('sets error when HTTP response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useDailyRecaps());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('HTTP 404');
  });

  it('retry re-fetches data', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Initial failure'))
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRecaps) });

    const { result } = renderHook(() => useDailyRecaps());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeTruthy();

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.recaps).toEqual(mockRecaps);
  });

  it('loadMore appends results from next page', async () => {
    const page2 = [
      { date: '2024-01-03', items: [{ text: 'SOL recap.', sources: [] }], crypto_assets: {} },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRecaps) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(page2) });

    const { result } = renderHook(() => useDailyRecaps());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.isLoadingMore).toBe(false));

    expect(result.current.recaps).toEqual([...mockRecaps, ...page2]);
  });
});
