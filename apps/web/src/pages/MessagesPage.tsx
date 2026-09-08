import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ConversationList from '../components/chat/ConversationalList';
import ChatWindow from '../components/chat/ChatWindow';
import { useAuth } from '../context/authContext/useAuth';
import * as api from '../services/authApi';

const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  useEffect(() => {
    async function loadConversations() {
      if (!user) return;

      try {
        const data = await api.getConversations(user.id);

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

  return (
    <div className="md:w-11/12 w-full lg:w-11/12 container mx-auto md:my-10 mt-0 lg:my-10 lg:flex">
      <div className="lg:flex mx-auto lg:w-[1216px]">
        <div
          className={`${selectedConversation ? 'hidden lg:block' : 'block'}`}
        >
          <ConversationList onSelectConversation={handleSelectConversation} />
        </div>

        <div
          className={`lg:w-[70%] ${
            selectedConversation ? 'block' : 'hidden lg:block'
          }`}
        >
          <ChatWindow conversation={selectedConversation} onBack={goBack} />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
