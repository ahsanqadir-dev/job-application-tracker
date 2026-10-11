"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

 const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message);
      return;
    }

    localStorage.setItem("token", data.token);

    router.push("/");

  } catch (error) {
    console.error(error);
    setError("Something went wrong. Please try again.");

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Job Tracker
        </h1>

        <p className="text-gray-500 text-center mt-2 mb-8">
          Login to your account
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Password
            </label>

            <input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Enter your password"
  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
/>
          </div>
         {error && (
  <p className="text-red-600 text-sm">
    {error}
  </p>
)}
          <button
  type="submit"
  disabled={loading}
  className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
>
  {loading ? "Logging in..." : "Login"}
</button>

        </form>
        <p className="text-center text-gray-500 mt-6">
  Don't have an account?{" "}
  <button
    type="button"
    onClick={() => router.push("/register")}
    className="text-blue-600 hover:underline cursor-pointer"
  >
    Sign Up
  </button>
</p>

      </div>
    </div>
  );
}