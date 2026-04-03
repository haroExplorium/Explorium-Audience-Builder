"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to save API key");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 px-8 py-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-[#1A73E8] rounded-xl flex items-center justify-center text-white font-bold text-xl">
              E
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-serif text-gray-900 text-center mb-1">
            Welcome to Explorium
          </h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            Enter your Explorium API key to start building prospect lists
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Key input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Explorium API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="ex_live_••••••••••••••••"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg text-sm font-mono outline-none transition-all
                    focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10
                    placeholder:text-gray-300 placeholder:font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showKey ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg">
                <AlertIcon />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!apiKey.trim() || loading}
              className="w-full bg-[#1A73E8] text-white py-3 rounded-lg text-sm font-semibold
                hover:bg-[#1565C0] transition-colors
                shadow-[0_2px_8px_rgba(26,115,232,0.3)]
                disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Validating...
                </>
              ) : (
                "Save & Get Started"
              )}
            </button>
          </form>

          {/* Help text */}
          <p className="text-xs text-gray-400 text-center mt-6">
            Find your API key in the{" "}
            <a
              href="https://app.explorium.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1A73E8] hover:underline"
            >
              Explorium dashboard
            </a>
            . Your key is stored securely in a browser cookie and never
            sent to any third party.
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Explorium Audience Builder
        </p>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
