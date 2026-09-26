import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Lightbox from "../components/Lightbox";
import AdorationLive from "../components/AdorationLive";

const news = [
  {
    id: 1,
    title: "Célébration de la Pentecôte 2026",
    date: "15 juin 2026",
    image: "/images/gallery-2.jpg",
    excerpt: "Rejoignez-nous pour la grande célébration de la Pentecôte, un temps fort de prière et de communion fraternelle.",
    category: "Célébration",
  },
  {
    id: 2,
    title: "Nouveaux horaires d'adoration",
    date: "2 juin 2026",
    image: "/images/gallery-3.jpg",
    excerpt: "À partir de juillet, l'adoration eucharistique sera étendue à de nouveaux créneaux pour mieux vous accueillir.",
    category: "Annonce",
  },
  {
    id: 3,
    title: "Restauration des mosaïques",
    date: "20 mai 2026",
    image: "/images/gallery-1.jpg",
    excerpt: "Les travaux de restauration des mosaïques du chœur avancent magnifiquement. Découvrez les premières images.",
    category: "Patrimoine",
  },
];

const gallery = [
  { src: "/images/gallery-1.jpg", alt: "Mosaïques du chœur" },
  { src: "/images/gallery-2.jpg", alt: "Jardin de prière" },
  { src: "/images/gallery-3.jpg", alt: "Lueur spirituelle" },
  { src: "/images/gallery-4.jpg", alt: "Aube sur la basilique" },
  { src: "/images/interior.jpg", alt: "Intérieur sacré" },
  { src: "/images/hero-bg.jpg", alt: "Vue panoramique" },
];

const testimonials = [
  {
    text: "Un lieu d'une beauté saisissante où l'âme trouve enfin le silence. Chaque visite est une renaissance.",
    author: "Marie L.",
    role: "Fidèle depuis 2019",
  },
  {
    text: "L'adoration perpétuelle a transformé ma vie spirituelle. Je ressens une paix profonde à chaque veillée.",
    author: "Jean-Paul D.",
    role: "Veilleur",
  },
  {
    text: "Venir ici, c'est comme poser ses valises après un long voyage. Le Sacré-Cœur est un refuge pour le cœur.",
    author: "Sophie M.",
    role: "Visiteuse",
  },
];

