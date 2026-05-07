import React from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('renders the label', () => {
    const { getByText } = render(<Button label="Sign In" onPress={() => {}} />);
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Submit" onPress={onPress} />);
    fireEvent.press(getByText('Submit'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const { UNSAFE_getByType } = render(
      <Button label="Submit" onPress={() => {}} disabled />
    );
    expect(UNSAFE_getByType(TouchableOpacity).props.disabled).toBe(true);
  });

  it('shows ActivityIndicator and hides label when loading', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <Button label="Submit" onPress={() => {}} loading />
    );
    expect(queryByText('Submit')).toBeNull();
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('is disabled when loading', () => {
    const { UNSAFE_getByType } = render(
      <Button label="Submit" onPress={() => {}} loading />
    );
    expect(UNSAFE_getByType(TouchableOpacity).props.disabled).toBe(true);
  });

  it('renders secondary variant', () => {
    const { getByText } = render(
      <Button label="Cancel" onPress={() => {}} variant="secondary" />
    );
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('renders ghost variant', () => {
    const { getByText } = render(
      <Button label="Skip" onPress={() => {}} variant="ghost" />
    );
    expect(getByText('Skip')).toBeTruthy();
  });
});
