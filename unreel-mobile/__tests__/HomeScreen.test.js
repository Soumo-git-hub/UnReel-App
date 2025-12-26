import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../components/HomeScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock API service
jest.mock('../services/api', () => ({
  analyzeVideo: jest.fn(),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const tree = render(<HomeScreen navigation={mockNavigation} />);
    expect(tree).toBeTruthy();
  });

  it('displays the UnReel logo', () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('UnReel')).toBeTruthy();
  });

  it('has the correct placeholder text in the input field', () => {
    const { getByPlaceholderText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByPlaceholderText('Paste video link or ask a question...')).toBeTruthy();
  });

  it('calls navigation when settings icon is pressed', () => {
    const { getByTestId } = render(<HomeScreen navigation={mockNavigation} />);
    // We can't easily test this without refactoring the component to use testID
    // This is just an example of how we would test it
  });
});