import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SectionTabs from '@/components/explore/SectionTabs';
import { MobileSectionId } from '@/types/explore';

describe('SectionTabs', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it('renders all four tab labels', () => {
    const { getByText } = render(
      <SectionTabs active="assets" onChange={onChange} />
    );
    expect(getByText('Assets')).toBeTruthy();
    expect(getByText('Top Stories')).toBeTruthy();
    expect(getByText('Daily Recaps')).toBeTruthy();
    expect(getByText('Policy Updates')).toBeTruthy();
  });

  it('calls onChange with correct id when a tab is pressed', () => {
    const { getByText } = render(
      <SectionTabs active="assets" onChange={onChange} />
    );
    fireEvent.press(getByText('Top Stories'));
    expect(onChange).toHaveBeenCalledWith('top_stories');
  });

  it('calls onChange with assets id when Assets tab is pressed', () => {
    const { getByText } = render(
      <SectionTabs active="top_stories" onChange={onChange} />
    );
    fireEvent.press(getByText('Assets'));
    expect(onChange).toHaveBeenCalledWith('assets');
  });

  it('calls onChange with daily_recaps when Daily Recaps tab is pressed', () => {
    const { getByText } = render(
      <SectionTabs active="assets" onChange={onChange} />
    );
    fireEvent.press(getByText('Daily Recaps'));
    expect(onChange).toHaveBeenCalledWith('daily_recaps');
  });

  it('calls onChange with policy_updates when Policy Updates tab is pressed', () => {
    const { getByText } = render(
      <SectionTabs active="assets" onChange={onChange} />
    );
    fireEvent.press(getByText('Policy Updates'));
    expect(onChange).toHaveBeenCalledWith('policy_updates');
  });
});
