import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    render(<App />);
  });

  it('renders landing page initially', () => {
    expect(screen.getAllByText(/Smart Travel Planner/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Your Entire Journey/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Planning/i })).toBeInTheDocument();
  });

  it('navigates to trips page when Start Planning is clicked', async () => {
    const user = userEvent.setup();

    const buttons = screen.getAllByRole('button', { name: /Start Planning/i });
    await user.click(buttons[0]);

    expect(screen.getByText(/My Trips/i)).toBeInTheDocument();
    expect(screen.getByText(/All Trips/i)).toBeInTheDocument();
  });
});