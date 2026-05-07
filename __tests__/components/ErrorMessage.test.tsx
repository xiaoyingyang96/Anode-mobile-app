import React from 'react';
import { render } from '@testing-library/react-native';
import { ErrorMessage } from '@/components/ErrorMessage';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

describe('ErrorMessage', () => {
  it('returns null when message is null', () => {
    const { toJSON } = render(<ErrorMessage message={null} />);
    expect(toJSON()).toBeNull();
  });

  it('returns null when message is undefined', () => {
    const { toJSON } = render(<ErrorMessage message={undefined} />);
    expect(toJSON()).toBeNull();
  });

  it('returns null when message is empty string', () => {
    const { toJSON } = render(<ErrorMessage message="" />);
    expect(toJSON()).toBeNull();
  });

  it('renders the message when provided', () => {
    const { getByText } = render(
      <ErrorMessage message="Something went wrong" />
    );
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('renders the warning icon', () => {
    const { getByText } = render(
      <ErrorMessage message="An error occurred" />
    );
    expect(getByText('⚠️')).toBeTruthy();
  });
});
