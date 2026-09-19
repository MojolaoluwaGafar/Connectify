import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "../../context/authContext/useAuth";
import { socket, setActiveConversationId } from "../../lib/socket";
import {
  getMessages,
  markConversationRead,
} from "../../API/Services/Messages/messages";
import type { Message } from "../../types";
import {
  formatDayLabel,
  formatMessageTime,
  getDayKey,
} from "../../utils/chatTime";
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
  // True from selecting a conversation until its history has been fetched —
  // without it, an existing conversation briefly looks empty and flashes the
  // "break the ice" banner and starter chips before old messages arrive.
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  // State to hold current value of text input
  const [inputText, setInputText] = useState("");
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extract recipient details and match ID from current conversation prop
  const selectedUser = conversation?.otherUser;
  const matchId = conversation?.matchId;

  useEffect(() => {
    if (!matchId) {
      setMessages([]);
      setIsLoadingMessages(false);
      setInputText("");
      setActiveConversationId(null);
      return;
    }
    // Drop the previous conversation's messages right away so they never
    // show under the newly selected person while its history loads.
    setMessages([]);
    setIsLoadingMessages(true);
    setIsOtherUserTyping(false);
    setIsTyping(false);
    setIsOtherUserOnline(false);
    setActiveConversationId(matchId);

    let cancelled = false;

    async function loadMessages() {
      try {
        const data = await getMessages(matchId);

        if (!cancelled) {
          // Merge rather than replace: a live message may have arrived over
          // the socket while the history request was still in flight.
          setMessages((current) => {
            const known = new Set(data.map((message: Message) => message.id));
            return [
              ...data,
              ...current.filter((message) => !known.has(message.id)),
            ];
          });
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingMessages(false);
        }
      }
    }

    loadMessages();

    markConversationRead(matchId).catch((error) => {
      console.error("Failed to mark conversation as read:", error);
    });

    const handleIncomingMessage = (payload: any) => {
      // console.log("RECEIVED MESSAGE FROM SOCKET:", payload);
      const conversationId = payload?.conversationId ?? payload?.matchId;

      if (conversationId !== matchId) {
        return;
      }

      const nextMessage = {
        id:
          payload?.id ??
          `${conversationId}-${payload?.senderId ?? "socket"}-${Date.now()}`,
        matchId: conversationId,
        senderId: String(payload?.senderId ?? ""),
        text: payload?.content ?? payload?.text ?? "",
        sentAt:
          payload?.sentAt ?? payload?.createdAt ?? new Date().toISOString(),
      };

      setMessages((current) => {
        const alreadyExists = current.some(
          (message) => message.id === nextMessage.id,
        );

        const updatedMessages = alreadyExists
          ? current
          : [...current, nextMessage];

        // console.log("MESSAGES STATE:", updatedMessages);

        return updatedMessages;
      });
    };

    const handleUserTyping = (payload: any) => {
      if (payload?.conversationId !== matchId) {
        return;
      }

      if (payload?.userId === String(selectedUser?.userId)) {
        setIsOtherUserTyping(true);
      }
    };

    const handleUserStopTyping = (payload: any) => {
      if (payload?.conversationId !== matchId) {
        return;
      }

      if (payload?.userId === String(selectedUser?.userId)) {
        setIsOtherUserTyping(false);
      }
    };

    const handleSendMessageError = (payload: any) => {
      if (payload?.conversationId !== matchId) {
        return;
      }

      console.error("Failed to send message:", payload?.message);
    };

    const handleOnlineUsers = (onlineUserIds: string[]) => {
      setIsOtherUserOnline(
        onlineUserIds.includes(String(selectedUser?.userId)),
      );
    };
    const handleUserOnline = (userId: string) => {
      if (userId === String(selectedUser?.userId)) {
        setIsOtherUserOnline(true);
      }
    };

    const handleUserOffline = (userId: string) => {
      if (userId === String(selectedUser?.userId)) {
        setIsOtherUserOnline(false);
      }
    };

    const handleConversationJoined = (payload: any) => {
      console.log("JOINED CONVERSATION:", payload);
    };

    const handleJoinError = (payload: any) => {
      console.error("JOIN CONVERSATION ERROR:", payload);
    };

    socket.on("conversation_joined", handleConversationJoined);
    socket.on("join_conversation_error", handleJoinError);
    socket.on("receive_message", handleIncomingMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);
    socket.on("online_users", handleOnlineUsers);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("send_message_error", handleSendMessageError);

    socket.emit("join_conversation", matchId);
    // The "who's online" snapshot is only pushed automatically at the
    // moment a socket connects, which usually happens long before this
    // ChatWindow mounts — ask for a fresh one now so status is correct
    // even if the other user was already online.
    socket.emit("get_online_users");

    return () => {
      cancelled = true;

      setActiveConversationId(null);
      socket.emit("leave_conversation", matchId);

      socket.off("online_users", handleOnlineUsers);
      socket.off("conversation_joined", handleConversationJoined);
      socket.off("join_conversation_error", handleJoinError);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("receive_message", handleIncomingMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
      socket.off("send_message_error", handleSendMessageError);
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }

      setIsOtherUserTyping(false);
      setIsTyping(false);
    };
  }, [matchId]);

  useEffect(() => {
    // Scroll only this container's own scrollbar to its latest message.
    // scrollIntoView() on an end-marker element bubbles up through every
    // scrollable ancestor, including the page itself, which was dragging
    // the whole ChatWindow out of view on the surrounding layout whenever
    // a message came in or went out.
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const handleInputChange = (value: string) => {
    setInputText(value);

    if (!matchId || !selectedUser) {
      return;
    }

    if (!isTyping) {
      socket.emit("typing_start", {
        conversationId: matchId,
      });

      setIsTyping(true);
    }

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    typingTimer.current = setTimeout(() => {
      socket.emit("typing_stop", {
        conversationId: matchId,
      });

      setIsTyping(false);
    }, 1500);
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim() || !selectedUser || !matchId) {
      return;
    }

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    if (isTyping) {
      socket.emit("typing_stop", {
        conversationId: matchId,
      });

      setIsTyping(false);
    }

    const outboundText = inputText.trim();

    setInputText("");
    // console.log("SENDING MESSAGE:", {
    //   connected: socket.connected,
    //   matchId,
    //   outboundText,
    // });

    socket.emit("send_message", {
      conversationId: matchId,
      content: outboundText,
    });
  };

  // Split the flat message list into runs that share a local calendar day,
  // so each run can be introduced by its own Today / Yesterday / date divider.
  const messageGroups: { dayKey: string; label: string; items: Message[] }[] =
    [];
  for (const message of messages) {
    const dayKey = getDayKey(message.sentAt);
    const lastGroup = messageGroups[messageGroups.length - 1];

    if (lastGroup && lastGroup.dayKey === dayKey) {
      lastGroup.items.push(message);
    } else {
      messageGroups.push({
        dayKey,
        label: formatDayLabel(message.sentAt),
        items: [message],
      });
    }
  }

  return (
    // Below md an open chat takes over the whole screen (covering the site
    // navbar) so the only header is the chat's own back / avatar / name bar.
    <div
      className={`lg:flex ${
        conversation
          ? "fixed inset-x-0 top-0 z-50 h-dvh bg-white md:static md:z-auto md:h-auto md:bg-transparent"
          : ""
      }`}
    >
      {/* Outer Card Wrapper with responsive layout dimensions */}
      <div className="flex flex-col justify-between sm:w-full min-w-0 h-full lg:max-w-209 md:max-w-209 md:h-150 lg:h-150 lg:my-15 md:my-15 md:border-solid lg:border-solid lg:border md:border border-none md:border-[#1c1524]/[0.0784] lg:border-[#1c1524]/[0.0784] lg:rounded-r-3xl md:rounded-3xl my-0 lg:rounded-l-none">
        {/* Chat Header: Back Button, Profile Avatar, Name */}
        <div className="flex justify-between px-3 md:px-6 py-3 md:py-4 items-center border-b border-[#1c1524]/[0.0784]">
          <div className="flex gap-3 items-center min-w-0">
            {/* Mobile Back Button */}
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to conversations"
              className="lg:hidden p-2 -ml-1 text-gray-500 hover:text-purple-600 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </button>

            {/* Recipient Photo (with a presence dot below lg, where the
                Active/Offline badge is hidden to keep the header minimal) */}
            <div className="relative shrink-0">
              <img
                src={selectedUser?.profilePicture}
                alt={selectedUser?.fullName}
                className="rounded-full w-10 h-10 object-cover"
              />
              {selectedUser && (
                <span
                  className={`lg:hidden absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                    isOtherUserOnline ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>

            {/* Recipient Details */}
            <div className="flex flex-col min-w-0">
              <p className="font-semibold text-[15px] font-[Geist] truncate">
                {selectedUser?.fullName || "Select a Profile"}
              </p>

              <p className="text-[13px] text-gray-500 font-[Geist] truncate">
                {isOtherUserTyping
                  ? "Typing..."
                  : selectedUser?.location || "No active location"}
              </p>
            </div>
          </div>

          {/* Active/Offline badge — shown at every size; below lg the
              avatar's presence dot backs it up */}
          <div
            className={`shrink-0 rounded-md py-0.5 px-2 text-[11px] ${
              isOtherUserOnline
                ? "bg-purple-50 text-purple-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isOtherUserOnline ? "Active" : "Offline"}
          </div>
        </div>

        {/* Chat Messages Feed Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 p-5 overflow-y-auto flex flex-col gap-3 md:bg-white lg:bg-white sm:bg-gray-50 bg-gray-50 justify-start [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar:none] px-2"
        >
          {isLoadingMessages && messages.length === 0 ? (
            /* History still loading — show neither the empty-state banner
               nor the starter chips, since the conversation may not be empty */
            <p className="text-center text-xs text-slate-400 py-4">
              Loading messages…
            </p>
          ) : messages.length === 0 ? (
            /* Empty State Banner when no messages exist */
            <div className="flex justify-center h-11 text-purple-600 bg-purple-100 lg:rounded-3xl md:rounded-3xl rounded-lg p-3 text-sm max-w-[90%] mx-auto w-full text-center border md:border-none lg:border-none border-solid border-gray-200">
              Break the ice and keep it genuine and friendly
            </div>
          ) : (
            /* Rendered Message List, one section per calendar day */
            <div className="w-full flex flex-col gap-3 justify-start">
              {messageGroups.map((group) => (
                <div key={group.dayKey} className="flex flex-col gap-3">
                  <p className="text-center text-[11px] text-slate-500 uppercase">
                    {group.label}
                  </p>

                  {group.items.map((msg) => {
                    // Determine if message belongs to logged-in user
                    const isUser = msg.senderId === String(user?.id);

                    return (
                      <div
                        key={msg.id}
                        className={`flex w-full min-w-0 ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] rounded-2xl px-4 py-2 text-sm shadow-sm break-words [overflow-wrap:anywhere] ${
                            isUser
                              ? "bg-purple-600 text-white rounded-br-none"
                              : "bg-gray-100 text-gray-800 rounded-bl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                          <p
                            className={`mt-1 text-[10px] leading-none text-right ${
                              isUser ? "text-purple-200" : "text-gray-400"
                            }`}
                          >
                            {formatMessageTime(msg.sentAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Bar & Preset Quick-Reply Chips */}
        {!isLoadingMessages && messages.length === 0 && (
          <div className="flex flex-wrap gap-3 px-2">
            {/* Quick Starter Chips */}

            <button
              type="button"
              onClick={() =>
                selectedUser && setInputText("What's your Favorite music")
              }
              className="border border-solid rounded-3xl py-1 px-2 border-[#1c1524]/[0.0784] text-sm max-w-34 h-8.25 hover:bg-gray-50"
            >
              Ask about music
            </button>

            <button
              type="button"
              onClick={() =>
                selectedUser && setInputText("Do you like traveling?")
              }
              className="border border-solid rounded-3xl py-1 px-2 border-[#1c1524]/[0.0784] text-[13px] max-w-34 max-h-8.25 hover:bg-gray-50"
            >
              Talk about Travel
            </button>

            <button
              type="button"
              onClick={() => selectedUser && setInputText("Talk about Art")}
              className="border border-solid rounded-3xl py-1 px-2 border-[#1c1524]/[0.0784] text-[13px] max-w-33.5 max-h-8.25 hover:bg-gray-50"
            >
              Talk about Art
            </button>

            <button
              type="button"
              onClick={() => selectedUser && setInputText("Hello")}
              className="border border-solid rounded-3xl py-1 px-2 border-[#1c1524]/[0.0784] text-[13px] max-w-34 max-h-8.25 hover:bg-gray-50"
            >
              Say Simple Hello
            </button>
          </div>
        )}
        {/* Text Input Form */}
        <form className="flex gap-3 p-2" onSubmit={handleFormSubmit}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={!selectedUser}
            placeholder={
              selectedUser
                ? `Write a genuine message to ${selectedUser.fullName.split(" ")[0]}`
                : "Select a Profile"
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
  );
};

export default ChatWindow;
