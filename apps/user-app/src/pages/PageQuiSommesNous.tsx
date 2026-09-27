import { OrnamentDivider } from "../components/vitrine/OrnamentDivider";

/** Remplace le placeholder `/qui-sommes-nous`. Reprend la structure du gabarit legacy
 *  `QuiSommesNous.tsx` (cf. conception U8 §4) : classes non définies remplacées par des
 *  utilitaires Tailwind explicites, animation "reveal on scroll" non reproduite. Contenu
 *  narratif fictif (histoire, équipe cléricale nommée) conservé tel quel sur demande
 *  explicite — à remplacer avant mise en production par le contenu réel de la Chapelle du
 *  Vœux (Tourcoing). */
const timeline = [
  {
    year: "1875",
    title: "Pose de la première pierre",
    desc: "Le 16 juin 1875, la première pierre est posée, marquant le début d'une aventure architecturale et spirituelle hors du commun.",
  },
  {
    year: "1885",
    title: "Début de l'adoration perpétuelle",
    desc: "Le 1er août 1885, l'adoration perpétuelle commence. Depuis, la prière n'a jamais cessé, portée par des générations de veilleurs.",
  },
  {
    year: "1919",
    title: "Consécration solennelle",
    desc: "La chapelle est solennellement consacrée. Elle devient un haut lieu de pèlerinage et de dévotion au Sacré-Cœur de Jésus.",
  },
  {
    year: "1985",
    title: "Centenaire de l'adoration",
    desc: "Le centenaire de l'adoration perpétuelle est célébré en présence de nombreuses personnalités religieuses du monde entier.",
  },
  {
    year: "2000",
    title: "Jubilé de l'an 2000",
    desc: "Le sanctuaire vit un temps fort de renouveau spirituel à l'occasion du grand Jubilé, accueillant des pèlerins de tous les continents.",
  },
  {
    year: "2024",
    title: "Restauration et modernisation",
    desc: "Lancement d'un vaste programme de restauration et de modernisation pour transmettre ce patrimoine aux générations futures.",
  },
];

const team = [
  {
    name: "Père Jean-Marie",
    role: "Recteur du Sanctuaire",
    desc: "Ordonné en 1995, il guide la communauté avec sagesse et bienveillance depuis 2018.",
  },
  {
    name: "Sœur Élisabeth",
    role: "Responsable des veilleurs",
    desc: "Religieuse bénédictine, elle coordonne la chaîne d'adoration avec ferveur et dévouement.",
  },
  {
    name: "M. Pierre Lefèvre",
    role: "Coordinateur laïc",
    desc: "Laïc engagé, il gère la logistique et l'accueil des visiteurs au quotidien.",
  },
  {
    name: "Mme Claire Dubois",
    role: "Responsable communication",
    desc: "Elle veille à faire rayonner la vie du sanctuaire à travers les médias et les réseaux.",
  },
];

const valeurs = [
  {
    icon: "🙏",
    title: "Prière",
    desc: "La prière est la source de notre vie. Nous croyons en la puissance de l'intercession et de l'adoration silencieuse.",
  },
  {
    icon: "🤝",
    title: "Accueil",
    desc: "Chaque personne est accueillie comme le Christ lui-même, sans jugement, avec une bienveillance inconditionnelle.",
  },
  {
    icon: "🔥",
    title: "Ferveur",
    desc: "Notre engagement est porté par une foi vivante et contagieuse, qui rayonne au-delà des murs du sanctuaire.",
  },
  {
    icon: "🌍",
    title: "Universalité",
    desc: "La chapelle est un lieu pour toutes les nations. Nous célébrons la diversité comme une richesse.",
  },
];

export default function PageQuiSommesNous() {
  return (
    <main>
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 bg-night-950 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold-400 text-xs tracking-[0.3em] uppercase">Notre histoire</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-ivory mt-4 mb-6">
            Qui sommes-nous ?
          </h1>
          <OrnamentDivider />
          <p className="text-ivory/50 max-w-2xl mx-auto leading-relaxed">
            Découvrez l'histoire, la mission et les visages de notre sanctuaire. Une communauté vivante au service de
            l'adoration et de l'accueil.
          </p>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-night-950/10">
              <img src="/images/about-hero.jpg" alt="Notre histoire" className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/40 to-transparent" />
            </div>
            <div>
              <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">Notre histoire</span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-night-900 mt-3 mb-6">
                Un siècle et demi de prière ininterrompue
              </h2>
              <OrnamentDivider />
              <div className="space-y-5 text-night-600/80 leading-relaxed">
                <p>
                  Notre sanctuaire est né d'une intuition profonde : offrir à Dieu un lieu où la prière ne s'éteindrait
                  jamais. Depuis 1885, l'adoration perpétuelle se poursuit sans interruption, portée par des milliers
                  de veilleurs.
                </p>
                <p>
                  Aujourd'hui, notre mission reste la même : être un lieu de paix, de miséricorde et de rencontre, où
                  chacun peut venir déposer ses joies et ses peines dans le silence de l'adoration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-pearl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">Nos valeurs</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-night-900 mt-3 mb-6">
              Ce en quoi nous croyons
            </h2>
            <OrnamentDivider />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {valeurs.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-8 text-center border border-pearl">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-serif text-lg font-semibold text-night-900 mb-3">{v.title}</h3>
                <p className="text-night-500/70 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-ivory">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 text-xs tracking-[0.25em] uppercase font-medium">Frise chronologique</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-night-900 mt-3 mb-6">
              Les grandes dates
            </h2>
            <OrnamentDivider />
          </div>

          <div className="space-y-12">
            {timeline.map((item) => (
              <div key={item.year} className="flex flex-col gap-2">
                <span className="inline-block text-gold-600 font-serif text-3xl font-bold">{item.year}</span>
                <h3 className="font-serif text-xl font-semibold text-night-900">{item.title}</h3>
                <p className="text-night-500/70 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-night-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-400 text-xs tracking-[0.25em] uppercase font-medium">Notre équipe</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ivory mt-3 mb-6">
              Ceux qui font vivre le sanctuaire
            </h2>
            <OrnamentDivider />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-ivory font-serif text-2xl font-semibold">
                  {member.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
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
