import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PiggyBank,
  Receipt,
  MessageSquare,
  Bot,
  LogOut,
} from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { useTheme } from "../contexts/ThemeContext";

const Navigation = ({ userId }) => {
  const location = useLocation();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();

  const navItems = [
    { path: "/chat", label: "AI Assistant", icon: Bot, highlight: true },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/income", label: "Income", icon: TrendingUp },
    { path: "/expenses", label: "Expenses", icon: TrendingDown },
    { path: "/debts", label: "Debts", icon: CreditCard },
    { path: "/savings", label: "Savings", icon: PiggyBank },
    { path: "/bills", label: "Bills", icon: Receipt },
  ];

  const handleLogout = () => {
    if (
      window.confirm(
        "Logout and return to setup? This will allow another user to login."
      )
    ) {
      localStorage.removeItem("userId");
      window.location.reload();
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                💰 Financial Hub
              </h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const isChat = item.path === "/chat";

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? `${themeColors.text} ${themeColors.border} border-b-2`
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    } ${isChat ? "font-semibold" : ""}`}
                  >
                    <Icon
                      className={`w-4 h-4 mr-2 ${
                        isChat ? "animate-pulse" : ""
                      }`}
                    />
                    {item.label}
                    {isChat && <span className="ml-1">⭐</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Theme Selector & Logout */}
          <div className="flex items-center gap-3">
            <ThemeSelector />
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden border-t border-gray-200 dark:border-gray-700">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isChat = item.path === "/chat";

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? `${themeColors.primary} text-white`
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                } ${isChat ? "font-semibold" : ""}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
                {isChat && <span className="ml-2">⭐</span>}
              </Link>
            );
          })}

          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
