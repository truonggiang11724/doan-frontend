import { createContext, useContext, useState } from 'react';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestedMessage, setSuggestedMessage] = useState('');
  const [initialConversationId, setInitialConversationId] = useState(null);
  const [targetPartnerId, setTargetPartnerId] = useState(null);
  const [productImageUrl, setProductImageUrl] = useState('');

  const openChat = (message = '', partnerId = null, conversationId = null, imageUrl = '') => {
    setSuggestedMessage(message);
    setTargetPartnerId(partnerId);
    setInitialConversationId(conversationId);
    setProductImageUrl(imageUrl);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setSuggestedMessage('');
    setInitialConversationId(null);
    setTargetPartnerId(null);
    setProductImageUrl('');
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        openChat,
        closeChat,
        suggestedMessage,
        initialConversationId,
        targetPartnerId,
        productImageUrl,
        setIsOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used inside ChatProvider');
  }
  return context;
};
