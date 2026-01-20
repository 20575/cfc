import apiClient from '../../api/client';

export const announcementsApi = {
    /**
     * Récupère la liste des annonces actives (filtrées par le backend selon le rôle)
     */
    getAnnouncements: async () => {
        const response = await apiClient.get('/announcements/announcements/');
        return response.data;
    },

    /**
     * Crée une nouvelle annonce (Admin seulement)
     */
    createAnnouncement: async (data) => {
        const response = await apiClient.post('/announcements/announcements/', data);
        return response.data;
    },

    /**
     * Met à jour une annonce
     */
    updateAnnouncement: async (id, data) => {
        const response = await apiClient.patch(`/announcements/announcements/${id}/`, data);
        return response.data;
    },

    /**
     * Supprime une annonce
     */
    deleteAnnouncement: async (id) => {
        await apiClient.delete(`/announcements/announcements/${id}/`);
    }
};
