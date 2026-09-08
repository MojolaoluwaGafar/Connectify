import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import { useAuth } from '../../context/authContext/useAuth';
import { socket } from '../../lib/socket';

// TypeScript interface for component props
interface ChatWindowProps {
  conversation: any;
  onBack: () => void;
}

const ChatWindow = ({ conversation, onBack }: ChatWindowProps) => {
  // Extract authenticated user details from Auth Context
  const { user } = useAuth();

  // State to hold active chat messages array
  const [messages, setMessages] = useState<any[]>([]);
  // State to hold current value of text input
  const [inputText, setInputText] = useState('');

  // Extract recipient details and match ID from current conversation prop
  const selectedUser = conversation?.otherUser;
  const matchId = conversation?.matchId;

  useEffect(() => {
    if (!matchId) {
      setMessages([]);
      setInputText('');
      return;
    }

    const handleIncomingMessage = (payload: any) => {
      const conversationId = payload?.conversationId ?? payload?.matchId
      if (conversationId !== matchId) {
        return
      }

      const nextMessage = {
        id: payload?.id ?? `${conversationId}-${payload?.senderId ?? 'socket'}-${Date.now()}`,
        matchId: conversationId,
        senderId: String(payload?.senderId ?? ''),
        text: payload?.content ?? payload?.text ?? '',
        sentAt: payload?.createdAt ?? new Date().toISOString(),
      }

      setMessages((current) => {
        const alreadyExists = current.some((message) => message.id === nextMessage.id)
        return alreadyExists ? current : [...current, nextMessage]
      })
    }

    socket.on('receive_message', handleIncomingMessage)
    socket.on('new_message', handleIncomingMessage)

    socket.emit('join_conversation', matchId)

    return () => {
      socket.emit('leave_conversation', matchId)
      socket.off('receive_message', handleIncomingMessage)
      socket.off('new_message', handleIncomingMessage)
    }
  }, [matchId])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim() || !selectedUser || !user || !matchId) {
      return;
    }

    const outboundText = inputText.trim();
    setInputText('');

    socket.emit('send_message', {
      conversationId: matchId,
      senderId: Number(user.id),
      content: outboundText,
    })
  }

  return (
    <div className="lg:flex">
      {/* Outer Card Wrapper with responsive layout dimensions */}
      <div className="flex flex-col justify-between sm:w-full min-w-0 h-[calc(100vh-120px)] lg:max-w-209 md:max-w-209 md:h-150 lg:h-150 lg:my-15 md:my-15 md:border-solid lg:border-solid lg:border md:border border-none md:border-[#1c1524]/[0.0784] lg:border-[#1c1524]/[0.0784] lg:rounded-r-3xl md:rounded-3xl my-0 lg:rounded-l-none">
        {/* Chat Header: Profile Avatar, Name, Location, Back Button */}
        <div className="flex justify-between px-6 py-4 items-center lg:border-b border-b-none md:border-b border-[#1c1524]/[0.0784] shadow-2xl md:shadow-none lg:shadow-none">
          <div className="flex gap-3">
            {/* Mobile Back Button */}
            <button
              type="button"
              onClick={onBack}
              className="lg:hidden pr-2 text-gray-500 hover:text-purple-600 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </button>

            {/* Recipient Photo */}
            <img
              src={selectedUser?.profilePicture}
              alt={selectedUser?.fullName}
              className="rounded-full w-10 h-10 object-cover"
            />

            {/* Recipient Details */}
            <div className="flex flex-col">
              <p className="font-semibold text-[15px] font-[Geist]">
                {selectedUser?.fullName || 'Select a Profile'}
              </p>
              <p className="text-[13px] text-gray-500 font-[Geist]">
                {selectedUser?.location || 'No active location'}
              </p>
            </div>
          </div>

          {/* Status Indicators (Responsive Badges) */}
          <div className="bg-[#fef3c7] rounded-md py-0.5 px-2 text-orange-500 hidden md:hidden lg:block text-[11px]">
            Demo replies
          </div>
          <div className="bg-purple-50 rounded-md py-0.5 px-2 text-purple-600 block md:block lg:hidden w-20 h-6 items-center justify-center text-center text-[11px]">
            Active
          </div>
        </div>

        {/* Chat Messages Feed Container */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3 md:bg-white lg:bg-white sm:bg-gray-50 bg-gray-50 justify-start [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar:none]">
          {/* Empty State Banner when no messages exist */}
          {messages.length === 0 ? (
            <div className="flex justify-center h-11 text-purple-600 bg-purple-100 lg:rounded-3xl md:rounded-3xl rounded-lg p-3 text-sm max-w-[90%] mx-auto w-full text-center border md:border-none lg:border-none border-solid border-gray-200">
              Break the ice and keep it genuine and friendly
            </div>
          ) : (
            /* Rendered Message List */
            <div className="w-full min-h-full flex flex-col gap-3 my-auto justify-start">
              <p className="text-center text-[11px] text-slate-500">TODAY</p>

              {messages.map((msg) => {
                // Determine if message belongs to logged-in user
                const isUser = msg.senderId === user?.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[75%] ${
                      isUser
                        ? 'self-end items-end' // Align user messages right
                        : 'self-start items-start' // Align incoming messages left
                    }`}
                  >
                    {/* Message Bubble Styling */}
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        isUser
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Input Bar & Preset Quick-Reply Chips */}
        <div className="flex flex-col p-5 gap-3 border-t border-[#1c1524]/[0.0784]">
          {/* Quick Starter Chips */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => selectedUser && setInputText('Ask about music')}
              className="border border-solid rounded-3xl py-1 px-2 border-[#1c1524]/[0.0784] text-sm max-w-34 h-8.25 hover:bg-gray-50"
            >
              Ask about music
            </button>

            <button
              type="button"
              onClick={() => selectedUser && setInputText('Talk about Travel')}
              className="border border-solid rounded-3xl py-1 px-2 border-[#1c1524]/[0.0784] text-[13px] max-w-34 max-h-8.25 hover:bg-gray-50"
            >
              Talk about Travel
            </button>

            <button
              type="button"
              onClick={() => selectedUser && setInputText('Talk about Art')}
              className="border border-solid rounded-3xl py-1 px-2 border-[#1c1524]/[0.0784] text-[13px] max-w-33.5 max-h-8.25 hover:bg-gray-50"
            >
              Talk about Art
            </button>

            <button
              type="button"
              onClick={() => selectedUser && setInputText('Hello')}
              className="border border-solid rounded-3xl py-1 px-2 border-[#1c1524]/[0.0784] text-[13px] max-w-34 max-h-8.25 hover:bg-gray-50"
            >
              Say Simple Hello
            </button>
          </div>

          {/* Text Input Form */}
          <form className="flex gap-3" onSubmit={handleFormSubmit}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={!selectedUser}
              placeholder={
                selectedUser
                  ? `Write a genuine message to ${selectedUser.fullName.split(' ')[0]}`
                  : 'Select a Profile'
              }
              className="w-full border-solid rounded-3xl border border-[#1c1524]/[0.0784] px-4 focus:outline-purple-600 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!selectedUser || !inputText.trim()}
              className="bg-purple-600 w-14 h-10 lg:rounded-2xl md:rounded-2xl rounded-[50%] flex items-center justify-center hover:cursor-pointer transition-colors disabled:cursor-not-allowed disabled:bg-purple-500"
            >
              <FontAwesomeIcon
                icon={faPaperPlane}
                className="text-white text-center w-5 h-5"
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
