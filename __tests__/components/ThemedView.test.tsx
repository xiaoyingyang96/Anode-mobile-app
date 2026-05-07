import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ThemedView } from '@/components/themed-view';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

describe('ThemedView', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ThemedView>
        <Text>Inner content</Text>
      </ThemedView>
    );
    expect(getByText('Inner content')).toBeTruthy();
  });

  it('renders multiple children', () => {
    const { getByText } = render(
      <ThemedView>
        <Text>First</Text>
        <Text>Second</Text>
      </ThemedView>
    );
    expect(getByText('First')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
  });

  it('applies lightColor override', () => {
    const { getByText } = render(
      <ThemedView lightColor="#f0f0f0">
        <Text>content</Text>
      </ThemedView>
    );
    expect(getByText('content')).toBeTruthy();
  });
});
