import axios, { AxiosInstance } from "axios";

// Set VITE_API_URL in .env.local or .env.production for deployed environments.
const configuredApiUrl = import.meta.env.VITE_API_URL;
const BaseDomaine = {
    URL: configuredApiUrl.replace(/\/$/, '')
};

export const Base = {
    baseURL: `${BaseDomaine.URL}/api`
};

// Instance Axios configurée
const Axios: AxiosInstance = axios.create({
    baseURL: Base.baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

// Intercepteur de requêtes : injection automatique du token
Axios.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('token_1');
    if (accessToken) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const currentEntrepriseId = localStorage.getItem('current_entreprise_uuid') || localStorage.getItem('entreprise_id');
    if (currentEntrepriseId) {
        config.headers = config.headers || {};
        config.headers['X-Entreprise-Id'] = currentEntrepriseId;
    }
    return config;
});

// Intercepteur de réponses : rafraîchissement automatique du token sur HTTP 401
Axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config;
        if (!originalRequest) return Promise.reject(error);

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('token');
            if (!refreshToken) {
                return Promise.reject(error);
            }

            try {
                const refreshResponse = await axios.post(
                    `${Base.baseURL}/utilisateur/token/refresh`,
                    { refresh: refreshToken },
                    { withCredentials: true }
                );

                const newAccess = refreshResponse?.data?.access;

                if (newAccess) {
                    localStorage.setItem('token_1', newAccess);
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
                    return Axios.request(originalRequest);
                }
            } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('token_1');
                return Promise.reject(e);
            }
        }

        // Notification globale lors d'une restriction de plan ou quota (HTTP 403)
        if (error.response?.status === 403) {
            const data = error.response.data;
            if (data?.code === 'plan_insuffisant' || data?.code === 'quota_atteint') {
                window.dispatchEvent(new CustomEvent('plan_restriction_error', { detail: data }));
            }
        }

        return Promise.reject(error);
    }
);

export default Axios;

export const BASE = (img: string | File | unknown) => {
    if (typeof img !== 'string' || !img) return '';
    if (/^https?:\/\//i.test(img)) return img;
    return `${BaseDomaine.URL}/${img.replace(/^\//, '')}`;
};

export const scanBarcode = async (code: string) => {
    return Axios.get(`/entreprise/entre/scan/${encodeURIComponent(code)}`);
};

