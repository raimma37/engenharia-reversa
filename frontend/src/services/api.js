import axios from "axios";

const api = axios.create({
	baseURL: process.env.REACT_APP_BACKEND_URL,
	withCredentials: true,
});

export const openApi = axios.create({
	baseURL: process.env.REACT_APP_BACKEND_URL
});

// ============================================================
// Interceptors registrados UMA ÚNICA VEZ no nível do módulo
// Nunca acumulam, nunca têm race condition com React
// ============================================================

// Callback que o useAuth pode setar para reagir a 401
let onUnauthorized = null;
export const setOnUnauthorized = (cb) => { onUnauthorized = cb; };

// REQUEST: injeta token do localStorage em toda requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      try {
        config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
      } catch {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE: refresh em 401/403, limpa sessão apenas se refresh falhar
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const clearSession = () => {
  localStorage.removeItem("token");
  api.defaults.headers.Authorization = undefined;
  if (onUnauthorized) onUnauthorized();
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    // Evita loop infinito na rota de refresh
    if (originalRequest?.url?.includes("/auth/refresh_token")) {
      clearSession();
      return Promise.reject(error);
    }

    // 401 ou 403 → tentar renovar o token via cookie jrt antes de deslogar
    if ((status === 401 || status === 403) && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh_token");
        if (data?.token) {
          localStorage.setItem("token", JSON.stringify(data.token));
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
          processQueue(null, data.token);
          originalRequest.headers["Authorization"] = `Bearer ${data.token}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearSession();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
