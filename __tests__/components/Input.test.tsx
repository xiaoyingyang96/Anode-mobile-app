import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '@/components/Input';

describe('Input', () => {
  it('renders label when provided', () => {
    const { getByText } = render(
      <Input label="Email" value="" onChangeText={() => {}} />
    );
    expect(getByText('Email')).toBeTruthy();
  });

  it('does not render label when not provided', () => {
    const { queryByText } = render(
      <Input value="" onChangeText={() => {}} placeholder="Enter text" />
    );
    expect(queryByText('Email')).toBeNull();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input
        value=""
        onChangeText={onChangeText}
        placeholder="Enter email"
      />
    );
    fireEvent.changeText(getByPlaceholderText('Enter email'), 'test@test.com');
    expect(onChangeText).toHaveBeenCalledWith('test@test.com');
  });

  it('renders error message when error prop is provided', () => {
    const { getByText } = render(
      <Input value="" onChangeText={() => {}} error="This field is required" />
    );
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('does not render error message when error is not provided', () => {
    const { queryByText } = render(
      <Input value="" onChangeText={() => {}} />
    );
    expect(queryByText('This field is required')).toBeNull();
  });

  it('shows password toggle button when secureTextEntry is true', () => {
    const { getByText } = render(
      <Input value="" onChangeText={() => {}} secureTextEntry />
    );
    expect(getByText('👁️')).toBeTruthy();
  });

  it('does not show password toggle when secureTextEntry is false', () => {
    const { queryByText } = render(
      <Input value="" onChangeText={() => {}} secureTextEntry={false} />
    );
    expect(queryByText('👁️')).toBeNull();
  });

  it('toggles password visibility icon when eye button is pressed', () => {
    const { getByText } = render(
      <Input value="" onChangeText={() => {}} secureTextEntry />
    );
    expect(getByText('👁️')).toBeTruthy();
    fireEvent.press(getByText('👁️'));
    expect(getByText('🙈')).toBeTruthy();
  });

  it('renders placeholder text', () => {
    const { getByPlaceholderText } = render(
      <Input value="" onChangeText={() => {}} placeholder="you@example.com" />
    );
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
  });
});
