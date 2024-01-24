import { render, screen } from '@testing-library/react';
import {Posture} from './App';

test('renders learn react link', () => {
  render(<Posture />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
