import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/inscription-adorateur", label: "Inscription adorateur" },
  { to: "/inscription-veilleur", label: "Inscription veilleur" },
  { to: "/qui-sommes-nous", label: "Qui sommes-nous ?" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-night-950/90 backdrop-blur-xl shadow-2xl shadow-black/20 py-2"
            : "bg-gradient-to-b from-night-950/70 to-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/30 transition-transform duration-500 group-hover:scale-105 group-hover:shadow-gold-500/50">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-ivory text-sm font-serif font-semibold tracking-wider leading-tight">
                Chapelle du
              </p>
              <p className="text-gold-400 text-xs tracking-[0.2em] uppercase leading-tight">
                Voeux
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`relative px-3 xl:px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 rounded-full ${
                      isActive
                        ? "text-gold-400"
                        : "text-ivory/80 hover:text-gold-300"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gold-500 rounded-full animate-glow" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 group"
            aria-label="Menu"
          >
            <span
              className={`block w-6 h-0.5 bg-ivory rounded-full transition-all duration-400 ${
                mobileOpen ? "rotate-45 translate-y-1" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-ivory rounded-full transition-all duration-400 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-ivory rounded-full transition-all duration-400 ${
                mobileOpen ? "-rotate-45 -translate-y-1" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-600 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-night-950/95 backdrop-blur-2xl" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
          <nav className="w-full max-w-sm space-y-2">
            {navLinks.map((link, i) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block text-center py-4 text-lg font-serif tracking-wide rounded-2xl transition-all duration-500 ${
                    isActive
                      ? "text-gold-400 bg-gold-500/10 border border-gold-500/20"
                      : "text-ivory/80 hover:text-gold-300 hover:bg-white/[0.03] border border-transparent"
                  }`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-10 text-center">
            <p className="text-gold-400/60 text-xs tracking-[0.3em] uppercase">
              Sanctuaire du Sacré-Cœur
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
