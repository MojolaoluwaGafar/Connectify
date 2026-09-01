import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Import child UI components for list view and chat viewport
import ConversationList from '../components/chat/ConversationalList';
import ChatWindow from '../components/chat/ChatWindow';

// Import custom authentication context and mock API handler
import { useAuth } from '../context/authContext/useAuth';
import * as api from '../lib/mockApi';

const MessagesPage = () => {
  // Retrieve the logged-in user object from auth state
  const { user } = useAuth();
  // Access React Router location state (used to inspect route navigation payloads)
  const location = useLocation();

  // State to track which conversation thread is currently active/selected
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  // Effect hook: Loads user conversations and handles direct navigation payloads
  useEffect(() => {
    async function loadConversations() {
      // Guard clause: Exit early if user session does not exist
      if (!user) return;

      try {
        // Fetch all message threads for the current user ID
        const data = await api.getConversations(user.id);

        // Check if navigation state contains a pre-selected user (e.g., clicking "Send Message" on a profile page)
        const selectedUser = location.state?.selectedUser;

        if (selectedUser) {
          // Locate matching conversation in fetched dataset
          const conversation = data.find(
            (item) => item.otherUser.id === selectedUser.id,
          );

          // Automatically select conversation thread if found
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

  // Callback handler passed to ConversationList to update selected thread state
  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
  };

  // Mobile back button handler to reset selection and return to list view
  const goBack = () => {
    setSelectedConversation(null);
  };

  return (
    // Outer responsive container with standard centered page margins
    <div className="md:w-11/12 w-full lg:w-11/12 container mx-auto md:my-10 mt-0 lg:my-10 lg:flex">
      {/* Main content flex layout wrapper */}
      <div className="lg:flex mx-auto lg:w-[1216px]">
        {/* Conversation List Container
            Responsive behavior: Hidden on mobile when a chat is open; always visible on desktop (`lg:block`) */}
        <div
          className={`${selectedConversation ? 'hidden lg:block' : 'block'}`}
        >
          <ConversationList onSelectConversation={handleSelectConversation} />
        </div>

        {/* Active Chat Window Container
            Responsive behavior: Shown on mobile when a chat is open; hidden on mobile when no chat is open; always visible on desktop (`lg:block`) */}
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
