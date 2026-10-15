import { useCallback, useState } from "react";
import { Link } from "react-router";
import { StatutAnnonce } from "@chapelle/shared/types";
import { Spinner } from "@chapelle/shared/ui";
import { formatDate } from "@chapelle/shared/utils";
import { useAnnonces } from "../hooks/useAnnonces";
import { truncateExcerpt } from "../lib/excerpt";
import { AdorationLive } from "../components/vitrine/AdorationLive";
import { Lightbox } from "../components/vitrine/Lightbox";
import { OrnamentDivider } from "../components/vitrine/OrnamentDivider";

const gallery = [
  { src: "/images/gallery-1.jpg", alt: "Mosaïques du chœur" },
  { src: "/images/gallery-2.jpg", alt: "Jardin de prière" },
  { src: "/images/gallery-3.jpg", alt: "Lueur spirituelle" },
  { src: "/images/gallery-4.jpg", alt: "Aube sur la basilique" },
  { src: "/images/interior.jpg", alt: "Intérieur sacré" },
  { src: "/images/hero-bg.jpg", alt: "Vue panoramique" },
];

/** Témoignages attribués à des personnes fictives — repris tels quels du gabarit legacy
 *  sur demande explicite (cf. conception U8 §4, point ouvert 1), à remplacer avant mise
 *  en production par de vrais témoignages de la Chapelle du Vœux. */
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

const horaires = [
  {
    title: "Ouverture du sanctuaire",
    lines: [
      { day: "Lundi — Samedi", time: "6h00 — 22h30" },
      { day: "Dimanche", time: "8h00 — 20h00" },
      { day: "Jours fériés", time: "9h00 — 19h00" },
    ],
  },
  {
    title: "Messes quotidiennes",
    lines: [
      { day: "Semaine", time: "7h30 · 11h00 · 18h30" },
      { day: "Samedi", time: "11h00 · 18h30 · 22h00" },
      { day: "Dimanche", time: "10h00 · 11h30 · 18h00" },
    ],
  },
  {
    title: "Adoration perpétuelle",
    lines: [
      { day: "Saint-Sacrement", time: "Exposition 24h/24" },
      { day: "Confessions", time: "10h00 — 18h00" },
      { day: "Veillée nocturne", time: "Sur inscription" },
    ],
  },
];

/** Remplace le stub U0. Reprend la structure du gabarit legacy `Home.tsx`, avec les écarts
 *  documentés en conception U8 §4 : classes non définies remplacées par des utilitaires
 *  Tailwind explicites, section "Actualités" reconnectée à `useAnnonces` (au lieu de 3
 *  actualités codées en dur divergentes de `/actualites`), CTA vers des routes réelles,
 *  animation "reveal on scroll" non reproduite (purement décorative). */
