import { useState } from "react";
import type { AnnonceResponse } from "@chapelle/shared/types";
import { StatutAnnonce } from "@chapelle/shared/types";
import { Modal, Pagination, Spinner } from "@chapelle/shared/ui";
import { formatDate } from "@chapelle/shared/utils";
import { useAnnonces } from "../hooks/useAnnonces";
import { truncateExcerpt } from "../lib/excerpt";

const ITEMS_PER_PAGE = 4;

/** Remplace `legacy-template/pages/Actualites.tsx` (données statiques) — Hero inchangé,
 *  grille reconnectée à `useAnnonces({ statut: PUBLIE })`. Pas d'`image`/`category` sur
 *  `AnnonceResponse` : bandeau ornemental statique à la place, cf. conception U6 §7. */
export default function PageActualites() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AnnonceResponse | null>(null);
  const annoncesQuery = useAnnonces({ statut: StatutAnnonce.PUBLIE });

  const annonces = annoncesQuery.data ?? [];
  const totalPages = Math.ceil(annonces.length / ITEMS_PER_PAGE);
  const currentPage = totalPages === 0 ? 0 : Math.min(page, totalPages - 1);
  const displayedAnnonces = annonces.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
  );

  return (
    <main>
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 bg-night-950 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212,149,30,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold-400 text-xs tracking-[0.3em] uppercase">Restez informés</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-ivory mt-4 mb-6">Actualités</h1>
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="h-px w-16 bg-gold-400/50" />
            <span className="text-gold-400 text-lg">✦</span>
            <span className="h-px w-16 bg-gold-400/50" />
          </div>
          <p className="text-ivory/50 max-w-xl mx-auto leading-relaxed">
            Toute l'actualité de la Chapelle du Vœux : célébrations, événements et vie de notre communauté.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {annoncesQuery.isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : annoncesQuery.isError ? (
            <p role="alert" className="text-center text-night-400 py-16">
              Impossible de charger les actualités. Veuillez réessayer plus tard.
            </p>
          ) : annonces.length === 0 ? (
            <p className="text-center text-night-400 py-16">Aucune actualité pour le moment.</p>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-8">
                {displayedAnnonces.map((annonce) => (
                  <article
                    key={annonce.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-night-950/5 border border-pearl cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-xl"
                    onClick={() => {
                      setSelected(annonce);
                    }}
                  >
                    <div className="relative h-32 flex items-center justify-center bg-night-950">
                      <span className="text-gold-400 text-3xl">✦</span>
                    </div>
                    <div className="p-6 lg:p-8">
                      <time className="text-xs text-night-400 tracking-wider uppercase">
                        {formatDate(annonce.datePublication)}
                      </time>
                      <h3 className="font-serif text-xl font-semibold text-night-900 mt-2 mb-3 leading-snug">
                        {annonce.titre}
                      </h3>
                      <p className="text-night-500/70 text-sm leading-relaxed">{truncateExcerpt(annonce.contenu)}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-16">
                <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </section>

      <Modal
        isOpen={selected !== null}
        title={selected?.titre}
        onClose={() => {
          setSelected(null);
        }}
      >
        {selected && (
          <>
            <time className="text-xs text-night-400 tracking-wider uppercase">
              {formatDate(selected.datePublication)}
            </time>
            <p className="mt-4 leading-relaxed">{selected.contenu}</p>
          </>
        )}
      </Modal>
    </main>
  );
}
