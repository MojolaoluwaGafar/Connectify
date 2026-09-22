import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ConversationList from '../components/chat/ConversationalList';
import ChatWindow from '../components/chat/ChatWindow';
import { useAuth } from '../context/authContext/useAuth';
import { getConversations } from '../API/Services/Messages/messages';
import type { Message } from '../types';

const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  // Set fresh each time the open chat deletes one of its own messages, so
  // the list can patch that one row directly instead of refetching.
  const [messageDeletedPatch, setMessageDeletedPatch] = useState<{
    matchId: string;
    lastMessage: Message | null;
    unreadCount: number;
  } | null>(null);
  useEffect(() => {
    async function loadConversations() {
      if (!user) return;

      // console.log(user);

      try {
        const data = await getConversations();

        // console.log('CONVERSATIONS DATA', data);

        const selectedUser = location.state?.selectedUser;

        if (selectedUser) {
          const conversation = data.find(
            (item) => item.otherUser.id === selectedUser.id,
          );

          if (conversation) {
            setSelectedConversation(conversation);
          }
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    }

    loadConversations();
  }, [user, location.state]);

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
  };

  const goBack = () => {
    setSelectedConversation(null);
  };

  // If the conversation just deleted from the list is the one currently
  // open, its history is gone — close it back to the empty state.
  const handleConversationDeleted = (matchId: string) => {
    setSelectedConversation((current: any) =>
      current?.matchId === matchId ? null : current,
    );
  };

  const handleMessageDeleted = (
    matchId: string,
    lastMessage: Message | null,
    unreadCount: number,
  ) => {
    setMessageDeletedPatch({ matchId, lastMessage, unreadCount });
  };

  return (
    <div className="md:w-11/12 w-full lg:w-11/12 container mx-auto md:my-10 mt-0 lg:my-10 lg:flex">
      <div className="lg:flex mx-auto lg:w-304">
        <div
          className={`${selectedConversation ? 'hidden lg:block' : 'block'}`}
        >
          <ConversationList
            onSelectConversation={handleSelectConversation}
            onConversationDeleted={handleConversationDeleted}
            messageDeletedPatch={messageDeletedPatch}
          />
        </div>

        <div
          className={`lg:w-[70%] ${
            selectedConversation ? 'block' : 'hidden lg:block'
          }`}
        >
          <ChatWindow
            conversation={selectedConversation}
            onBack={goBack}
            onMessageDeleted={handleMessageDeleted}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
