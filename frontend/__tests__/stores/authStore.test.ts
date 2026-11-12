import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null });
    jest.clearAllMocks();
  });

  it('has initial state with no user and unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
  });

  it('sets user and updates isAuthenticated to true', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
    };

    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated()).toBe(true);
  });

  it('clears user state on logout and calls api.post("/auth/logout")', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { message: 'Logged out' } });

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
    };
    useAuthStore.setState({ user: mockUser });

    await useAuthStore.getState().logout();

    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
  });
});

