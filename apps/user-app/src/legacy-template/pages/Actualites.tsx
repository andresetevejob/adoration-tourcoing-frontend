import { useState, useEffect } from "react";

const allNews = [
  {
    id: 1,
    title: "Célébration de la Pentecôte 2026",
    date: "15 juin 2026",
    image: "/images/gallery-2.jpg",
    excerpt: "Rejoignez-nous pour la grande célébration de la Pentecôte, un temps fort de prière et de communion fraternelle qui rassemblera des fidèles du monde entier.",
    category: "Célébration",
    content: "La Pentecôte est l'un des temps forts de l'année liturgique au Sanctuaire du Sacré-Cœur. Cette année, nous aurons la joie d'accueillir Mgr Laurent Ulrich pour la messe solennelle. La veillée de prière débutera le samedi soir à 20h et se poursuivra toute la nuit. Le dimanche, plusieurs messes seront célébrées tout au long de la journée. Venez nombreux vivre ce moment de grâce et de communion fraternelle.",
  },
  {
    id: 2,
    title: "Nouveaux horaires d'adoration",
    date: "2 juin 2026",
    image: "/images/gallery-3.jpg",
    excerpt: "À partir de juillet, l'adoration eucharistique sera étendue à de nouveaux créneaux pour mieux vous accueillir et répondre à la demande croissante des fidèles.",
    category: "Annonce",
    content: "Face à l'affluence grandissante des fidèles et à la demande de nombreux groupes de prière, le Sanctuaire du Sacré-Cœur est heureux d'annoncer l'extension des horaires d'adoration eucharistique. À compter du 1er juillet 2026, l'adoration sera également proposée tous les mardis et jeudis de 6h à 8h du matin, en plus des créneaux existants. Ces nouveaux horaires visent à permettre aux personnes qui travaillent tôt le matin de pouvoir bénéficier d'un temps de prière silencieuse avant leur journée.",
  },
  {
    id: 3,
    title: "Restauration des mosaïques du chœur",
    date: "20 mai 2026",
    image: "/images/gallery-1.jpg",
    excerpt: "Les travaux de restauration des mosaïques du chœur avancent magnifiquement. Découvrez les premières images de ce chef-d'œuvre rénové.",
    category: "Patrimoine",
    content: "Les travaux de restauration des mosaïques du chœur, commencés en janvier dernier, entrent dans leur phase finale. Les artisans spécialisés ont travaillé avec un soin minutieux pour redonner tout leur éclat aux tesselles dorées qui ornent la voûte du chœur depuis plus d'un siècle. Cette restauration, rendue possible grâce à la générosité de nombreux donateurs, permettra aux visiteurs de redécouvrir la splendeur originelle de ce joyau de l'art sacré.",
  },
  {
    id: 4,
    title: "Retraite spirituelle d'été",
    date: "5 mai 2026",
    image: "/images/gallery-4.jpg",
    excerpt: "Inscrivez-vous dès maintenant pour la retraite spirituelle d'été qui se tiendra du 10 au 15 août sur le thème « L'oraison du cœur ».",
    category: "Événement",
    content: "Le Sanctuaire du Sacré-Cœur propose cet été une retraite spirituelle exceptionnelle animée par le Père Benoît, spécialiste de la spiritualité carmélitaine. Durant cinq jours, les participants seront invités à approfondir leur vie de prière à travers des enseignements, des temps de silence, des ateliers et des célébrations liturgiques. La retraite se déroulera dans un cadre privilégié, avec hébergement possible à la maison d'accueil du sanctuaire.",
  },
  {
    id: 5,
    title: "Concert de musique sacrée",
    date: "18 avril 2026",
    image: "/images/interior.jpg",
    excerpt: "Le Chœur Grégorien de Paris donnera un concert exceptionnel dans la basilique le 25 mai prochain. Réservation conseillée.",
    category: "Culture",
    content: "Dans le cadre de la saison musicale du Sanctuaire, nous avons l'honneur d'accueillir le Chœur Grégorien de Paris pour un concert exceptionnel dédié aux grandes œuvres du répertoire sacré. Au programme : des pièces de Palestrina, Allegri, Fauré et Duruflé, interprétées sous la direction de Jean-Michel Bardez. L'acoustique exceptionnelle de la basilique promet une expérience musicale inoubliable.",
  },
  {
    id: 6,
    title: "Journée portes ouvertes des vocations",
    date: "30 mars 2026",
    image: "/images/gallery-2.jpg",
    excerpt: "Une journée pour découvrir les différentes vocations au sein de l'Église : sacerdotale, religieuse, laïcale. Témoignages et échanges au programme.",
    category: "Vocation",
    content: "Le Sanctuaire organise une journée portes ouvertes dédiée aux vocations. Cette journée s'adresse à tous ceux qui s'interrogent sur leur chemin de vie et souhaitent découvrir la diversité des appels au sein de l'Église. Des prêtres, religieux, religieuses et laïcs engagés partageront leur témoignage. Des temps de prière, d'échange et d'accompagnement personnalisé seront proposés tout au long de la journée.",
  },
];

