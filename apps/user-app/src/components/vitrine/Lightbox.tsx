import { useEffect } from "react";

interface LightboxImage {
  src: string;
  alt: string;
}

export interface LightboxProps {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNavigate((index + 1) % images.length);
      if (event.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, images.length, onClose, onNavigate]);

  const current = images[index];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 animate-fade-in"
      style={{ animationDuration: "0.4s" }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-night-950/95 backdrop-blur-xl" />

      <button
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label="Fermer"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-ivory transition-all duration-300 hover:rotate-90"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onNavigate((index - 1 + images.length) % images.length);
        }}
        aria-label="Image précédente"
        className="absolute left-2 sm:left-6 z-10 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-gold-500/30 backdrop-blur-md flex items-center justify-center text-ivory transition-all duration-300 hover:scale-110"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onNavigate((index + 1) % images.length);
        }}
        aria-label="Image suivante"
        className="absolute right-2 sm:right-6 z-10 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-gold-500/30 backdrop-blur-md flex items-center justify-center text-ivory transition-all duration-300 hover:scale-110"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div
        className="relative max-w-6xl max-h-[85vh] w-full"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <img
          key={current.src}
          src={current.src}
          alt={current.alt}
          className="w-full h-full max-h-[85vh] object-contain rounded-2xl shadow-2xl shadow-black/50 animate-fade-up"
          style={{ animationDuration: "0.5s" }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-night-950/80 to-transparent rounded-b-2xl">
          <p className="text-ivory font-serif text-base sm:text-lg">{current.alt}</p>
          <p className="text-gold-400/70 text-xs tracking-[0.2em] uppercase mt-1">
            {index + 1} / {images.length}
          </p>
        </div>
      </div>
    </div>
  );
}
