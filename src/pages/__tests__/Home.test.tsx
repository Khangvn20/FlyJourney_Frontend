import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '../Home';

vi.mock('../../components/flight/FlightSearchForm', () => ({
  __esModule: true,
  default: () => null,
}));
vi.mock('../../components/sections/PopularDestinations', () => ({
  __esModule: true,
  default: () => null,
}));
vi.mock('../../components/sections/TravelNews', () => ({
  __esModule: true,
  default: () => null,
}));
vi.mock('../../components/sections/AirlinesSection', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('../../mocks', () => ({
  heroSlides: [
    { image: '', title: 'Slide 1', location: 'Loc1' },
    { image: '', title: 'Slide 2', location: 'Loc2' },
  ],
  whyChooseUs: [],
}));

describe('Home Page', () => {
  it('renders and cycles slides', () => {
    const { getByText, container } = render(<Home />);
    expect(getByText('Slide 1')).toBeInTheDocument();
    const nextButton = container.querySelector('button.absolute.right-4');
    if (!nextButton) throw new Error('Next button not found');
    fireEvent.click(nextButton);
    expect(getByText('Slide 2')).toBeInTheDocument();
  });
});

