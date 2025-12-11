import { useState, useEffect, useRef } from "react";
import { sendAgentMessage, getWelcomeMessage } from "../services/api";
import { Bot, Send, Sparkles, Check, AlertCircle, Zap } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const AIChat = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const messagesEndRef = useRef(null);
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  useEffect(() => {
    // Load welcome message
    loadWelcome();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadWelcome = async () => {
    try {
      const welcome = await getWelcomeMessage(userId);
      if (welcome.isNewUser) {
        setIsNewUser(true);
        setMessages([
          {
            role: "assistant",
            content: welcome.message,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages([
          {
            role: "assistant",
            content:
              "👋 Welcome back! I'm your AI financial agent. Tell me what you'd like to work on today, or just chat naturally about your finances.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading welcome:", error);
      setMessages([
        {
          role: "assistant",
          content:
            "👋 Hi! I'm your AI financial agent. Just tell me about your finances naturally, and I'll help you track and manage everything!",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    const userMsg = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Send to agent endpoint
      const response = await sendAgentMessage(userId, userMessage);

      // Add agent response with actions
      const agentMsg = {
        role: "assistant",
        content: response.message,
        actions: response.actions || [],
        actionCount: response.actionCount || 0,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, I encountered an error. Please try again or try rephrasing your message.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    {
      label: "📝 Add my income",
      message: "I make $5000 per month from my job",
    },
    {
      label: "💳 Track a debt",
      message: "I have a credit card with $8000 balance at 18% interest",
    },
    {
      label: "💰 Set savings goal",
      message: "I want to save $10000 for an emergency fund by next year",
    },
    {
      label: "📊 Analyze my finances",
      message: "Can you analyze my current financial situation?",
    },
  ];

  // Render action badges
  const renderActions = (actions) => {
    if (!actions || actions.length === 0) return null;

    const successfulActions = actions.filter((a) => a.success);

    return (
      <div className="mt-3 space-y-2">
        {successfulActions.map((action, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
          >
            <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-green-800 dark:text-green-300">
              {action.message}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 ${themeColors.primary} rounded-xl`}>
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Financial Agent
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Talk naturally - I'll track everything for you
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            Fully Automated
          </span>
        </div>
      </div>

      {/* Quick Actions - Show for new users or first message */}
      {messages.length <= 1 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Try saying...
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setInput(action.message)}
                className={`p-3 text-left ${themeColors.bg} hover:opacity-80 rounded-lg border ${themeColors.border} transition-all`}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="card h-[550px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-4 ${
                  message.role === "user"
                    ? `${themeColors.primary} text-white`
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-6 h-6 ${themeColors.primary} rounded-full flex items-center justify-center`}
                    >
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      AI Agent
                    </span>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                {message.actions && renderActions(message.actions)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Just talk naturally... 'I make $5000/month, spend $1200 on rent...'"
              className="flex-1 input-field resize-none"
              rows="2"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={`${themeColors.primary} px-6 self-end text-white rounded-lg disabled:opacity-50`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            ⚡ I'll automatically create entries from your messages • Press
            Enter to send
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* What I Can Do */}
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            What I Can Do
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
              <span>
                Automatically track income, expenses, debts, and goals
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
              <span>Create debt payoff plans with optimal strategies</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
              <span>Analyze your budget and suggest improvements</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
              <span>Answer questions about your financial health</span>
            </li>
          </ul>
        </div>

        {/* Tips */}
        <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            Tips for Best Results
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">
                💡
              </span>
              <span>Include numbers: "I make $5000" or "I owe $8000"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">
                💡
              </span>
              <span>Be conversational: "My rent is $1500 per month"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">
                💡
              </span>
              <span>For debts, mention interest rates if you know them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">
                💡
              </span>
              <span>Manual entry forms still available in other pages</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
