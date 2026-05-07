import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { FormContainer } from '@/components/FormContainer';

describe('FormContainer', () => {
  it('renders title when provided', () => {
    const { getByText } = render(
      <FormContainer title="Welcome back">
        <Text>child</Text>
      </FormContainer>
    );
    expect(getByText('Welcome back')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    const { getByText } = render(
      <FormContainer subtitle="Sign in to continue">
        <Text>child</Text>
      </FormContainer>
    );
    expect(getByText('Sign in to continue')).toBeTruthy();
  });

  it('does not render title when not provided', () => {
    const { queryByText } = render(
      <FormContainer>
        <Text>child</Text>
      </FormContainer>
    );
    expect(queryByText('Welcome back')).toBeNull();
  });

  it('does not render subtitle when not provided', () => {
    const { queryByText } = render(
      <FormContainer title="Title">
        <Text>child</Text>
      </FormContainer>
    );
    expect(queryByText('Sign in to continue')).toBeNull();
  });

  it('renders children', () => {
    const { getByText } = render(
      <FormContainer>
        <Text>Form content here</Text>
      </FormContainer>
    );
    expect(getByText('Form content here')).toBeTruthy();
  });

  it('renders both title and subtitle together', () => {
    const { getByText } = render(
      <FormContainer title="Create account" subtitle="Join Anode today">
        <Text>child</Text>
      </FormContainer>
    );
    expect(getByText('Create account')).toBeTruthy();
    expect(getByText('Join Anode today')).toBeTruthy();
  });
});