export default function PageAccueil() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);
  const annoncesQuery = useAnnonces({ statut: StatutAnnonce.PUBLIE });
  const dernieresAnnonces = (annoncesQuery.data ?? []).slice(0, 3);

  return (
    <main>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-bg.jpg"
            alt="Chapelle du Vœux"
            className="w-full h-full object-cover scale-105 animate-fade-in"
            style={{ animationDuration: "2s" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-night-950/75 via-night-950/40 to-night-950/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 via-transparent to-transparent" />
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gold-400/40 rounded-full animate-float"
              style={{
                left: `${String((i * 47) % 100)}%`,
                top: `${String((i * 31) % 100)}%`,
                animationDelay: `${String(i * 0.3)}s`,
                animationDuration: `${String(4 + (i % 4))}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto pt-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="block h-px w-8 bg-gold-400/60" />
            <span className="text-gold-400 text-xs sm:text-sm tracking-[0.35em] uppercase font-medium">
              Chapelle du Vœux
            </span>
            <span className="block h-px w-8 bg-gold-400/60" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-ivory leading-[1.1] mb-8">
            Un cœur qui bat
            <br />
            <span className="text-gold-400 italic">pour le monde</span>
          </h1>
          <p className="text-ivory/75 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Depuis plus d'un siècle, la chapelle veille sur la ville. Un sanctuaire de paix, d'adoration perpétuelle et
            de miséricorde, ouvert jour et nuit à tous.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/inscription"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gold-500 px-6 py-3 text-sm sm:text-base font-medium text-night-950 hover:bg-gold-400 transition-colors"
            >
              Devenir veilleur
            </Link>
            <Link
              to="/actualites"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-ivory/30 px-6 py-3 text-sm sm:text-base font-medium text-ivory hover:bg-white/10 transition-colors"
            >
              Découvrir l'actualité
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR - masquée temporairement (chiffres placeholders à remplacer avant réactivation) */}
      {/*
      <section className="relative bg-gradient-to-r from-night-900 via-night-950 to-night-900 border-y border-gold-500/10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 text-center">
            {[
              { value: "140+", label: "Années d'adoration" },
              { value: "365j", label: "Ouvert toute l'année" },
              { value: "24/7", label: "Présence ininterrompue" },
              { value: "11M", label: "Visiteurs par an" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-ivory/50 text-xs sm:text-sm tracking-[0.2em] uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* PRESENTATION */}
      <section className="relative py-24 lg:py-32 bg-ivory">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-night-950/10">
              <img src="/images/interior.jpg" alt="Intérieur du sanctuaire" className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/40 to-transparent" />
            </div>
            <div>
              <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">Notre sanctuaire</span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-night-900 mt-3 mb-6">
                Un lieu saint au cœur
                <br />
                de la ville
              </h2>
              <OrnamentDivider className="ml-0" />
              <div className="space-y-5 text-night-600/80 leading-relaxed">
                <p>
                  La Chapelle du Vœux est bien plus qu'un monument. C'est un appel à la contemplation, une invitation
                  à déposer ses fardeaux et à s'ouvrir à la miséricorde infinie.
                </p>
                <p>
                  Nos portes ne se sont jamais fermées. L'adoration perpétuelle se poursuit nuit et jour, portée par
                  des générations de fidèles et de veilleurs qui se relaient dans la prière.
                </p>
                <p>
                  Que vous soyez croyant, en recherche ou simplement de passage, vous êtes le bienvenu dans ce havre
                  de paix où le temps semble suspendu.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  to="/qui-sommes-nous"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gold-500 px-6 py-3 text-sm font-medium text-gold-700 hover:bg-gold-50 transition-colors"
                >
                  En savoir plus
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="relative py-24 lg:py-32 bg-night-950">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-400 text-xs tracking-[0.25em] uppercase font-medium">Mission & Vision</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ivory mt-3 mb-6">
              Ce qui nous anime
            </h2>
            <OrnamentDivider />
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                title: "Adoration",
                desc: "L'adoration perpétuelle est le cœur battant de notre sanctuaire. Nuit et jour, le Saint-Sacrement est exposé, et des veilleurs se relaient pour prier pour le monde.",
              },
              {
                title: "Miséricorde",
                desc: "Nous sommes un lieu d'accueil inconditionnel. Chaque personne, quelle que soit son histoire, trouve ici un espace de réconciliation et de paix.",
              },
              {
                title: "Communauté",
                desc: "Notre sanctuaire est porté par une communauté vivante de laïcs, religieux et prêtres qui témoignent ensemble de la joie de l'Évangile.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-10 text-center"
              >
                <h3 className="text-ivory font-serif text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-ivory/50 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AdorationLive />

      {/* ACTUALITES */}
      <section className="relative py-24 lg:py-32 bg-ivory">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">Actualités</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-night-900 mt-3 mb-6">
              Les dernières nouvelles
            </h2>
            <OrnamentDivider />
          </div>

          {annoncesQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : annoncesQuery.isError ? (
            <p role="alert" className="text-center text-night-400 py-8">
              Impossible de charger les actualités. Veuillez réessayer plus tard.
            </p>
          ) : dernieresAnnonces.length === 0 ? (
            <p className="text-center text-night-400 py-8">Aucune actualité pour le moment.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {dernieresAnnonces.map((annonce) => (
                <article
                  key={annonce.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-night-950/5 border border-pearl transition-transform duration-500 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-32 flex items-center justify-center bg-night-950">
                    <span className="text-gold-400 text-3xl">✦</span>
                  </div>
                  <div className="p-6">
                    <time className="text-xs text-night-400 tracking-wider uppercase">
                      {formatDate(annonce.datePublication)}
                    </time>
                    <h3 className="font-serif text-lg font-semibold text-night-900 mt-2 mb-3 leading-snug">
                      {annonce.titre}
                    </h3>
                    <p className="text-night-500/70 text-sm leading-relaxed">{truncateExcerpt(annonce.contenu)}</p>
                    <Link to="/actualites" className="inline-flex items-center gap-2 mt-4 text-gold-600 text-sm font-medium hover:text-gold-700 transition-colors">
                      Lire la suite
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/actualites"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-gold-500 px-6 py-3 text-sm font-medium text-gold-700 hover:bg-gold-50 transition-colors"
            >
              Voir toutes les actualités
            </Link>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="relative py-24 lg:py-32 bg-pearl">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">Galerie</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-night-900 mt-3 mb-6">
              La beauté du sanctuaire
            </h2>
            <OrnamentDivider />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {gallery.map((img, i) => (
              <button
                key={img.src}
                onClick={() => {
                  setLightboxIndex(i);
                }}
                className={`relative rounded-2xl overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                  i === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover aspect-square transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night-950/70 via-night-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <p className="text-ivory text-sm font-serif text-left">{img.alt}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {lightboxIndex !== null && (
          <Lightbox
            images={gallery}
            index={lightboxIndex}
            onClose={closeLightbox}
            onNavigate={setLightboxIndex}
          />
        )}
      </section>

      {/* TESTIMONIALS */}
      <section className="relative py-24 lg:py-32 bg-ivory">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">Témoignages</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-night-900 mt-3 mb-6">
              Ce qu'ils disent de nous
            </h2>
            <OrnamentDivider />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.author} className="bg-white rounded-2xl p-8 lg:p-10 border border-pearl-dark/30">
                <p className="text-night-700/80 leading-relaxed italic mb-6 font-light">{t.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-pearl-dark/30">
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
      <section className="relative py-24 lg:py-32 bg-pearl">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">Pratique</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-night-900 mt-3 mb-6">
              Horaires & Visites
            </h2>
            <OrnamentDivider />
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {horaires.map((card) => (
              <div key={card.title} className="bg-white rounded-2xl p-8 lg:p-10 border border-pearl-dark/30 shadow-lg shadow-night-950/5">
                <h3 className="font-serif text-lg font-semibold text-night-900 mb-5 pb-4 border-b border-pearl-dark/30">
                  {card.title}
                </h3>
                <ul className="space-y-4">
                  {card.lines.map((line) => (
                    <li key={line.day} className="flex justify-between items-baseline gap-4">
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
            Rejoignez la chaîne
            <br />
            d'adoration perpétuelle
          </h2>
          <p className="text-ivory/60 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Devenez veilleur et offrez une heure de votre semaine pour prier devant le Saint-Sacrement. Un engagement
            simple, une grâce infinie.
          </p>
          <Link
            to="/inscription"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gold-500 px-6 py-3 text-base font-medium text-night-950 hover:bg-gold-400 transition-colors"
          >
            S'inscrire comme veilleur
          </Link>
        </div>
      </section>
    </main>
  );
}
