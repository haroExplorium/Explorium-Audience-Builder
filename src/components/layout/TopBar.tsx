export function TopBar() {
  return (
    <div className="fixed top-0 left-14 right-0 h-[52px] bg-white border-b border-gray-200 flex items-center px-6 z-40">
      <span className="text-lg font-serif text-[#0B2B3C] tracking-tight">Explorium</span>
      <div className="w-px h-6 bg-gray-200 mx-4" />
      <span className="text-sm text-gray-500 font-medium">Audience Builder</span>
      <div className="flex-1" />
    </div>
  );
}
