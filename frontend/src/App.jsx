import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Debts from "./pages/Debts";
import Savings from "./pages/Savings";
import Bills from "./pages/Bills";
import AIChat from "./pages/AIChat";
import Setup from "./pages/Setup";
import Navigation from "./components/Navigation";

function App() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user exists in localStorage
    const checkUser = async () => {
      const storedUserId = localStorage.getItem("userId");

      if (storedUserId) {
        // Verify user exists in database
        try {
          const response = await fetch(
            `http://localhost:3001/api/user/${storedUserId}`
          );
          const data = await response.json();

          if (data.success && data.user) {
            // User exists, use it
            setUserId(storedUserId);
          } else {
            // User doesn't exist, clear localStorage
            console.log("User not found in database, clearing localStorage");
            localStorage.removeItem("userId");
            setUserId(null);
          }
        } catch (error) {
          console.error("Error checking user:", error);
          localStorage.removeItem("userId");
          setUserId(null);
        }
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  // ADD THIS FUNCTION - handles user setup from Setup page
  const handleUserSetup = (id) => {
    localStorage.setItem("userId", id);
    setUserId(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!userId) {
    return <Setup onUserSetup={handleUserSetup} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navigation userId={userId} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<AIChat userId={userId} />} />
            <Route path="/chat" element={<AIChat userId={userId} />} />
            <Route path="/dashboard" element={<Dashboard userId={userId} />} />
            <Route path="/income" element={<Income userId={userId} />} />
            <Route path="/expenses" element={<Expenses userId={userId} />} />
            <Route path="/debts" element={<Debts userId={userId} />} />
            <Route path="/savings" element={<Savings userId={userId} />} />
            <Route path="/bills" element={<Bills userId={userId} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
