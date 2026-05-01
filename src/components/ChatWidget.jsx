import { useChat } from '../context/ChatContext.jsx';
import Chat from './Chat.jsx';

const ChatWidget = () => {
  const { isOpen, setIsOpen, closeChat, suggestedMessage, targetPartnerId, initialConversationId } = useChat();
  const token = localStorage.getItem('token');

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[380px] h-[600px] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800 text-white">
            <div>
              <p className="font-semibold">Khung chat</p>
              <p className="text-xs text-slate-200">Chat trực tiếp với người bán</p>
            </div>
            <button
              type="button"
              className="rounded-full bg-slate-700/90 px-3 py-1 text-lg hover:bg-slate-600"
              onClick={closeChat}
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {token ? (
              <Chat
                suggestedMessage={suggestedMessage}
                targetPartnerId={targetPartnerId}
                initialConversationId={initialConversationId}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-slate-700">
                <p className="font-semibold">Đăng nhập để sử dụng chat</p>
                <p className="text-sm text-slate-500">Bạn cần đăng nhập mới có thể chat với người bán.</p>
              </div>
            )}
          </div>
        </div>
      )}
      <button
        type="button"
        className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Mở chat"
      >
        <span className="text-2xl">💬</span>
      </button>
    </div>
  );
};

export default ChatWidget;
