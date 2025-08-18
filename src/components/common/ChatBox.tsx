import React, { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
};

const ChatBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Detect mobile screen size and viewport height
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
      setViewportHeight(window.innerHeight);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Load messages from localStorage
  const loadMessages = (): Message[] => {
    try {
      const saved = localStorage.getItem("flyjourney-chat-messages");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn("Failed to load chat messages from localStorage:", error);
    }
    return [
      {
        id: "m1",
        role: "assistant",
        text: "Xin chào! Tôi có thể giúp gì cho bạn?",
        timestamp: Date.now(),
      },
    ];
  };

  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(
        "flyjourney-chat-messages",
        JSON.stringify(messages)
      );
    } catch (error) {
      console.warn("Failed to save chat messages to localStorage:", error);
    }
  }, [messages]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Handle mobile keyboard visibility
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleResize = () => {
      // Update viewport height and scroll to bottom
      setViewportHeight(window.innerHeight);
      setTimeout(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile, isOpen]);

  // Calculate dynamic max height based on viewport and zoom
  const calculateMaxHeight = () => {
    const safeHeight = viewportHeight || window.innerHeight;

    // Fixed component heights in pixels (these don't scale with zoom)
    const headerHeight = 60;
    const quickRepliesHeight = 90;
    const inputHeight = 70;
    const margins = 40;

    // Total fixed height for non-scrollable areas
    const fixedHeight =
      headerHeight + quickRepliesHeight + inputHeight + margins;

    // Calculate available height for messages area
    const availableHeight = safeHeight - fixedHeight;

    // For very small viewports (like with dev tools + zoom), use percentage-based approach
    if (safeHeight < 400) {
      return Math.max(120, safeHeight * 0.4); // Minimum 120px or 40% of viewport
    }

    // For normal viewports, ensure we have reasonable bounds
    const minHeight = Math.max(150, safeHeight * 0.25);
    const maxHeight = Math.min(safeHeight * 0.75, 500);

    return Math.max(minHeight, Math.min(maxHeight, availableHeight));
  };

  // Force recalculation when chatbox opens to ensure it fits in viewport
  useEffect(() => {
    if (isOpen) {
      // Small delay to let the animation start
      setTimeout(() => {
        setViewportHeight(window.innerHeight);
      }, 50);
    }
  }, [isOpen]);

  const toggleChat = () => setIsOpen((s) => !s);
  const quickReplies = [
    "Hướng dẫn tìm chuyến (Search)",
    "Hướng dẫn đặt vé (Booking)",
    "Thanh toán / Lỗi thanh toán",
    "Quản lý đặt chỗ (MyBookings)",
  ];

  const handleQuickReply = (text: string) => {
    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      text,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);

    // realistic guidance based on the site's flows (no API)
    setTimeout(() => {
      let replyText = "";
      if (text === "Hướng dẫn tìm chuyến (Search)") {
        replyText =
          "Để tìm chuyến: vào trang Search → chọn điểm đi/đến, ngày, số hành khách → nhấn Tìm kiếm. Dùng bộ lọc (giờ bay, hãng, giá) để thu hẹp kết quả. Nhấn vào một kết quả để xem chi tiết và tiếp tục đặt vé.";
      } else if (text === "Hướng dẫn đặt vé (Booking)") {
        replyText =
          "Sau khi chọn chuyến: kiểm tra hành trình → điền thông tin hành khách (chính xác theo giấy tờ) → chọn hành lý/ghế nếu cần → xác nhận và thanh toán. Bạn sẽ nhận mã đặt chỗ và email xác nhận khi hoàn tất.";
      } else if (text === "Thanh toán / Lỗi thanh toán") {
        replyText =
          "Hệ thống hỗ trợ thẻ nội địa/quốc tế và ví (nếu cấu hình). Nếu lỗi: kiểm tra số dư, thử thẻ khác, xóa cache hoặc thử trình duyệt ẩn danh. Nếu giao dịch đã bị trừ nhưng chưa có xác nhận, gửi ảnh chụp giao dịch và mã đặt chỗ cho support.";
      } else if (text === "Quản lý đặt chỗ (MyBookings)") {
        replyText =
          "Vào My Bookings (cần đăng nhập) để xem/inh vé, thay đổi/hủy (nếu chính sách cho phép) hoặc thêm dịch vụ. Nếu bạn không đăng nhập, dùng mã đặt chỗ và email để tra cứu.";
      } else {
        replyText =
          "Mình cần thêm thông tin để hỗ trợ — bạn mô tả cụ thể tình huống nhé.";
      }

      const reply: Message = {
        id: `r-${Date.now()}`,
        role: "assistant",
        text: replyText,
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, reply]);
    }, 400);
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      text: trimmed,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Placeholder assistant reply (no API integration as requested)
    setTimeout(() => {
      const reply: Message = {
        id: `r-${Date.now()}`,
        role: "assistant",
        text: "Cảm ơn câu hỏi của bạn. Hiện tại tôi đang ở chế độ demo, tôi sẽ hướng dẫn bạn khi cần.",
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, reply]);
    }, 700);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearChat = () => {
    const initialMessage: Message = {
      id: "m1",
      role: "assistant",
      text: "Xin chào! Tôi có thể giúp gì cho bạn?",
      timestamp: Date.now(),
    };
    setMessages([initialMessage]);
    localStorage.removeItem("flyjourney-chat-messages");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div>
      {/* Floating toggle button */}
      <button
        aria-label={isOpen ? "Đóng chat" : "Mở chat"}
        aria-expanded={isOpen}
        onClick={toggleChat}
        className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-[9999] flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-600 text-white shadow-2xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/40 transition-all duration-200">
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.97-4.03 9-9 9a9.004 9.004 0 01-8.485-5.978L3 21l2.978-1.485A8.99 8.99 0 003 12c0-4.97 4.03-9 9-9s9 4.03 9 9z"
            />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className={`fixed z-[9999] flex flex-col bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300 ${
            isMobile
              ? "inset-x-2 bottom-16 top-20" // Mobile: full screen with margins
              : "right-2 sm:right-4 lg:right-6 w-[calc(100vw-1rem)] sm:w-80 md:w-96 lg:w-[28rem] xl:w-[32rem]" // Desktop: positioned
          }`}
          style={{
            maxHeight: isMobile
              ? "calc(100vh - 9rem)" // Mobile: safe area
              : `${calculateMaxHeight()}px`, // Desktop: dynamic
            bottom: "1rem", // Fixed distance from bottom
            // Ensure the chat never goes above a certain point to keep input visible
            top: isMobile ? "5rem" : "auto",
            minHeight: "200px", // Guarantee minimum usable height
          }}>
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h4 className="text-xs sm:text-sm font-medium">
                Hỗ trợ kỹ thuật
              </h4>
              <span className="text-xs opacity-75 hidden sm:inline">
                Online
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="text-white opacity-70 hover:opacity-100 focus:outline-none p-1 rounded hover:bg-white/10 transition-colors"
                title="Xóa cuộc trò chuyện">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={toggleChat}
                className="text-white opacity-90 hover:opacity-100 focus:outline-none p-1 rounded hover:bg-white/10 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              </button>
            </div>
          </div>

          <div
            ref={messagesRef}
            className="flex-1 overflow-y-auto bg-gray-50 space-y-3 sm:space-y-4 p-3 sm:p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            style={{
              minHeight: "80px", // Reduced minimum to save space
              maxHeight: "calc(100% - 160px)", // Leave space for header + quick replies + input
            }}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                } group`}>
                <div
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  } max-w-[90%] sm:max-w-[85%]`}>
                  <div
                    className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-blue-600 text-white rounded-br-md shadow-sm"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm"
                    }`}>
                    {m.text}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatTime(m.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick replies */}
          <div className="flex-shrink-0 px-3 sm:px-4 py-1 sm:py-2 bg-white border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Câu hỏi thường gặp:</p>
            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuickReply(q)}
                  className="text-xs px-2 sm:px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full border border-blue-200 transition-colors whitespace-nowrap">
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input area - always at bottom */}
          <div className="flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px]"
                onFocus={() => {
                  // On mobile, scroll to bottom when input is focused
                  if (isMobile && messagesRef.current) {
                    setTimeout(() => {
                      messagesRef.current!.scrollTop =
                        messagesRef.current!.scrollHeight;
                    }, 300);
                  }
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0 min-w-[40px] h-[40px]">
                <svg
                  className="w-4 h-4 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
