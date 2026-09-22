import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { Check, CheckCheck, Trash2 } from "lucide-react";

import { useAuth } from "../../context/authContext/useAuth";
import {
  deleteConversation,
  getConversations,
  markConversationRead,
} from "../../API/Services/Messages/messages";
import { getActiveConversationId, socket } from "../../lib/socket";
import { formatConversationTime } from "../../utils/chatTime";
import Modal from "../ui/Modal";
import { themedToast } from "../../utils/ToastFeedback";

// TypeScript interface for component props
interface ConversationListProps {
  onSelectConversation: (conversation: any) => void;
  // Bumped by the parent whenever the open chat changed something the list
  // shows (a deleted message) — triggers a refetch.
  refreshKey?: number;
  // Called after a conversation is deleted from here, so the parent can
  // close it if it's the one currently open in the chat window.
  onConversationDeleted?: (matchId: string) => void;
}

const ConversationList = ({
  onSelectConversation,
  refreshKey = 0,
  onConversationDeleted,
}: ConversationListProps) => {
  // Extract currently logged-in user from context
  const { user } = useAuth();

  // State to handle local search input filtering
  const [searchQuery, setSearchQuery] = useState("");
  // State to hold fetched conversation items
  const [conversations, setConversations] = useState<any[]>([]);
  // Loading indicator state while fetching API data
  const [loading, setLoading] = useState(true);
  // Conversation ids whose other participant is currently typing
  const [typingConversationIds, setTypingConversationIds] = useState<
    Set<string>
  >(new Set());
  // Conversation the user has asked to delete, awaiting confirmation.
  const [conversationPendingDelete, setConversationPendingDelete] = useState<{
    matchId: string;
    name: string;
  } | null>(null);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);

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
        const data = await getConversations();
        setConversations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        // Ensure loading spinner/text turns off after API finishes
        setLoading(false);
      }
    }

    loadConversations();
  }, [user, refreshKey]);

  // Keeps each row's preview in sync with new messages as they arrive —
  // without this, a conversation's preview only updates on a full reload.
  useEffect(() => {
    if (!user) return;

    function upsertLastMessage(
      conversationId: string,
      lastMessage: {
        senderId?: string;
        text: string;
        sentAt: string;
        status?: string;
      },
    ) {
      setConversations((prev) => {
        const next = prev.map((conversation) =>
          conversation.matchId === conversationId
            ? { ...conversation, lastMessage }
            : conversation,
        );

        return [...next].sort((a, b) => {
          const aTime = a.lastMessage?.sentAt ?? "";
          const bTime = b.lastMessage?.sentAt ?? "";
          return bTime.localeCompare(aTime);
        });
      });
    }

    // Fires for whichever side has this conversation's ChatWindow open
    // (sender included, since sending echoes back through the room).
    const handleReceiveMessage = (payload: any) => {
      if (!payload?.conversationId) return;

      upsertLastMessage(payload.conversationId, {
        senderId: payload.senderId,
        text: payload.text ?? "",
        sentAt: payload.sentAt ?? new Date().toISOString(),
        status: payload.status,
      });
    };

    // Fires for the recipient regardless of which page they're on, so a
    // conversation not currently open still gets its preview updated.
    const handleNewMessageNotification = (payload: any) => {
      if (!payload?.conversationId) return;

      upsertLastMessage(payload.conversationId, {
        senderId: payload.senderId,
        text: payload.text ?? "",
        sentAt: new Date().toISOString(),
      });

      if (payload.conversationId === getActiveConversationId()) {
        // Already looking at this chat — it'll be marked read there
        // momentarily, so don't let a stale unread count reappear here.
        markConversationRead(payload.conversationId).catch(() => {});
        return;
      }

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.matchId === payload.conversationId
            ? {
                ...conversation,
                unreadCount: (conversation.unreadCount ?? 0) + 1,
              }
            : conversation,
        ),
      );
    };

    // Live tick updates for the sender's own last message — pushed when the
    // recipient comes online (delivered) or opens the chat (read).
    const handleMessagesDelivered = (payload: any) => {
      if (!payload?.conversationId) return;

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.matchId === payload.conversationId &&
          conversation.lastMessage &&
          conversation.lastMessage.status !== "read"
            ? {
                ...conversation,
                lastMessage: {
                  ...conversation.lastMessage,
                  status: "delivered",
                },
              }
            : conversation,
        ),
      );
    };

    const handleMessagesRead = (payload: any) => {
      if (!payload?.conversationId) return;

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.matchId === payload.conversationId &&
          conversation.lastMessage
            ? {
                ...conversation,
                lastMessage: { ...conversation.lastMessage, status: "read" },
              }
            : conversation,
        ),
      );
    };

    // The other person deleted one of their messages — the payload carries
    // what this user should now see as the last message and unread count.
    const handleMessageDeleted = (payload: any) => {
      if (!payload?.conversationId) return;

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.matchId === payload.conversationId
            ? {
                ...conversation,
                lastMessage: payload.lastMessage ?? null,
                unreadCount: payload.unreadCount ?? conversation.unreadCount,
              }
            : conversation,
        ),
      );
    };

    const handleUserTyping = (payload: any) => {
      if (!payload?.conversationId) return;

      setTypingConversationIds((prev) => {
        const next = new Set(prev);
        next.add(payload.conversationId);
        return next;
      });
    };

    const handleUserStopTyping = (payload: any) => {
      if (!payload?.conversationId) return;

      setTypingConversationIds((prev) => {
        if (!prev.has(payload.conversationId)) return prev;

        const next = new Set(prev);
        next.delete(payload.conversationId);
        return next;
      });
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("new_message_notification", handleNewMessageNotification);
    socket.on("messages_delivered", handleMessagesDelivered);
    socket.on("messages_read", handleMessagesRead);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("new_message_notification", handleNewMessageNotification);
      socket.off("messages_delivered", handleMessagesDelivered);
      socket.off("messages_read", handleMessagesRead);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
    };
  }, [user]);

  const handleConfirmDeleteConversation = async () => {
    const target = conversationPendingDelete;
    if (!target) return;

    setIsDeletingConversation(true);

    try {
      await deleteConversation(target.matchId);

      // The match stays — only its history is cleared, so the row remains
      // and just goes back to looking like a fresh, unmessaged match.
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.matchId === target.matchId
            ? { ...conversation, lastMessage: null, unreadCount: 0 }
            : conversation,
        ),
      );
      setConversationPendingDelete(null);
      onConversationDeleted?.(target.matchId);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      themedToast.error("Could not delete this conversation. Please try again.");
    } finally {
      setIsDeletingConversation(false);
    }
  };

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
      <div className="flex flex-col sm:w-full md:w-full lg:w-95 md:border lg:border lg:border-solid md:border-solid border-[#1c1524]/[0.0784] rounded-l-2xl max-h-[70vh] lg:h-150 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar:none]">
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
              const isTyping = typingConversationIds.has(
                conversation.matchId,
              );
              const unreadCount = conversation.unreadCount ?? 0;
              const isOwnLastMessage =
                !!lastMessage &&
                String(lastMessage.senderId) === String(user?.id);

              return (
                <div
                  key={conversation.matchId}
                  /* Trigger parent callback when selecting a conversation thread */
                  onClick={() => {
                    // Optimistic — ChatWindow's own mount effect persists
                    // this server-side moments later.
                    setConversations((prev) =>
                      prev.map((item) =>
                        item.matchId === conversation.matchId
                          ? { ...item, unreadCount: 0 }
                          : item,
                      ),
                    );
                    onSelectConversation(conversation);
                  }}
                  className="flex p-4 gap-3 border-b border-solid border-[#1c1524]/[0.0784] w-full justify-between hover:bg-purple-50 cursor-pointer mx-4 lg:mx-0 md:mx-0"
                >
                  {/* Left Side: Avatar and Preview Details */}
                  <div className="flex min-w-0 flex-1 gap-3">
                    {/* User Profile Avatar */}
                    {person.profilePicture ? (
                      <img
                        src={person.profilePicture}
                        alt={person.fullName}
                        className="rounded-full w-12 h-12 object-cover shrink-0"
                      />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-medium text-white">
                        {person.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}

                    {/* Text Metadata Container */}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      {/* Name */}
                      <p className="truncate font-semibold text-[14px] font-[Geist]">
                        {person.fullName}
                      </p>

                      {/* Last Message Preview Text — swapped for a live
                          "Typing…" status when the other person is typing */}
                      {isTyping ? (
                        <p className="text-[13px] text-violet-600 font-[Geist] font-medium italic truncate">
                          Typing…
                        </p>
                      ) : (
                        <p className="flex min-w-0 items-center gap-1 text-[13px] text-gray-500 font-[Geist]">
                          {isOwnLastMessage &&
                            lastMessage &&
                            (lastMessage.status === "sent" ? (
                              <Check
                                className="shrink-0 text-gray-400"
                                size={13}
                              />
                            ) : (
                              <CheckCheck
                                className={`shrink-0 ${
                                  lastMessage.status === "read"
                                    ? "text-sky-500"
                                    : "text-gray-400"
                                }`}
                                size={13}
                              />
                            ))}
                          <span className="truncate">
                            {isOwnLastMessage && "You: "}
                            {lastMessage?.text || "Start a conversation"}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side: last-message time + unread count chip */}
                  <div className="flex flex-col gap-1.5 items-end shrink-0">
                    {lastMessage && (
                      <p
                        className={`text-xs h-4 whitespace-nowrap font-[Geist] ${
                          unreadCount > 0
                            ? "font-semibold text-violet-600"
                            : "text-gray-500"
                        }`}
                      >
                        {formatConversationTime(lastMessage.sentAt)}
                      </p>
                    )}

                    {unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[11px] font-semibold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Delete conversation */}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setConversationPendingDelete({
                        matchId: conversation.matchId,
                        name: person.fullName,
                      });
                    }}
                    aria-label={`Delete conversation with ${person.fullName}`}
                    className="shrink-0 self-center rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={conversationPendingDelete !== null}
        onClose={() =>
          !isDeletingConversation && setConversationPendingDelete(null)
        }
      >
        <h2 className="text-lg font-semibold text-gray-900">
          Delete this conversation?
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          This clears the chat history for you.{" "}
          {conversationPendingDelete?.name.split(" ")[0] ?? "They"} will
          still have their copy, and you'll stay matched.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setConversationPendingDelete(null)}
            disabled={isDeletingConversation}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDeleteConversation}
            disabled={isDeletingConversation}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeletingConversation ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ConversationList;
