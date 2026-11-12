import api from '@/lib/api';

describe('Axios API Client (lib/api.ts)', () => {
  it('configures default baseURL, headers, and withCredentials for cookie auth', () => {
    expect(api.defaults.withCredentials).toBe(true);
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
    expect(api.defaults.baseURL).toBeDefined();
    expect(typeof api.defaults.baseURL).toBe('string');
  });

  it('passes successful responses through without alteration', async () => {
    const mockResponse = { data: { success: true }, status: 200 } as any;
    // Find fulfillment interceptor handler
    const responseInterceptor = (api.interceptors.response as any).handlers[0];
    const result = responseInterceptor.fulfilled(mockResponse);
    expect(result).toBe(mockResponse);
  });

  it('attempts token refresh on 401 response and prevents infinite loop', async () => {
    const responseInterceptor = (api.interceptors.response as any).handlers[0];

    const originalRequest: any = {
      url: '/workspaces',
      _retry: false,
    };

    const mock401Error = {
      response: { status: 401 },
      config: originalRequest,
    };

    const originalAdapter = api.defaults.adapter;
    // Mock adapter so api(originalRequest) does not attempt network call
    api.defaults.adapter = jest.fn().mockResolvedValue({
      data: { refreshed: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: originalRequest,
    });

    const spyPost = jest.spyOn(api, 'post').mockResolvedValueOnce({ data: { message: 'refreshed' } });

    try {
      const res = await responseInterceptor.rejected(mock401Error);
      expect(originalRequest._retry).toBe(true);
      expect(spyPost).toHaveBeenCalledWith('/auth/refresh');
      expect(res.data).toEqual({ refreshed: true });
    } finally {
      spyPost.mockRestore();
      api.defaults.adapter = originalAdapter;
    }
  });

  it('rejects immediately without retry if request was already retried', async () => {
    const responseInterceptor = (api.interceptors.response as any).handlers[0];

    const alreadyRetriedRequest: any = {
      url: '/workspaces',
      _retry: true,
    };

    const mock401Error = {
      response: { status: 401 },
      config: alreadyRetriedRequest,
    };

    await expect(responseInterceptor.rejected(mock401Error)).rejects.toEqual(mock401Error);
  });

  it('rejects immediately without retry if request was to /auth/refresh', async () => {
    const responseInterceptor = (api.interceptors.response as any).handlers[0];

    const refreshRequest: any = {
      url: '/auth/refresh',
      _retry: false,
    };

    const mock401Error = {
      response: { status: 401 },
      config: refreshRequest,
    };

    await expect(responseInterceptor.rejected(mock401Error)).rejects.toEqual(mock401Error);
  });
});

