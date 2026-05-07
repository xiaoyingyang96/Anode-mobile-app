import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TokenIcon from '@/components/explore/TokenIcon';

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Image: ({ onError, style }: any) =>
      React.createElement(View, { testID: 'token-image', onError, style }),
  };
});

describe('TokenIcon', () => {
  it('renders the image initially', () => {
    const { getByTestId } = render(<TokenIcon symbol="BTC" />);
    expect(getByTestId('token-image')).toBeTruthy();
  });

  it('shows fallback initials when image errors', () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <TokenIcon symbol="BTC" size={20} />
    );
    fireEvent(getByTestId('token-image'), 'error');
    expect(queryByTestId('token-image')).toBeNull();
    expect(getByText('BTC')).toBeTruthy();
  });

  it('trims -USD suffix from symbol for fallback initials', () => {
    const { getByTestId, getByText } = render(
      <TokenIcon symbol="BTC-USD" size={20} />
    );
    fireEvent(getByTestId('token-image'), 'error');
    expect(getByText('BTC')).toBeTruthy();
  });

  it('slices initials to max 3 characters', () => {
    const { getByTestId, getByText } = render(
      <TokenIcon symbol="SHIBA" size={20} />
    );
    fireEvent(getByTestId('token-image'), 'error');
    expect(getByText('SHI')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { getByTestId } = render(<TokenIcon symbol="ETH" size={32} />);
    expect(getByTestId('token-image')).toBeTruthy();
  });
});
