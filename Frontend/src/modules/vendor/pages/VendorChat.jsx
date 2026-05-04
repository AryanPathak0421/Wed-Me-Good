import { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '../../../components/ui/Icon';
import { vendorApi } from '../vendorApi';

const VendorChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);
  const token = localStorage.getItem('vendorToken');

  const fetchConversations = useCallback(async () => {
    try {
      const res = await vendorApi.getConversations(token);
      if (res.success) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const res = await vendorApi.getMessages(conversationId, token);
      if (res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
      const interval = setInterval(() => fetchMessages(activeChat._id), 3000);
      return () => clearInterval(interval);
    }
  }, [activeChat, fetchMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      const res = await vendorApi.sendMessage({
        conversationId: activeChat._id,
        text: messageText
      }, token);

      if (res.success) {
        setMessages(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-[#9D174D] border-t-transparent rounded-full"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Chats...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-3 animate-in fade-in duration-500 overflow-hidden">
      
      {/* Sidebar - Contacts List */}
      <div className={`${activeChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-72 flex-col gap-2`}>
         <div className="vendor-surface rounded-xl p-3 bg-white border border-slate-100 shadow-sm">
            <h2 className="text-[12px] font-black text-slate-900 tracking-tight uppercase">Messages</h2>
            <div className="mt-2 relative">
               <input 
                 type="text" 
                 placeholder="Search chats..."
                 className="w-full h-8 rounded-lg bg-slate-50 border-0 px-3 pl-8 text-[10px] font-bold focus:ring-1 ring-slate-200 transition-all"
               />
               <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="search" size="xs" />
               </div>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar">
            {conversations.map(chat => (
              <div 
                key={chat._id}
                onClick={() => setActiveChat(chat)}
                className={`vendor-surface rounded-xl p-3 cursor-pointer transition-all border group ${activeChat?._id === chat._id ? 'bg-[#9D174D] border-[#9D174D] shadow-lg' : 'bg-white border-slate-50 hover:bg-slate-50'}`}
              >
                 <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-[11px] font-black relative shrink-0 overflow-hidden ${activeChat?._id === chat._id ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#9D174D]'}`}>
                       {chat.otherParticipant?.image ? (
                          <img src={chat.otherParticipant.image} alt="" className="h-full w-full object-cover" />
                       ) : (
                          chat.otherParticipant?.name?.charAt(0) || '?'
                       )}
                       <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between">
                          <h4 className={`text-[11px] font-black truncate leading-none ${activeChat?._id === chat._id ? 'text-white' : 'text-slate-900'}`}>{chat.otherParticipant?.name}</h4>
                          <span className={`text-[8px] font-black shrink-0 uppercase ${activeChat?._id === chat._id ? 'text-white/60' : 'text-slate-400'}`}>
                             {chat.updatedAt && new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                       <p className={`text-[9px] font-bold truncate mt-1 leading-none ${activeChat?._id === chat._id ? 'text-white/80' : 'text-slate-500'}`}>{chat.lastMessage?.text || 'No messages'}</p>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${activeChat ? 'flex' : 'hidden lg:flex'} flex-1 flex-col gap-2 min-w-0`}>
         {activeChat ? (
            <>
               <div className="vendor-surface rounded-xl p-2.5 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <button onClick={() => setActiveChat(null)} className="lg:hidden h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Icon name="chevron-down" className="rotate-90" size="xs" />
                     </button>
                     <div className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center text-[#9D174D] font-black text-[11px] border border-white overflow-hidden">
                        {activeChat.otherParticipant?.image ? (
                           <img src={activeChat.otherParticipant.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                           activeChat.otherParticipant?.name?.charAt(0) || '?'
                        )}
                     </div>
                     <div>
                        <h3 className="text-[11px] font-black text-slate-900 leading-none truncate max-w-[120px] sm:max-w-none">{activeChat.otherParticipant?.name}</h3>
                        <p className="text-[8px] font-black text-emerald-500 mt-1 uppercase tracking-widest">Online</p>
                     </div>
                  </div>
                  <div className="flex gap-1">
                     <button className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#9D174D] transition-all"><Icon name="phone" size="xs" /></button>
                     <button className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#9D174D] transition-all"><Icon name="edit" size="xs" /></button>
                  </div>
               </div>

               <div className="flex-1 vendor-surface rounded-2xl p-4 bg-white border border-slate-50 shadow-sm overflow-y-auto no-scrollbar space-y-3">
                  {messages.map(msg => {
                     const isMe = msg.senderModel === 'Vendor';
                     return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[85%] group relative ${isMe ? 'items-end' : 'items-start'}`}>
                              <div className={`px-3 py-2 rounded-xl text-[11px] font-bold shadow-sm ${isMe 
                                 ? 'bg-[#9D174D] text-white rounded-tr-none' 
                                 : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'}`}
                              >
                                 {msg.text}
                              </div>
                              <p className="text-[7px] font-black text-slate-400 mt-1 uppercase tracking-tighter px-1">
                                 {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                        </div>
                     );
                  })}
                  <div ref={chatEndRef} />
               </div>

               <form onSubmit={handleSendMessage} className="vendor-surface rounded-xl p-1.5 bg-white border border-slate-100 shadow-xl flex items-center gap-2">
                  <button type="button" className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#9D174D] transition-all">
                     <Icon name="plus" size="xs" />
                  </button>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type..."
                    className="flex-1 bg-transparent border-0 px-1 text-[11px] font-bold text-slate-700 placeholder:text-slate-300 focus:ring-0"
                  />
                  <button 
                    type="submit"
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-white shadow-lg active:scale-90 transition-all shrink-0"
                    style={{ background: 'linear-gradient(135deg, #9D174D, #831843)' }}
                  >
                     <Icon name="send" size="xs" />
                  </button>
               </form>
            </>
         ) : (
            <div className="flex-1 vendor-surface rounded-2xl bg-white border border-slate-50 flex flex-col items-center justify-center text-center p-8">
               <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
                  <Icon name="chat" size="xl" />
               </div>
               <h3 className="text-xs font-black text-slate-300 tracking-tight uppercase">No Chat Selected</h3>
            </div>
         )}
      </div>

    </div>
  );
};

export default VendorChat;
