export function EmptyState() {
  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-[#FAFBFC]">
      {/* World map background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <WorldMapSVG />
      </div>

      {/* Floating icons */}
      <FloatingIcon className="top-[12%] left-[15%]" delay="0s" size={40}>
        <PersonIcon />
      </FloatingIcon>
      <FloatingIcon className="top-[8%] right-[18%]" delay="1s" size={48}>
        <BuildingIcon />
      </FloatingIcon>
      <FloatingIcon className="top-[35%] left-[8%]" delay="0.5s" size={32}>
        <ChartIcon />
      </FloatingIcon>
      <FloatingIcon className="bottom-[20%] right-[12%]" delay="2s" size={36}>
        <FilterIcon />
      </FloatingIcon>
      <FloatingIcon className="bottom-[35%] left-[20%]" delay="1.5s" size={28}>
        <StarIcon />
      </FloatingIcon>

      {/* Center text */}
      <div className="z-10 text-center max-w-md px-8">
        <p className="text-lg text-gray-500 font-normal leading-relaxed">
          <strong className="text-gray-700 font-semibold">Select filters</strong> on the left
          to define your audience, then click{" "}
          <strong className="text-gray-700 font-semibold">Generate Audience</strong> to preview
          matching prospects.
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}

function FloatingIcon({
  children,
  className,
  delay,
  size,
}: {
  children: React.ReactNode;
  className: string;
  delay: string;
  size: number;
}) {
  return (
    <div
      className={`absolute text-[#0B2B3C] pointer-events-none select-none ${className}`}
      style={{
        opacity: 0.12,
        width: size,
        height: size,
        animation: `float 6s ease-in-out infinite ${delay}`,
      }}
    >
      {children}
    </div>
  );
}

function WorldMapSVG() {
  const dots = generateWorldDots();
  return (
    <svg
      viewBox="0 0 960 500"
      className="w-[85%] max-w-[900px] opacity-[0.06]"
      fill="#0B2B3C"
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={2.5} />
      ))}
    </svg>
  );
}

function generateWorldDots(): { x: number; y: number }[] {
  const dots: { x: number; y: number }[] = [];
  const spacing = 14;
  for (let x = 0; x < 960; x += spacing) {
    for (let y = 0; y < 500; y += spacing) {
      if (isLand(x / 960, y / 500)) {
        dots.push({ x, y });
      }
    }
  }
  return dots;
}

function isLand(nx: number, ny: number): boolean {
  const continents = [
    { x1: 0.05, y1: 0.05, x2: 0.28, y2: 0.55 },
    { x1: 0.14, y1: 0.42, x2: 0.28, y2: 0.90 },
    { x1: 0.42, y1: 0.06, x2: 0.58, y2: 0.36 },
    { x1: 0.43, y1: 0.28, x2: 0.60, y2: 0.82 },
    { x1: 0.55, y1: 0.05, x2: 0.95, y2: 0.62 },
    { x1: 0.75, y1: 0.58, x2: 0.92, y2: 0.82 },
  ];
  return continents.some(
    (c) => nx >= c.x1 && nx <= c.x2 && ny >= c.y1 && ny <= c.y2
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
    </svg>
  );
}
