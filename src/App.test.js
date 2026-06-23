import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  axios.get.mockResolvedValue({ data: [] });
});

test('renders the member access screen', async () => {
  render(<App />);

  await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

  expect(screen.getByRole('heading', { name: 'Restaurant insights' })).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
});
