import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock react-navigation dependencies
jest.mock('@react-navigation/native', () => {
  return {
    NavigationContainer: ({ children }) => <>{children}</>,
  };
});

jest.mock('@react-navigation/stack', () => {
  return {
    createStackNavigator: () => {
      return {
        Navigator: ({ children }) => <>{children}</>,
        Screen: ({ children }) => <>{children}</>,
      };
    },
  };
});

// Mock components to avoid complex dependencies
jest.mock('../components/HomeScreen', () => 'HomeScreen');
jest.mock('../components/SettingsScreen', () => 'SettingsScreen');
jest.mock('../components/AnalysisResultScreen', () => 'AnalysisResultScreen');
jest.mock('../components/ChatScreen', () => 'ChatScreen');
jest.mock('../components/HistoryScreen', () => 'HistoryScreen');

describe('App', () => {
  it('renders correctly', () => {
    const tree = render(<App />);
    expect(tree).toBeTruthy();
  });
});