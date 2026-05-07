import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DailyRecapCard from '@/components/explore/cards/DailyRecapCard';
import { DailyRecap } from '@/types/explore';

const baseRecap: DailyRecap = {
  id: '1',
  date: '2020-06-15T00:00:00.000Z',
  items: [
    { text: 'Bitcoin surged to new highs amid institutional buying.' },
    { text: 'Ethereum upgrade successfully deployed.' },
  ],
  crypto_assets: { bitcoin: 'BTC', ethereum: 'ETH' },
};

describe('DailyRecapCard', () => {
  it('renders the preview text from first item', () => {
    const { getByText } = render(<DailyRecapCard recap={baseRecap} />);
    expect(
      getByText('Bitcoin surged to new highs amid institutional buying.')
    ).toBeTruthy();
  });

  it('shows "No summaries available yet." when items array is empty', () => {
    const recap: DailyRecap = { ...baseRecap, items: [] };
    const { getByText } = render(<DailyRecapCard recap={recap} />);
    expect(getByText('No summaries available yet.')).toBeTruthy();
  });

  it('shows correct takeaway count for multiple items', () => {
    const { getByText } = render(<DailyRecapCard recap={baseRecap} />);
    expect(getByText(/2\s+takeaways/)).toBeTruthy();
  });

  it('shows singular "takeaway" for exactly one item', () => {
    const recap: DailyRecap = {
      ...baseRecap,
      items: [{ text: 'Only one summary.' }],
    };
    const { getByText } = render(<DailyRecapCard recap={recap} />);
    expect(getByText(/1\s+takeaway/)).toBeTruthy();
  });

  it('shows "99+" for more than 99 items', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ text: `Item ${i}` }));
    const recap: DailyRecap = { ...baseRecap, items };
    const { getByText } = render(<DailyRecapCard recap={recap} />);
    expect(getByText(/99\+/)).toBeTruthy();
  });

  it('renders crypto asset tags', () => {
    const { getByText } = render(<DailyRecapCard recap={baseRecap} />);
    expect(getByText('bitcoin')).toBeTruthy();
    expect(getByText('ethereum')).toBeTruthy();
  });

  it('limits crypto tags to 3', () => {
    const recap: DailyRecap = {
      ...baseRecap,
      crypto_assets: { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', cardano: 'ADA' },
    };
    const { queryByText } = render(<DailyRecapCard recap={recap} />);
    expect(queryByText('cardano')).toBeNull();
  });

  it('calls onPress with the recap when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <DailyRecapCard recap={baseRecap} onPress={onPress} />
    );
    fireEvent.press(
      getByText('Bitcoin surged to new highs amid institutional buying.')
    );
    expect(onPress).toHaveBeenCalledWith(baseRecap);
  });

  it('does not throw when onPress is not provided', () => {
    const { getByText } = render(<DailyRecapCard recap={baseRecap} />);
    expect(() =>
      fireEvent.press(
        getByText('Bitcoin surged to new highs amid institutional buying.')
      )
    ).not.toThrow();
  });

  it('renders "Today\'s Recap" for today\'s date', () => {
    const todayDate = new Date().toISOString();
    const recap: DailyRecap = { ...baseRecap, date: todayDate };
    const { getByText } = render(<DailyRecapCard recap={recap} />);
    expect(getByText("Today's Recap")).toBeTruthy();
  });
});
