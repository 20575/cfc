import axios from 'axios';

/**
 * Client Axios centralisé pour l'application.
 * Gère automatiquement l'URL de base, les headers d'authentification,
 * et la gestion des erreurs globales (ex: redirection si token expiré).
 */
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token d'accès à chaque requête
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les réponses et les erreurs globales
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Gestion de l'expiration du token (401)
        if (error.response?.status === 401) {
            // Optionnel : Tentative de rafraîchissement du token ici
            // Pour l'instant, on déconnecte simplement
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }

        // On peut ajouter ici d'autres codes d'erreurs globaux (ex: 500, 403)
        return Promise.reject(error);
    }
);

export default apiClient;
