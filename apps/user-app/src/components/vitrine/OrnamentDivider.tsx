export interface OrnamentDividerProps {
  className?: string;
}

export function OrnamentDivider({ className = "max-w-md mx-auto" }: OrnamentDividerProps) {
  return (
    <div className={`flex items-center justify-center gap-3 mb-8 ${className}`}>
      <span className="h-px w-16 bg-gold-400/50" />
      <span className="text-gold-400 text-lg">✦</span>
      <span className="h-px w-16 bg-gold-400/50" />
    </div>
  );
}
