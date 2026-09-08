import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

import { useAuth } from '../../context/authContext/useAuth';
import * as api from '../../services/authApi';

// TypeScript interface for component props
interface ConversationListProps {
  onSelectConversation: (conversation: any) => void;
}

const ConversationList = ({ onSelectConversation }: ConversationListProps) => {
  // Extract currently logged-in user from context
  const { user } = useAuth();

  // State to handle local search input filtering
  const [searchQuery, setSearchQuery] = useState('');
  // State to hold fetched conversation items
  const [conversations, setConversations] = useState<any[]>([]);
  // Loading indicator state while fetching API data
  const [loading, setLoading] = useState(true);

  // Effect hook: Triggers on mount or whenever the active user updates
  useEffect(() => {
    async function loadConversations() {
      // Clear state if no user session is active
      if (!user) {
        setConversations([]);
        setLoading(false);
        return;
      }

      try {
        // Retrieve conversation threads for active user ID from mock API
        const data = await api.getConversations(user.id);
        setConversations(data);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        // Ensure loading spinner/text turns off after API finishes
        setLoading(false);
      }
    }

    loadConversations();
  }, [user]);

  // Client-side search filter checking otherUser's fullName against searchQuery
  const filteredConversations = conversations.filter((conversation) =>
    conversation.otherUser.fullName
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex gap-3 flex-col">
      {/* Main Section Header */}
      <h1 className="font-semibold text-[32px] font-['Fraunces'] mx-4 lg:mx-0 md:mx-0">
        Messages
      </h1>

      {/* Outer Sidebar Container for List View */}
      <div className="flex flex-col sm:w-full md:w-full lg:w-95 md:border lg:border lg:border-solid md:border-solid border-[#1c1524]/[0.0784] rounded-l-2xl h-150 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar:none]">
        {/* Search Bar Block */}
        <div className="w-full px-2.5 py-4 lg:rounded-l-md md:rounded-lg lg:rounded-r-none">
          <div className="border-solid border-[#1c1524]/[0.0784] border rounded-3xl gap-2 flex items-center px-3 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent mx-4 lg:mx-0 md:mx-0">
            {/* Search Icon */}
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-gray-500"
            />

            {/* Controlled Text Input for Filtering Matches */}
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search your matches"
              className="w-full text-sm outline-none focus:outline focus:ring-0"
            />
          </div>
        </div>

        {/* Scrollable List Area */}
        <div className="flex-wrap flex">
          {/* Conditional Rendering: Loading State */}
          {loading ? (
            <p className="p-5 text-sm text-gray-500">
              Loading conversations...
            </p>
          ) : /* Conditional Rendering: Empty List or No Matches Found */
          filteredConversations.length === 0 ? (
            <p className="p-5 text-sm text-gray-500">No conversations yet.</p>
          ) : (
            /* Render Filtered List Items */
            filteredConversations.map((conversation) => {
              const person = conversation.otherUser;
              const lastMessage = conversation.lastMessage;

              return (
                <div
                  key={conversation.matchId}
                  /* Trigger parent callback when selecting a conversation thread */
                  onClick={() => onSelectConversation(conversation)}
                  className="flex p-4 gap-3 border-b border-solid border-[#1c1524]/[0.0784] w-full justify-between hover:bg-purple-50 cursor-pointer mx-4 lg:mx-0 md:mx-0"
                >
                  {/* Left Side: Avatar and Preview Details */}
                  <div className="flex gap-3">
                    {/* User Profile Avatar */}
                    <img
                      src={person.profilePicture || ''}
                      alt={person.fullName}
                      className="rounded-full w-12 h-12 object-cover"
                    />

                    {/* Text Metadata Container */}
                    <div className="flex flex-col gap-1">
                      {/* Name */}
                      <p className="font-semibold text-[14px] font-[Geist]">
                        {person.fullName}
                      </p>

                      {/* Last Message Preview Text (or Default Icebreaker) */}
                      <p className="text-[13px] text-gray-500 font-[Geist]">
                        {lastMessage?.text || 'Start a conversation'}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Timestamp Display (Mobile Only View) */}
                  <div className="flex flex-col md:hidden lg:hidden gap-3 items-end">
                    {lastMessage && (
                      <p className="font-bold text-sm h-4">
                        {/* Format ISO timestamp to short local time (e.g. 10:45 AM) */}
                        {new Date(lastMessage.sentAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
