import { useEffect, useState } from "react";

/** Date de départ du récit fictif du gabarit legacy (reprise telle quelle, cf. conception
 *  U8 §4, point ouvert 1) — à remplacer par la date réelle de la Chapelle du Vœux. */
const ADORATION_START = new Date("1885-08-01T00:00:00");

export function AdorationLive() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const ss = time.getSeconds().toString().padStart(2, "0");
  const daysSince = Math.floor((time.getTime() - ADORATION_START.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-night-950">
      <div className="absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 animate-glow"
          style={{ background: "radial-gradient(circle, rgba(212,149,30,0.4) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-400" />
          </span>
          <span className="text-gold-300 text-xs tracking-[0.25em] uppercase font-medium">En ce moment</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ivory mb-4">
          Un veilleur prie en cet instant
        </h2>
        <p className="text-ivory/50 max-w-xl mx-auto mb-12 leading-relaxed">
          Devant le Saint-Sacrement exposé jour et nuit, la chaîne de prière n'a jamais été interrompue depuis 1885.
        </p>

        <div className="inline-flex items-baseline gap-1 sm:gap-2 mb-12" role="timer" aria-label="Heure actuelle">
          <div className="font-serif text-6xl sm:text-7xl lg:text-8xl font-bold text-gold-400 tabular-nums tracking-tight">
            {hh}
          </div>
          <div className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-gold-400/60 -translate-y-2">
            :
          </div>
          <div className="font-serif text-6xl sm:text-7xl lg:text-8xl font-bold text-gold-400 tabular-nums tracking-tight">
            {mm}
          </div>
          <div className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-gold-400/60 -translate-y-2">
            :
          </div>
          <div className="font-serif text-6xl sm:text-7xl lg:text-8xl font-bold text-gold-400/40 tabular-nums tracking-tight transition-all duration-1000">
            {ss}
          </div>
        </div>

        <div className="grid grid-cols-2 max-w-md mx-auto gap-px bg-gold-500/10 rounded-2xl overflow-hidden border border-gold-500/20">
          <div className="bg-night-950/80 backdrop-blur-sm p-6">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-gold-400 tabular-nums">
              {daysSince.toLocaleString("fr-FR")}
            </div>
            <div className="text-ivory/40 text-[10px] sm:text-xs tracking-[0.2em] uppercase mt-1">
              Jours de prière
            </div>
          </div>
          <div className="bg-night-950/80 backdrop-blur-sm p-6">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-gold-400 tabular-nums">∞</div>
            <div className="text-ivory/40 text-[10px] sm:text-xs tracking-[0.2em] uppercase mt-1">
              Intentions portées
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
