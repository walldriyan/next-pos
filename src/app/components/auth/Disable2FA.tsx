// file: components/auth/Disable2FA.tsx

"use client";

import { useState } from "react";

export default function Disable2FA() {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to disable 2FA.");
      }

      setSuccessMessage(data.message);
      setIsCompleted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  };

  if (isCompleted) {
    return (
      <div className="p-6 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-md">
        <h3 className="font-bold text-lg">Success!</h3>
        <p>{successMessage}</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Disable Two-Factor Authentication</h2>
      <p className="mb-4 text-gray-600">
        To disable 2FA, please enter your current password to confirm your identity.
      </p>
      <form onSubmit={handleDisable2FA}>
        <div className="flex flex-col space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your current password"
            required
            className="p-2 border rounded-md"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 disabled:bg-gray-400"
            disabled={isLoading || !password}
          >
            {isLoading ? "Disabling..." : "Disable 2FA"}
          </button>
        </div>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
