import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NewsCard from '@/components/explore/cards/NewsCard';
import { NewsStory } from '@/types/explore';

jest.mock('@/components/explore/TokenIcon', () => () => null);

const baseStory: NewsStory = {
  id: '1',
  title: 'Bitcoin hits new all-time high',
  publisher: 'CryptoNews',
  published_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  naive_class: 1,
  tags: ['Bitcoin', 'Markets'],
  crypto_assets: { bitcoin: 'BTC', ethereum: 'ETH' },
};

describe('NewsCard', () => {
  it('renders the story title', () => {
    const { getByText } = render(<NewsCard story={baseStory} />);
    expect(getByText('Bitcoin hits new all-time high')).toBeTruthy();
  });

  it('renders the publisher name', () => {
    const { getByText } = render(<NewsCard story={baseStory} />);
    expect(getByText(/CryptoNews/)).toBeTruthy();
  });

  it('renders tags', () => {
    const { getByText } = render(<NewsCard story={baseStory} />);
    expect(getByText('Bitcoin')).toBeTruthy();
    expect(getByText('Markets')).toBeTruthy();
  });

  it('calls onPress with the story when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <NewsCard story={baseStory} onPress={onPress} />
    );
    fireEvent.press(getByText('Bitcoin hits new all-time high'));
    expect(onPress).toHaveBeenCalledWith(baseStory);
  });

  it('does not throw when onPress is not provided', () => {
    const { getByText } = render(<NewsCard story={baseStory} />);
    expect(() =>
      fireEvent.press(getByText('Bitcoin hits new all-time high'))
    ).not.toThrow();
  });

  it('renders without tags when tags array is empty', () => {
    const story: NewsStory = { ...baseStory, tags: [] };
    const { getByText } = render(<NewsCard story={story} />);
    expect(getByText('Bitcoin hits new all-time high')).toBeTruthy();
  });

  it('renders without publisher and time when missing', () => {
    const story: NewsStory = {
      id: '2',
      title: 'Minimal story',
    };
    const { getByText } = render(<NewsCard story={story} />);
    expect(getByText('Minimal story')).toBeTruthy();
  });

  it('limits displayed tags to 2', () => {
    const story: NewsStory = {
      ...baseStory,
      tags: ['Tag1', 'Tag2', 'Tag3'],
    };
    const { getByText, queryByText } = render(<NewsCard story={story} />);
    expect(getByText('Tag1')).toBeTruthy();
    expect(getByText('Tag2')).toBeTruthy();
    expect(queryByText('Tag3')).toBeNull();
  });
});
