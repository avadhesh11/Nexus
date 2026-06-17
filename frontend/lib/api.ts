import axios from "axios";

const api = axios.create({
  baseURL:
    `${process.env.NEXT_PUBLIC_API_URL}/api` ||
    "http://localhost:8000/api",

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});
api.interceptors.response.use(
  (res) => res,

  async (err) => {
    const originalRequest = err.config;

    // Prevent retry loop
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh");

        return api(originalRequest);

      } catch (refreshError) {
        const publicPaths = ["/", "/login", "/register"];
        if (
          typeof window !== "undefined" &&
          !publicPaths.includes(window.location.pathname)
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export default api;