const ITEMS_PER_PAGE = 4;

export default function Actualites() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNews, setSelectedNews] = useState<typeof allNews[0] | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const totalPages = Math.ceil(allNews.length / ITEMS_PER_PAGE);
  const displayedNews = allNews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 bg-night-950 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212,149,30,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold-400 text-xs tracking-[0.3em] uppercase">Restez informés</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-ivory mt-4 mb-6">
            Actualités
          </h1>
          <div className="ornament-divider max-w-md mx-auto mb-8">
            <span className="icon">✦</span>
          </div>
          <p className="text-ivory/50 max-w-xl mx-auto leading-relaxed">
            Toute l'actualité du Sanctuaire du Sacré-Cœur : célébrations, événements, 
            travaux de restauration et vie de notre communauté.
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className={`py-20 lg:py-28 bg-ivory transition-all duration-1000 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {displayedNews.map((item) => (
              <article
                key={item.id}
                className="card-hover bg-white rounded-2xl overflow-hidden shadow-lg shadow-night-950/5 border border-pearl cursor-pointer"
                onClick={() => setSelectedNews(item)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-xs font-medium bg-gold-500/90 text-white rounded-full backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 lg:p-8">
                  <time className="text-xs text-night-400 tracking-wider uppercase">{item.date}</time>
                  <h3 className="font-serif text-xl font-semibold text-night-900 mt-2 mb-3 leading-snug">{item.title}</h3>
                  <p className="text-night-500/70 text-sm leading-relaxed">{item.excerpt}</p>
                  <span className="inline-flex items-center gap-2 mt-4 text-gold-600 text-sm font-medium group">
                    Lire la suite
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-full flex items-center justify-center text-night-500 hover:text-gold-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                    currentPage === i + 1
                      ? "bg-gold-500 text-white shadow-lg shadow-gold-500/30"
                      : "text-night-500 hover:text-gold-600 hover:bg-gold-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-full flex items-center justify-center text-night-500 hover:text-gold-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}

          {allNews.length === 0 && (
            <p className="text-center text-night-400 py-16">Aucune actualité pour le moment.</p>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedNews(null)}>
          <div className="absolute inset-0 bg-night-950/80 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-72">
              <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover rounded-t-3xl" />
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-night-800 hover:bg-white transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-xs font-medium bg-gold-500/90 text-white rounded-full backdrop-blur-sm">
                  {selectedNews.category}
                </span>
              </div>
            </div>
            <div className="p-8">
              <time className="text-xs text-night-400 tracking-wider uppercase">{selectedNews.date}</time>
              <h2 className="font-serif text-2xl font-semibold text-night-900 mt-2 mb-4">{selectedNews.title}</h2>
              <p className="text-night-600/80 leading-relaxed">{selectedNews.content}</p>
              <button
                onClick={() => setSelectedNews(null)}
                className="mt-8 btn-gold-outline inline-block"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
