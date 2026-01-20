import apiClient from '../../api/client';

export const internalChatService = {
    /**
     * Récupère les messages (filtrés par le backend)
     */
    getMessages: async (params = {}) => {
        const response = await apiClient.get('/chat/messages/', { params });
        return response.data;
    },

    /**
     * Envoie un nouveau message
     */
    sendMessage: async (data) => {
        const response = await apiClient.post('/chat/messages/', data);
        return response.data;
    },

    /**
     * Marque un message comme lu
     */
    markAsRead: async (id) => {
        const response = await apiClient.patch(`/chat/messages/${id}/`, { is_read: true });
        return response.data;
    }
};
