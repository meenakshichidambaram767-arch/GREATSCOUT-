import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScoreGauge } from './ScoreGauge';

describe('ScoreGauge Component', () => {
  it('renders numeric rounded score and label correctly', () => {
    render(<ScoreGauge score={88.4} size="lg" />);
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText(/High Potential/i)).toBeInTheDocument();
  });

  it('renders critical moderate label for mid scores', () => {
    render(<ScoreGauge score={62.0} size="sm" />);
    expect(screen.getByText('62')).toBeInTheDocument();
    expect(screen.getByText(/Moderate/i)).toBeInTheDocument();
  });
});
