import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPasswordScreen from '@/app/forgot-password';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

describe('ForgotPasswordScreen', () => {
  it('renders the title and subtitle', () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    expect(getByText('Reset password')).toBeTruthy();
    expect(getByText('Enter your email to receive a reset link')).toBeTruthy();
  });

  it('renders email input', () => {
    const { getByPlaceholderText } = render(<ForgotPasswordScreen />);
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
  });

  it('renders Send Reset Link button', () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    expect(getByText('Send Reset Link')).toBeTruthy();
  });

  it('shows "Password reset coming soon." error when button is pressed', async () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    fireEvent.press(getByText('Send Reset Link'));
    await waitFor(() => {
      expect(getByText('Password reset coming soon.')).toBeTruthy();
    });
  });

  it('accepts email input', () => {
    const { getByPlaceholderText } = render(<ForgotPasswordScreen />);
    const input = getByPlaceholderText('you@example.com');
    fireEvent.changeText(input, 'user@example.com');
    expect(input.props.value).toBe('user@example.com');
  });
});
