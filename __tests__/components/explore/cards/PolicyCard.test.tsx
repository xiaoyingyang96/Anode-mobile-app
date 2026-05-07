import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PolicyCard from '@/components/explore/cards/PolicyCard';
import { GovernmentPolicy } from '@/types/explore';

const basePolicy: GovernmentPolicy = {
  id: '1',
  title: 'Digital Assets Regulatory Framework',
  agency_short: 'SEC',
  agency_long: 'Securities and Exchange Commission',
  region: 'US',
  published_at: '2024-01-15T00:00:00.000Z',
};

describe('PolicyCard', () => {
  it('renders the policy title', () => {
    const { getByText } = render(<PolicyCard policy={basePolicy} />);
    expect(getByText('Digital Assets Regulatory Framework')).toBeTruthy();
  });

  it('renders the agency short name', () => {
    const { getByText } = render(<PolicyCard policy={basePolicy} />);
    expect(getByText(/SEC/)).toBeTruthy();
  });

  it('renders the region', () => {
    const { getByText } = render(<PolicyCard policy={basePolicy} />);
    expect(getByText(/US/)).toBeTruthy();
  });

  it('renders agency_long when agency_short is not provided', () => {
    const policy: GovernmentPolicy = {
      ...basePolicy,
      agency_short: undefined,
    };
    const { getByText } = render(<PolicyCard policy={policy} />);
    expect(getByText(/Securities and Exchange Commission/)).toBeTruthy();
  });

  it('calls onPress with the policy when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PolicyCard policy={basePolicy} onPress={onPress} />
    );
    fireEvent.press(getByText('Digital Assets Regulatory Framework'));
    expect(onPress).toHaveBeenCalledWith(basePolicy);
  });

  it('does not throw when onPress is not provided', () => {
    const { getByText } = render(<PolicyCard policy={basePolicy} />);
    expect(() =>
      fireEvent.press(getByText('Digital Assets Regulatory Framework'))
    ).not.toThrow();
  });

  it('renders without meta when all optional fields are absent', () => {
    const policy: GovernmentPolicy = {
      id: '2',
      title: 'Minimal Policy',
    };
    const { getByText } = render(<PolicyCard policy={policy} />);
    expect(getByText('Minimal Policy')).toBeTruthy();
  });
});
