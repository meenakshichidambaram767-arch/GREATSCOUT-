import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('GreatScout App', () => {
  it('renders application brand and navigation', () => {
    render(<App />);
    expect(screen.getAllByText(/GreatScout/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/SCOUT SMART, BUILD BETTER/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Opportunities/i).length).toBeGreaterThan(0);
  });
});
