import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigate("/");
    } catch {
      alert("Login failed");
    }
  };

  const handleSignup = async () => {
    try {
      await signup(email, password);
      alert("Signup successful, now login.");
    } catch {
      alert("Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Welcome Back
        </h1>

        {/* Email input */}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleLogin}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Login
          </button>
          <button
            onClick={handleSignup}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Signup
          </button>
        </div>
      </div>
    </div>
  );
}



// import { useState } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { login, signup } = useAuth();
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     try {
//       await login(email, password);
//       navigate("/");
//     } catch {
//       alert("Login failed");
//     }
//   };

//   const handleSignup = async () => {
//     try {
//       await signup(email, password);
//       alert("Signup successful, now login.");
//     } catch {
//       alert("Signup failed");
//     }
//   };

//   return (
//     <div className="max-w-sm mx-auto mt-20 p-6 border rounded">
//       <h1 className="text-2xl mb-4">Login</h1>
//       <input
//         type="email"
//         placeholder="Email"
//         className="w-full border p-2 mb-2"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         className="w-full border p-2 mb-2"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <div className="flex gap-2">
//         <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
//           Login
//         </button>
//         <button onClick={handleSignup} className="bg-green-500 text-white px-4 py-2 rounded">
//           Signup
//         </button>
//       </div>
//     </div>
//   );
// }
