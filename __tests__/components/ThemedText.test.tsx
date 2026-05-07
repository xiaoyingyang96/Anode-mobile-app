import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '@/components/themed-text';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

describe('ThemedText', () => {
  it('renders children', () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders with default type', () => {
    const { getByText } = render(<ThemedText type="default">Default</ThemedText>);
    expect(getByText('Default')).toBeTruthy();
  });

  it('renders with title type', () => {
    const { getByText } = render(<ThemedText type="title">Title Text</ThemedText>);
    expect(getByText('Title Text')).toBeTruthy();
  });

  it('renders with defaultSemiBold type', () => {
    const { getByText } = render(
      <ThemedText type="defaultSemiBold">Semi Bold</ThemedText>
    );
    expect(getByText('Semi Bold')).toBeTruthy();
  });

  it('renders with subtitle type', () => {
    const { getByText } = render(
      <ThemedText type="subtitle">Subtitle Text</ThemedText>
    );
    expect(getByText('Subtitle Text')).toBeTruthy();
  });

  it('renders with link type', () => {
    const { getByText } = render(<ThemedText type="link">Click here</ThemedText>);
    expect(getByText('Click here')).toBeTruthy();
  });

  it('applies lightColor override', () => {
    const { getByText } = render(
      <ThemedText lightColor="#ff0000">Red text</ThemedText>
    );
    expect(getByText('Red text')).toBeTruthy();
  });
});
