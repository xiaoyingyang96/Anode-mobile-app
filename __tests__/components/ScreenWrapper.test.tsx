import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ScreenWrapper } from '@/components/ScreenWrapper';

describe('ScreenWrapper', () => {
  it('renders children without scroll', () => {
    const { getByText } = render(
      <ScreenWrapper>
        <Text>Screen content</Text>
      </ScreenWrapper>
    );
    expect(getByText('Screen content')).toBeTruthy();
  });

  it('renders children with scroll enabled', () => {
    const { getByText } = render(
      <ScreenWrapper scroll>
        <Text>Scrollable content</Text>
      </ScreenWrapper>
    );
    expect(getByText('Scrollable content')).toBeTruthy();
  });

  it('renders multiple children', () => {
    const { getByText } = render(
      <ScreenWrapper>
        <Text>First</Text>
        <Text>Second</Text>
      </ScreenWrapper>
    );
    expect(getByText('First')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
  });
});
