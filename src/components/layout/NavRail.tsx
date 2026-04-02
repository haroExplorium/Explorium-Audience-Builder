"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NavRail() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/key", { method: "DELETE" });
    router.push("/setup");
    router.refresh();
  }

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-14 bg-white border-r border-gray-200 flex flex-col items-center pt-3 z-50">
      {/* Logo */}
      <div className="w-9 h-9 bg-[#1A73E8] rounded-lg flex items-center justify-center text-white font-bold text-sm mb-5">
        E
      </div>

      {/* Primary nav */}
      <NavItem icon={<UsersIcon />} label="Audience Builder" active />

      <div className="flex-1" />

      {/* Settings with dropdown */}
      <div className="relative">
        <div
          onClick={() => setSettingsOpen((v) => !v)}
          className={`relative group w-10 h-10 rounded-lg flex items-center justify-center mb-1 cursor-pointer transition-colors
            ${settingsOpen ? "bg-[#E3F2FD] text-[#1A73E8]" : "text-gray-400 hover:bg-[#E3F2FD] hover:text-[#1A73E8]"}`}
        >
          <SettingsIcon />
          {!settingsOpen && (
            <span className="hidden group-hover:block absolute left-[52px] bg-gray-800 text-white text-xs px-2.5 py-1 rounded whitespace-nowrap z-50">
              Settings
            </span>
          )}
        </div>
        {settingsOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setSettingsOpen(false)}
            />
            <div className="absolute left-12 bottom-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  router.push("/setup");
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <KeyIcon />
                Change API Key
              </button>
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogoutIcon />
                Log Out
              </button>
            </div>
          </>
        )}
      </div>

      <NavItem icon={<HelpIcon />} label="Help" className="mb-3" />
    </nav>
  );
}

function NavItem({
  icon,
  label,
  active,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative group w-10 h-10 rounded-lg flex items-center justify-center mb-1 cursor-pointer transition-colors
        ${active ? "bg-[#E3F2FD] text-[#1A73E8]" : "text-gray-400 hover:bg-[#E3F2FD] hover:text-[#1A73E8]"}
        ${className}`}
    >
      {icon}
      <span className="hidden group-hover:block absolute left-[52px] bg-gray-800 text-white text-xs px-2.5 py-1 rounded whitespace-nowrap z-50">
        {label}
      </span>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}
function HelpIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function KeyIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
