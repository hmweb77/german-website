export default function ProgressBar({ value = 0, className = '' }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={`w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-[#FFCC00] transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
