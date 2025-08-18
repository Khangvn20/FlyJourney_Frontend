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
        className="fixed right-6 bottom-6 z-[9999] flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/40 transition-all duration-200">
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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
            className="h-6 w-6"
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
        <div className="fixed right-6 bottom-20 z-[9999] w-80 md:w-[36rem] max-h-[75vh] flex flex-col bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h4 className="text-sm font-medium">Hỗ trợ kỹ thuật</h4>
              <span className="text-xs opacity-75">Online</span>
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
            className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4 min-h-[300px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                } group`}>
                <div
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  } max-w-[85%]`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed ${
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
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Câu hỏi thường gặp:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuickReply(q)}
                  className="text-xs md:text-sm px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full border border-blue-200 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-gray-100 bg-white">
            <div className="flex items-end gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                <svg
                  className="w-5 h-5"
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
