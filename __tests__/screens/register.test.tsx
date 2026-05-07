import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '@/app/register';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));

const mockSignUp = jest.fn();

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    signIn: jest.fn(),
    signUp: mockSignUp,
    signOut: jest.fn(),
  }),
}));

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title and subtitle', () => {
    const { getByText } = render(<RegisterScreen />);
    expect(getByText('Create account')).toBeTruthy();
    expect(getByText('Sign up for Anode')).toBeTruthy();
  });

  it('renders email and password inputs', () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(getByPlaceholderText('Choose a password')).toBeTruthy();
  });

  it('renders Sign Up button', () => {
    const { getByText } = render(<RegisterScreen />);
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('shows validation error when fields are empty', async () => {
    const { getByText } = render(<RegisterScreen />);
    fireEvent.press(getByText('Sign Up'));
    await waitFor(() => {
      expect(
        getByText('Please enter your email and password.')
      ).toBeTruthy();
    });
  });

  it('calls signUp with email and password', async () => {
    mockSignUp.mockResolvedValueOnce(undefined);
    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'new@test.com');
    fireEvent.changeText(getByPlaceholderText('Choose a password'), 'secure123');
    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('new@test.com', 'secure123');
    });
  });

  it('navigates to tabs after successful registration', async () => {
    mockSignUp.mockResolvedValueOnce(undefined);
    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'new@test.com');
    fireEvent.changeText(getByPlaceholderText('Choose a password'), 'secure123');
    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('shows error message when signUp throws', async () => {
    mockSignUp.mockRejectedValueOnce(new Error('Email already registered'));
    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'existing@test.com');
    fireEvent.changeText(getByPlaceholderText('Choose a password'), 'password');
    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      expect(getByText('Email already registered')).toBeTruthy();
    });
  });

  it('navigates to login when Sign In is pressed', () => {
    const { getByText } = render(<RegisterScreen />);
    fireEvent.press(getByText('Sign In'));
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
