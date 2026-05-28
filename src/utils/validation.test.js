import { describe, it, expect } from 'vitest';
import { validateTrip } from './validation';

describe('validateTrip', () => {
  it('should return errors for empty required fields', () => {
    const result = validateTrip({
      tripName: '',
      destination: '',
      startDate: '',
      endDate: '',
      category: '',
      budget: '',
      collaborators: '',
      packingList: '',
    });

    expect(result.tripName).toBe('Trip name is required.');
    expect(result.destination).toBe('Destination is required.');
    expect(result.startDate).toBe('Start date is required.');
    expect(result.endDate).toBe('End date is required.');
    expect(result.category).toBe('Category is required.');
    expect(result.budget).toBe('Budget is required.');
  });

  it('should return error when end date is before start date', () => {
    const result = validateTrip({
      tripName: 'Trip',
      destination: 'Rome',
      startDate: '2026-06-10',
      endDate: '2026-06-01',
      category: 'City',
      budget: '1000',
      collaborators: '',
      packingList: '',
    });

    expect(result.endDate).toBe('End date must be after start date.');
  });

  it('should return error for invalid budget', () => {
    const result = validateTrip({
      tripName: 'Trip',
      destination: 'Rome',
      startDate: '2026-06-01',
      endDate: '2026-06-10',
      category: 'City',
      budget: '-5',
      collaborators: '',
      packingList: '',
    });

    expect(result.budget).toBe('Budget must be a valid positive number.');
  });

  it('should return no errors for valid input', () => {
    const result = validateTrip({
      tripName: 'Trip',
      destination: 'Rome',
      startDate: '2026-06-01',
      endDate: '2026-06-10',
      category: 'City',
      budget: '1000',
      collaborators: '',
      packingList: '',
    });

    expect(result).toEqual({});
  });
});