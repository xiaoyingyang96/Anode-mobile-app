import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Collapsible } from '@/components/ui/collapsible';

jest.mock('@/components/ui/icon-symbol', () => ({
  IconSymbol: () => null,
}));
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

describe('Collapsible', () => {
  it('renders the title', () => {
    const { getByText } = render(
      <Collapsible title="My Section">
        <Text>Hidden content</Text>
      </Collapsible>
    );
    expect(getByText('My Section')).toBeTruthy();
  });

  it('hides children by default', () => {
    const { queryByText } = render(
      <Collapsible title="My Section">
        <Text>Hidden content</Text>
      </Collapsible>
    );
    expect(queryByText('Hidden content')).toBeNull();
  });

  it('shows children after pressing the header', () => {
    const { UNSAFE_getByType, queryByText } = render(
      <Collapsible title="My Section">
        <Text>Hidden content</Text>
      </Collapsible>
    );
    fireEvent.press(UNSAFE_getByType(TouchableOpacity));
    expect(queryByText('Hidden content')).toBeTruthy();
  });

  it('hides children again after pressing twice', () => {
    const { UNSAFE_getByType, queryByText } = render(
      <Collapsible title="My Section">
        <Text>Hidden content</Text>
      </Collapsible>
    );
    fireEvent.press(UNSAFE_getByType(TouchableOpacity));
    fireEvent.press(UNSAFE_getByType(TouchableOpacity));
    expect(queryByText('Hidden content')).toBeNull();
  });
});
