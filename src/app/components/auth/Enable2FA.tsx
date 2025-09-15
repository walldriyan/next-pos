// file: components/auth/Enable2FA.tsx

"use client";

import { useState } from "react";
import Image from "next/image";

// 2FA සක්‍රීය කිරීමේ ක්‍රියාවලිය සඳහා වන component එක
export default function Enable2FA() {
  // Component එකේ විවිධ තත්ත්වයන් (states) කළමනාකරණය කිරීම
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // 1. "Enable 2FA" බොත්තම click කළ විට, QR කේතය සහ රහස ලබාගැනීම
  const handleGenerateSecret = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/2fa/enable", { method: "GET" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to generate 2FA secret.");
      }
      const data = await res.json();
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. OTP එක ඇතුළත් කර "Verify" බොත්තම click කළ විට, එය තහවුරු කිරීම
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !secret) {
      setError("OTP and secret are missing.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, secret }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to verify OTP.");
      }

      setSuccessMessage(data.message);
      setIsCompleted(true); // ක්‍රියාවලිය සාර්ථකව අවසන්
      setQrCodeUrl(null); // QR කේතය තවදුරටත් නොපෙන්වීම
    } catch (err: any) {
      setError(err.message);
      // වැරදි OTP එකක් නම්, input field එක clear කිරීම
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  // 2FA දැනටමත් සක්‍රීය කර ඇත්නම් පෙන්වන පණිවිඩය
  if (isCompleted) {
    return (
      <div className="p-6 bg-green-100 border border-green-400 text-green-700 rounded-md">
        <h3 className="font-bold text-lg">Success!</h3>
        <p>{successMessage || "Two-Factor Authentication has been enabled."}</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Enable Two-Factor Authentication (2FA)</h2>

      {/* QR කේතය සහ OTP ඇතුළත් කිරීමේ කොටස */}
      {qrCodeUrl && secret ? (
        <form onSubmit={handleVerifyOtp}>
          <p className="mb-4">
            1. Scan the QR code below with your authenticator app (e.g., Google Authenticator, Authy).
          </p>
          <div className="flex justify-center my-4">
            <Image src={qrCodeUrl} alt="2FA QR Code" width={200} height={200} />
          </div>
          <p className="mb-4">
            2. Enter the 6-digit code from your app to complete the setup.
          </p>
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
              className="p-2 border rounded-md text-center tracking-widest text-lg"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify & Enable"}
            </button>
          </div>
        </form>
      ) : (
        // 2FA ක්‍රියාවලිය ආරම්භ කිරීමේ බොත්තම
        <div>
          <p className="mb-4">
            Secure your account by enabling Two-Factor Authentication.
          </p>
          <button
            onClick={handleGenerateSecret}
            className="bg-blue-500 text-white p-2 rounded-md w-full hover:bg-blue-600 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Enable 2FA"}
          </button>
        </div>
      )}

      {/* Error සහ Success පණිවිඩ පෙන්වීම */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {successMessage && !isCompleted && <p className="text-green-500 mt-4">{successMessage}</p>}
    </div>
  );
}