export default function Home() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <main>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero-bg.jpg" alt="Sanctuaire du Sacré-Cœur" className="w-full h-full object-cover scale-105 animate-fade-in" style={{ animationDuration: "2s" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-night-950/75 via-night-950/40 to-night-950/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 via-transparent to-transparent" />
          {/* Subtle vignette */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 0%, rgba(10,13,26,0.4) 100%)" }} />
        </div>

        {/* Floating gold particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gold-400/40 rounded-full animate-float"
              style={{
                left: `${(i * 47) % 100}%`,
                top: `${(i * 31) % 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${4 + (i % 4)}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto pt-20">
          <div className="animate-fade-down">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="block h-px w-8 bg-gold-400/60" />
              <span className="text-gold-400 text-xs sm:text-sm tracking-[0.35em] uppercase font-medium">
                Sanctuaire du Sacré-Cœur
              </span>
              <span className="block h-px w-8 bg-gold-400/60" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-ivory leading-[1.1] mb-8 animate-fade-up"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            Un cœur qui bat
            <br />
            <span className="text-gradient italic">pour le monde</span>
          </h1>
          <p className="text-ivory/75 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up font-light"
            style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
            Depuis plus d'un siècle, le Sacré-Cœur veille sur Paris. Un sanctuaire de paix, 
            d'adoration perpétuelle et de miséricorde, ouvert jour et nuit à tous.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.6s", animationFillMode: "both" }}>
            <Link to="/inscription-veilleur" className="btn-primary text-sm sm:text-base">
              Devenir veilleur
            </Link>
            <Link to="/actualites" className="btn-outline text-sm sm:text-base">
              Découvrir l'actualité
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute -bottom-2 sm:bottom-10 left-1/2 -translate-x-1/2 animate-float hidden sm:block">
            <div className="flex flex-col items-center gap-3">
              <span className="text-ivory/40 text-[10px] tracking-[0.3em] uppercase">Explorer</span>
              <div className="w-6 h-10 rounded-full border-2 border-ivory/30 flex items-start justify-center p-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative bg-gradient-to-r from-night-900 via-night-950 to-night-900 border-y border-gold-500/10 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(212,149,30,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 text-center">
            {[
              { value: "140+", label: "Années d'adoration" },
              { value: "365j", label: "Ouvert toute l'année" },
              { value: "24/7", label: "Présence ininterrompue" },
              { value: "11M", label: "Visiteurs par an" },
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-2 transition-transform duration-500 group-hover:scale-110">
                  {stat.value}
                </div>
                <div className="text-ivory/50 text-xs sm:text-sm tracking-[0.2em] uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRESENTATION */}
      <section id="presentation" data-reveal className="relative py-24 lg:py-32 bg-ivory overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl" />

        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible("presentation") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-night-950/10">
                <img src="/images/interior.jpg" alt="Intérieur du sanctuaire" className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-night-950/40 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold-500/10 rounded-3xl -z-10" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-gold-500/5 rounded-3xl -z-10" />
            </div>

            <div>
              <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">
                Notre sanctuaire
              </span>
              <h2 className="section-title text-night-900 mt-3 mb-6">
                Un lieu saint au cœur<br />de la ville
              </h2>
              <div className="ornament-divider mb-8">
                <span className="icon">✦</span>
              </div>
              <div className="space-y-5 text-night-600/80 leading-relaxed">
                <p>
                  Perché sur la butte Montmartre, le Sanctuaire du Sacré-Cœur est bien plus qu'un monument. 
                  C'est un appel à la contemplation, une invitation à déposer ses fardeaux et à s'ouvrir 
                  à la miséricorde infinie.
                </p>
                <p>
                  Depuis 1885, nos portes ne se sont jamais fermées. L'adoration perpétuelle se poursuit 
                  nuit et jour, portée par des générations de fidèles et de veilleurs qui se relaient 
                  dans la prière.
                </p>
                <p>
                  Que vous soyez croyant, en recherche ou simplement de passage, vous êtes le bienvenu 
                  dans ce havre de paix où le temps semble suspendu.
                </p>
              </div>
              <div className="mt-8">
                <Link to="/qui-sommes-nous" className="btn-gold-outline inline-block">
                  En savoir plus
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section id="mission" data-reveal className="relative py-24 lg:py-32 bg-night-950 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 30% 70%, rgba(212,149,30,0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />

        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible("mission") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <div className="text-center mb-16">
            <span className="text-gold-400 text-xs tracking-[0.25em] uppercase font-medium">
              Mission & Vision
            </span>
            <h2 className="section-title text-ivory mt-3 mb-6">
              Ce qui nous anime
            </h2>
            <div className="ornament-divider max-w-md mx-auto">
              <span className="icon">✦</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                ),
                title: "Adoration",
                desc: "L'adoration perpétuelle est le cœur battant de notre sanctuaire. Nuit et jour, le Saint-Sacrement est exposé, et des veilleurs se relaient pour prier pour le monde.",
              },
              {
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                ),
                title: "Miséricorde",
                desc: "Nous sommes un lieu d'accueil inconditionnel. Chaque personne, quelle que soit son histoire, trouve ici un espace de réconciliation et de paix.",
              },
              {
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
                title: "Communauté",
                desc: "Notre sanctuaire est porté par une communauté vivante de laïcs, religieux et prêtres qui témoignent ensemble de la joie de l'Évangile.",
              },
            ].map((item, i) => (
              <div key={i} className="glass-dark rounded-2xl p-8 lg:p-10 text-center group hover:bg-white/[0.06] transition-all duration-500">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-500/20 transition-all duration-500 group-hover:scale-110">
                  {item.icon}
                </div>
                <h3 className="text-ivory font-serif text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-ivory/50 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE ADORATION COUNTER */}
      <AdorationLive />

      {/* ACTUALITES */}
      <section id="actualites" data-reveal className="relative py-24 lg:py-32 bg-ivory overflow-hidden">
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible("actualites") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <div className="text-center mb-16">
            <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">
              Actualités
            </span>
            <h2 className="section-title text-night-900 mt-3 mb-6">
              Les dernières nouvelles
            </h2>
            <div className="ornament-divider max-w-md mx-auto">
              <span className="icon">✦</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item) => (
              <article key={item.id} className="card-hover bg-white rounded-2xl overflow-hidden shadow-lg shadow-night-950/5 border border-pearl">
                <div className="relative h-56 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-xs font-medium bg-gold-500/90 text-white rounded-full backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <time className="text-xs text-night-400 tracking-wider uppercase">{item.date}</time>
                  <h3 className="font-serif text-lg font-semibold text-night-900 mt-2 mb-3 leading-snug">{item.title}</h3>
                  <p className="text-night-500/70 text-sm leading-relaxed">{item.excerpt}</p>
                  <Link to="/actualites" className="inline-flex items-center gap-2 mt-4 text-gold-600 text-sm font-medium hover:text-gold-700 transition-colors group">
                    Lire la suite
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/actualites" className="btn-gold-outline inline-block">
              Voir toutes les actualités
            </Link>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" data-reveal className="relative py-24 lg:py-32 bg-pearl overflow-hidden">
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible("gallery") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <div className="text-center mb-16">
            <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">
              Galerie
            </span>
            <h2 className="section-title text-night-900 mt-3 mb-6">
              La beauté du sanctuaire
            </h2>
            <div className="ornament-divider max-w-md mx-auto">
              <span className="icon">✦</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className={`relative rounded-2xl overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                  i === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover aspect-square transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-night-950/70 via-night-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <div className="text-left">
                    <p className="text-ivory text-sm font-serif">{img.alt}</p>
                    <span className="inline-flex items-center gap-1.5 text-gold-300 text-xs tracking-wider mt-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                      Agrandir
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {lightboxIndex !== null && (
          <Lightbox
            images={gallery}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" data-reveal className="relative py-24 lg:py-32 bg-ivory overflow-hidden">
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible("testimonials") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <div className="text-center mb-16">
            <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">
              Témoignages
            </span>
            <h2 className="section-title text-night-900 mt-3 mb-6">
              Ce qu'ils disent de nous
            </h2>
            <div className="ornament-divider max-w-md mx-auto">
              <span className="icon">✦</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl p-8 lg:p-10 border border-pearl-dark/30 card-hover overflow-hidden"
              >
                {/* Decorative corner */}
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-gold-400/10 to-transparent transition-transform duration-700 group-hover:scale-150" />

                <svg className="relative w-10 h-10 text-gold-400/40 mb-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="relative text-night-700/80 leading-relaxed italic mb-6 font-light">{t.text}</p>

                {/* Stars */}
                <div className="relative flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-3.5 h-3.5 text-gold-500" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>

                <div className="relative flex items-center gap-3 pt-4 border-t border-pearl-dark/30">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-serif text-sm font-semibold">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-night-900 font-medium text-sm">{t.author}</p>
                    <p className="text-night-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HORAIRES */}
      <section id="horaires" data-reveal className="relative py-24 lg:py-32 bg-pearl overflow-hidden">
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible("horaires") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <div className="text-center mb-16">
            <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">Pratique</span>
            <h2 className="section-title text-night-900 mt-3 mb-6">Horaires & Visites</h2>
            <div className="ornament-divider max-w-md mx-auto"><span className="icon">✦</span></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "Ouverture du sanctuaire",
                lines: [
                  { day: "Lundi — Samedi", time: "6h00 — 22h30" },
                  { day: "Dimanche", time: "8h00 — 20h00" },
                  { day: "Jours fériés", time: "9h00 — 19h00" },
                ],
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
              },
              {
                title: "Messes quotidiennes",
                lines: [
                  { day: "Semaine", time: "7h30 · 11h00 · 18h30" },
                  { day: "Samedi", time: "11h00 · 18h30 · 22h00" },
                  { day: "Dimanche", time: "10h00 · 11h30 · 18h00" },
                ],
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                ),
              },
              {
                title: "Adoration perpétuelle",
                lines: [
                  { day: "Saint-Sacrement", time: "Exposition 24h/24" },
                  { day: "Confessions", time: "10h00 — 18h00" },
                  { day: "Veillée nocturne", time: "Sur inscription" },
                ],
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                ),
              },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 lg:p-10 border border-pearl-dark/30 card-hover shadow-lg shadow-night-950/5">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-600 mb-6">
                  {card.icon}
                </div>
                <h3 className="font-serif text-lg font-semibold text-night-900 mb-5 pb-4 border-b border-pearl-dark/30">
                  {card.title}
                </h3>
                <ul className="space-y-4">
                  {card.lines.map((line, j) => (
                    <li key={j} className="flex justify-between items-baseline gap-4">
                      <span className="text-night-500 text-sm">{line.day}</span>
                      <span className="text-night-900 font-medium text-sm tracking-wider">{line.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/gallery-4.jpg" alt="Appel à l'action" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-night-950/80 backdrop-blur-[2px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ivory mb-6">
            Rejoignez la chaîne<br />d'adoration perpétuelle
          </h2>
          <p className="text-ivory/60 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Devenez veilleur et offrez une heure de votre semaine pour prier devant le Saint-Sacrement.
            Un engagement simple, une grâce infinie.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/inscription-veilleur" className="btn-primary">
              S'inscrire comme veilleur
            </Link>
            <Link to="/inscription-lecteur" className="btn-outline">
              Devenir lecteur
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
