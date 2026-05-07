import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useTopStories } from '@/hooks/useTopStories';

const mockNews = [
  {
    id: '1',
    title: 'Bitcoin up 10%',
    summary: 'BTC surges.',
    publisher: 'CryptoNews',
    published_at: '2024-01-01T00:00:00Z',
    url: 'https://example.com/1',
  },
  {
    id: '2',
    title: 'Ethereum upgrade live',
    summary: 'ETH 2.0.',
    publisher: 'BlockNews',
    published_at: '2024-01-02T00:00:00Z',
    url: 'https://example.com/2',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('useTopStories', () => {
  it('starts with isLoading true', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    const { result } = renderHook(() => useTopStories());
    expect(result.current.isLoading).toBe(true);
  });

  it('fetches news on mount and sets isLoading false', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNews),
    });

    const { result } = renderHook(() => useTopStories());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.news).toEqual(mockNews);
    expect(result.current.hasMore).toBe(true);
  });

  it('sets hasMore to false when empty array returned', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { result } = renderHook(() => useTopStories());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasMore).toBe(false);
  });

  it('handles fetch error gracefully and keeps news empty', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTopStories());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.news).toEqual([]);
  });

  it('handles non-ok HTTP response gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useTopStories());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.news).toEqual([]);
  });

  it('fetches next page via loadMore and appends results', async () => {
    const page2 = [
      {
        id: '3',
        title: 'Page 2 news',
        summary: '',
        publisher: '',
        published_at: '',
        url: '',
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockNews) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(page2) });

    const { result } = renderHook(() => useTopStories());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.isLoadingMore).toBe(false));

    expect(result.current.news).toEqual([...mockNews, ...page2]);
  });

  it('does not call loadMore when isLoadingMore is true', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNews),
    });

    const { result } = renderHook(() => useTopStories());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // loadMore with hasMore=true, called twice rapidly — fetch should only be called once more
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => new Promise(() => {}), // never resolves
    });

    act(() => result.current.loadMore());
    act(() => result.current.loadMore()); // should be ignored

    expect(global.fetch).toHaveBeenCalledTimes(2); // initial + 1 loadMore
  });
});
