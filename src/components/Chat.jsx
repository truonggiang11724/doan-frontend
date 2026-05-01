import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import chatService from '../services/chatService.js';

const Chat = ({ suggestedMessage = '', targetPartnerId = null, initialConversationId = null }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  const token = localStorage.getItem('token');
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (err) {
      return {};
    }
  }, []);
  const activeConversationRef = useRef(activeConversation);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = io(import.meta.env.VITE_API_URL + '/chat', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Chat socket connected', socket.id);
    });

    socket.on('joinedConversation', ({ conversation_id }) => {
      console.log('Joined conversation', conversation_id);
    });

    socket.on('newMessage', (message) => {
      setMessages((prev) => {
        if (message.conversation_id === activeConversationRef.current?.conversation_id) {
          return [...prev, message];
        }
        return prev;
      });

      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.conversation_id !== message.conversation_id) {
            return conversation;
          }
          return {
            ...conversation,
            lastMessage: message,
            unreadCount: conversation.unreadCount + (message.sender.user_id !== user.user_id ? 1 : 0),
          };
        }),
      );
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connect error', err);
      setError('WebSocket connection failed');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user.user_id]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const initConversations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await chatService.getConversations();
        const loaded = response.data || [];
        setConversations(loaded);

        if (initialConversationId) {
          const existing = loaded.find((conversation) => conversation.conversation_id === initialConversationId);
          if (existing) {
            setActiveConversation(existing);
            return;
          }
        }

        if (targetPartnerId) {
          const existing = loaded.find((conversation) => {
            const partnerId = conversation.buyer.user_id === user.user_id ? conversation.seller.user_id : conversation.buyer.user_id;
            return partnerId === targetPartnerId;
          });

          if (existing) {
            setActiveConversation(existing);
            return;
          }

          const createResponse = await chatService.createConversation({ partner_id: targetPartnerId });
          const createdConversation = createResponse.data;
          setConversations((prev) => [createdConversation, ...prev]);
          setActiveConversation(createdConversation);
          return;
        }

        if (!activeConversation && loaded.length) {
          setActiveConversation(loaded[0]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Unable to load conversations');
      } finally {
        setLoading(false);
      }
    };

    initConversations();
  }, [token, targetPartnerId, initialConversationId]);

  useEffect(() => {
    if (!suggestedMessage) {
      return;
    }
    setNewMessage(suggestedMessage);
  }, [suggestedMessage]);

  useEffect(() => {
    if (!activeConversation) {
      return;
    }
    loadMessages(activeConversation);
  }, [activeConversation]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await chatService.getConversations();
      setConversations(response.data || []);
      if (!activeConversation && response.data?.length) {
        setActiveConversation(response.data[0]);
      }
    } catch (err) {
      setError('Unable to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversation) => {
    setLoading(true);
    try {
      const response = await chatService.getMessages(conversation.conversation_id);
      setMessages(response.data || []);
      socketRef.current?.emit('joinConversation', {
        conversation_id: conversation.conversation_id,
      });
      setConversations((prev) =>
        prev.map((item) =>
          item.conversation_id === conversation.conversation_id
            ? { ...item, unreadCount: 0 }
            : item,
        ),
      );
    } catch (err) {
      setError('Unable to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !activeConversation || !socketRef.current) {
      return;
    }

    const payload = {
      conversation_id: activeConversation.conversation_id,
      content: trimmed,
      type: 'text',
    };

    socketRef.current.emit('sendMessage', payload);

    setMessages((prev) => [
      ...prev,
      {
        ...payload,
        message_id: Date.now(),
        sender: {
          user_id: user.user_id,
          username: user.username,
          avatar_url: user.avatar_url,
        },
        is_read: true,
        created_at: new Date().toISOString(),
      },
    ]);
    setNewMessage('');
  };

  const renderParticipant = (conversation) => {
    const participant = conversation.buyer.user_id === user.user_id ? conversation.seller : conversation.buyer;
    return participant?.username || 'Unknown partner';
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
  };

  return (
    <div className="flex h-full">
      <aside className="w-80 border-r border-slate-200 p-4 bg-white">
        <h2 className="text-xl font-semibold mb-4">Conversations</h2>
        {loading && !conversations.length ? (
          <p>Loading conversations...</p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.conversation_id}
                type="button"
                onClick={() => handleSelectConversation(conversation)}
                className={`w-full text-left rounded-xl p-3 hover:bg-slate-100 ${
                  activeConversation?.conversation_id === conversation.conversation_id
                    ? 'bg-slate-100'
                    : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{renderParticipant(conversation)}</span>
                  {conversation.unreadCount > 0 && (
                    <span className="text-xs bg-blue-500 text-white rounded-full px-2 py-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate mt-1">
                  {conversation.lastMessage?.content || 'No messages yet'}
                </p>
              </button>
            ))}
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col bg-slate-50">
        <div className="border-b border-slate-200 px-4 py-4 bg-white">
          <h2 className="text-xl font-semibold">
            {activeConversation ? renderParticipant(activeConversation) : 'Select a conversation'}
          </h2>
        </div>

        <section className="flex-1 overflow-y-auto p-4">
          {activeConversation ? (
            messages.length ? (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.message_id}
                    className={`flex ${message.sender.user_id === user.user_id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`rounded-2xl p-3 max-w-[70%] ${
                      message.sender.user_id === user.user_id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200'
                    }`}>
                      <p>{message.content}</p>
                      <span className="text-[11px] text-slate-500 mt-1 block text-right">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500">No messages in this conversation yet.</div>
            )
          ) : (
            <div className="text-slate-500">Choose a conversation to see messages.</div>
          )}
        </section>

        <footer className="border-t border-slate-200 p-4 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              disabled={!activeConversation}
              placeholder={activeConversation ? 'Write a message...' : 'Select a conversation first'}
              className="flex-1 rounded-full border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!activeConversation || !newMessage.trim()}
              className="rounded-full bg-blue-600 px-5 py-3 text-white disabled:bg-slate-300"
            >
              Send
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </footer>
      </main>
    </div>
  );
};

export default Chat;
