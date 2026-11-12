import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/(auth)/login/page';
import api from '@/lib/api';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock auth store
const mockSetUser = jest.fn();
const mockLogout = jest.fn();
jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    setUser: mockSetUser,
    logout: mockLogout,
    isAuthenticated: () => false,
  })),
}));

// Mock API client
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // checkAuth fails on mount so login form is rendered
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));
  });

  it('renders login form with email and password inputs and submit button', async () => {
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('submits credentials to API and redirects to /dashboard on success', async () => {
    const user = userEvent.setup();
    const mockUser = { id: 'usr-1', email: 'test@nexus.ai' };

    (api.post as jest.Mock).mockResolvedValueOnce({ data: { message: 'Success' } });
    // After login, handleSubmit calls api.get('/auth/me')
    (api.get as jest.Mock)
      .mockRejectedValueOnce(new Error('Not authenticated')) // on mount checkAuth
      .mockResolvedValueOnce({ data: mockUser }); // on submit get /auth/me

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@nexus.ai');
    await user.type(passwordInput, 'Secret123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@nexus.ai',
        password: 'Secret123!',
      });
      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays error message when login fails', async () => {
    const user = userEvent.setup();

    (api.post as jest.Mock).mockRejectedValueOnce({
      response: {
        data: {
          detail: 'Invalid credentials provided',
        },
      },
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'wrong@nexus.ai');
    await user.type(passwordInput, 'WrongPass123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials provided')).toBeInTheDocument();
    });
  });
});

