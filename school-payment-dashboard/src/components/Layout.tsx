import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Layout() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="p-4 flex justify-between bg-gray-800 text-white">
        <div className="flex gap-4">
          <Link to="/">Overview</Link>
          <Link to="/transactions/by-school">By School</Link>
          <Link to="/transactions/status">Status</Link>
          <Link to="/create-payment">Create Payment</Link>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>
      <main className="p-4 flex-1 bg-gray-50  text-black ">
        <Outlet />
      </main>
    </div>
  );
}
