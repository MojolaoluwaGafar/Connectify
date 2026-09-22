import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ConversationList from '../components/chat/ConversationalList';
import ChatWindow from '../components/chat/ChatWindow';
import { useAuth } from '../context/authContext/useAuth';
import { getConversations } from '../API/Services/Messages/messages';

const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  // Bumped when the open chat deletes a message/conversation so the list
  // (last-message preview, unread count) refetches.
  const [listVersion, setListVersion] = useState(0);
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

  return (
    <div className="md:w-11/12 w-full lg:w-11/12 container mx-auto md:my-10 mt-0 lg:my-10 lg:flex">
      <div className="lg:flex mx-auto lg:w-304">
        <div
          className={`${selectedConversation ? 'hidden lg:block' : 'block'}`}
        >
          <ConversationList
            onSelectConversation={handleSelectConversation}
            refreshKey={listVersion}
            onConversationDeleted={handleConversationDeleted}
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
            onConversationsChanged={() => setListVersion((v) => v + 1)}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
