import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";

const footerSections = [
  {
    title: "Navigation",
    links: [
      { label: "Accueil", to: "/" },
      { label: "Actualités", to: "/actualites" },
      { label: "Qui sommes-nous ?", to: "/qui-sommes-nous" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Compte",
    links: [
      { label: "Connexion", to: "/connexion" },
      { label: "Inscription", to: "/inscription" },
    ],
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="#1e2338" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.94 29.94 0 0 0 1 11.75a29.94 29.94 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29.94 29.94 0 0 0 .46-5.25 29.94 29.94 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#1e2338" />
      </svg>
    ),
  },
];

/** Coordonnées et liens légaux repris du gabarit legacy (placeholder générique, cf.
 *  conception U8 §4) — à remplacer avant mise en production par le contenu réel de la
 *  Chapelle du Vœux (Tourcoing), même statut que `PageContact` (U7). */
export function Footer() {
  const { isAuthenticated } = useAuth();
  const visibleFooterSections = isAuthenticated
    ? footerSections.filter((section) => section.title !== "Compte")
    : footerSections;

  return (
    <footer className="relative bg-night-950 text-ivory/80 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(212,149,30,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${isAuthenticated ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-12 lg:gap-8`}
        >
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <p className="text-ivory text-sm font-serif font-semibold tracking-wider">Chapelle du Vœux</p>
            </div>
            <p className="text-ivory/50 text-sm leading-relaxed mt-4">
              Un lieu de paix, de prière et de recueillement au cœur de la cité, ouvert à tous ceux qui cherchent la
              lumière.
            </p>
          </div>
          {visibleFooterSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-gold-400 font-serif text-base font-semibold tracking-wide mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-ivory/50 hover:text-gold-400 text-sm transition-colors duration-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-gold-400 font-serif text-base font-semibold tracking-wide mb-4">Contact</h4>
            <div className="space-y-3 text-sm text-ivory/50">
              <p>35 Rue du Chevalier de la Barre</p>
              <p>75018 Paris, France</p>
              <p className="text-ivory/60 mt-2">+33 1 53 41 89 00</p>
              <p className="text-ivory/60">contact@sacrecoeur-sanctuaire.fr</p>
            </div>
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-gold-500/20 flex items-center justify-center text-ivory/50 hover:text-gold-400 transition-all duration-300 hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-ivory/30 text-xs tracking-wider">
            © {new Date().getFullYear()} Chapelle du Vœux · Tous droits réservés
          </p>
          <div className="flex gap-6 text-xs text-ivory/30">
            <a href="#" className="hover:text-gold-400/60 transition-colors">
              Mentions légales
            </a>
            <a href="#" className="hover:text-gold-400/60 transition-colors">
              Politique de confidentialité
            </a>
            <a href="#" className="hover:text-gold-400/60 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
