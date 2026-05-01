import api from './api.js';

const chatService = {
  getConversations: () => api.get('/conversations'),
  getMessages: (conversationId) => api.get(`/messages/${conversationId}`),
  createConversation: (payload) => api.post('/conversations', payload),
};

export default chatService;
