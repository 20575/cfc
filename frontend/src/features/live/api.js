import apiClient from '../../api/client';

export const liveApi = {
    /**
     * Récupère tous les flux (filtrés par le backend selon le rôle)
     */
    getStreams: async () => {
        const response = await apiClient.get('/lives/streams/');
        return response.data;
    },

    /**
     * Récupère le flux live actif actuel
     */
    getActiveStream: async () => {
        const response = await apiClient.get('/lives/streams/active/');
        return response.data;
    },

    /**
     * Crée une nouvelle planification de live (Pasteur/Admin)
     */
    createStream: async (data) => {
        const response = await apiClient.post('/lives/streams/', data);
        return response.data;
    },

    /**
     * Démarre officiellement le direct
     */
    startStream: async (id) => {
        const response = await apiClient.post(`/lives/streams/${id}/start_stream/`);
        return response.data;
    },

    /**
     * Arrête le direct
     */
    stopStream: async (id) => {
        const response = await apiClient.post(`/lives/streams/${id}/stop_stream/`);
        return response.data;
    },

    /**
     * Supprime une planification
     */
    deleteStream: async (id) => {
        const response = await apiClient.delete(`/lives/streams/${id}/`);
        return response.data;
    }
};
