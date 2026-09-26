import { useState, useEffect } from "react";

const timeline = [
  { year: "1875", title: "Pose de la première pierre", desc: "Le 16 juin 1875, la première pierre est posée, marquant le début d'une aventure architecturale et spirituelle hors du commun." },
  { year: "1885", title: "Début de l'adoration perpétuelle", desc: "Le 1er août 1885, l'adoration perpétuelle commence. Depuis, la prière n'a jamais cessé, portée par des générations de veilleurs." },
  { year: "1919", title: "Consécration solennelle", desc: "La basilique est solennellement consacrée. Elle devient un haut lieu de pèlerinage et de dévotion au Sacré-Cœur de Jésus." },
  { year: "1985", title: "Centenaire de l'adoration", desc: "Le centenaire de l'adoration perpétuelle est célébré en présence de nombreuses personnalités religieuses du monde entier." },
  { year: "2000", title: "Jubilé de l'an 2000", desc: "Le sanctuaire vit un temps fort de renouveau spirituel à l'occasion du grand Jubilé, accueillant des pèlerins de tous les continents." },
  { year: "2024", title: "Restauration et modernisation", desc: "Lancement d'un vaste programme de restauration et de modernisation pour transmettre ce patrimoine aux générations futures." },
];

const team = [
  { name: "Père Jean-Marie", role: "Recteur du Sanctuaire", desc: "Ordonné en 1995, il guide la communauté avec sagesse et bienveillance depuis 2018." },
  { name: "Sœur Élisabeth", role: "Responsable des veilleurs", desc: "Religieuse bénédictine, elle coordonne la chaîne d'adoration avec ferveur et dévouement." },
  { name: "M. Pierre Lefèvre", role: "Coordinateur laïc", desc: "Laïc engagé, il gère la logistique et l'accueil des visiteurs au quotidien." },
  { name: "Mme Claire Dubois", role: "Responsable communication", desc: "Elle veille à faire rayonner la vie du sanctuaire à travers les médias et les réseaux." },
];

const valeurs = [
  { icon: "🙏", title: "Prière", desc: "La prière est la source de notre vie. Nous croyons en la puissance de l'intercession et de l'adoration silencieuse." },
  { icon: "🤝", title: "Accueil", desc: "Chaque personne est accueillie comme le Christ lui-même, sans jugement, avec une bienveillance inconditionnelle." },
  { icon: "🔥", title: "Ferveur", desc: "Notre engagement est porté par une foi vivante et contagieuse, qui rayonne au-delà des murs du sanctuaire." },
  { icon: "🌍", title: "Universalité", desc: "Le Sacré-Cœur est un lieu pour toutes les nations. Nous célébrons la diversité comme une richesse." },
];

export default function QuiSommesNous() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

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
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 bg-night-950 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(212,149,30,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold-400 text-xs tracking-[0.3em] uppercase">Notre histoire</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-ivory mt-4 mb-6">Qui sommes-nous ?</h1>
          <div className="ornament-divider max-w-md mx-auto mb-8"><span className="icon">✦</span></div>
          <p className="text-ivory/50 max-w-2xl mx-auto leading-relaxed">
            Découvrez l'histoire, la mission et les visages de notre sanctuaire. Une communauté vivante au service de l'adoration et de l'accueil.
          </p>
        </div>
      </section>

      {/* Notre Histoire */}
      <section id="histoire" data-reveal className="py-24 lg:py-32 bg-ivory overflow-hidden">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible("histoire") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-night-950/10">
                <img src="/images/about-hero.jpg" alt="Notre histoire" className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-night-950/40 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold-500/10 rounded-3xl -z-10" />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">Notre histoire</span>
              <h2 className="section-title text-night-900 mt-3 mb-6">Un siècle et demi de prière ininterrompue</h2>
              <div className="ornament-divider mb-8"><span className="icon">✦</span></div>
              <div className="space-y-5 text-night-600/80 leading-relaxed">
                <p>
                  Notre sanctuaire est né d'une intuition profonde : offrir à Dieu un lieu où la prière ne s'éteindrait jamais.
                  Depuis 1885, l'adoration perpétuelle se poursuit sans interruption, portée par des milliers de veilleurs.
                </p>
                <p>
                  Situé au sommet de la butte Montmartre, il domine Paris comme un phare spirituel. 
                  Visible à des kilomètres, sa silhouette blanche rappelle à tous la présence aimante du Cœur de Dieu.
                </p>
                <p>
                  Aujourd'hui, notre mission reste la même : être un lieu de paix, de miséricorde et de rencontre, 
                  où chacun peut venir déposer ses joies et ses peines dans le silence de l'adoration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section id="valeurs" data-reveal className="py-24 lg:py-32 bg-pearl overflow-hidden">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible("valeurs") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="text-center mb-16">
            <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">Nos valeurs</span>
            <h2 className="section-title text-night-900 mt-3 mb-6">Ce en quoi nous croyons</h2>
            <div className="ornament-divider max-w-md mx-auto"><span className="icon">✦</span></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {valeurs.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 text-center card-hover border border-pearl">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-serif text-lg font-semibold text-night-900 mb-3">{v.title}</h3>
                <p className="text-night-500/70 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline" data-reveal className="py-24 lg:py-32 bg-ivory overflow-hidden">
        <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible("timeline") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="text-center mb-16">
            <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">Frise chronologique</span>
            <h2 className="section-title text-night-900 mt-3 mb-6">Les grandes dates</h2>
            <div className="ornament-divider max-w-md mx-auto"><span className="icon">✦</span></div>
          </div>

          <div className="relative">
            {/* Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold-400/60 via-gold-400/20 to-transparent md:-translate-x-px" />

            <div className="space-y-12">
              {timeline.map((item, i) => (
                <div key={i} className={`relative flex flex-col md:flex-row gap-6 md:gap-12 items-start ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-gold-500 rounded-full -translate-x-1/2 z-10 shadow-lg shadow-gold-500/40 ring-4 ring-ivory" />

                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                    <span className="inline-block text-gold-600 font-serif text-3xl font-bold mb-2">{item.year}</span>
                    <h3 className="font-serif text-xl font-semibold text-night-900 mb-2">{item.title}</h3>
                    <p className="text-night-500/70 text-sm leading-relaxed">{item.desc}</p>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section id="equipe" data-reveal className="py-24 lg:py-32 bg-night-950 overflow-hidden">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible("equipe") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="text-center mb-16">
            <span className="text-gold-400 text-xs tracking-[0.25em] uppercase font-medium">Notre équipe</span>
            <h2 className="section-title text-ivory mt-3 mb-6">Ceux qui font vivre le sanctuaire</h2>
            <div className="ornament-divider max-w-md mx-auto"><span className="icon">✦</span></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <div key={i} className="glass-dark rounded-2xl p-8 text-center group hover:bg-white/[0.06] transition-all duration-500">
                <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-ivory font-serif text-2xl font-semibold shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform duration-500">
                  {member.name.split(" ").map(w => w[0]).join("")}
                </div>
                <h3 className="text-ivory font-serif text-lg font-semibold">{member.name}</h3>
                <p className="text-gold-400 text-sm mb-3">{member.role}</p>
                <p className="text-ivory/50 text-sm leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
