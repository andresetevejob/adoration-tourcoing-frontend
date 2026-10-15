import { useState } from "react";
import { Button, Card } from "@chapelle/shared/ui";
import { ContactForm } from "../components/contact/ContactForm";
import { useSendContactMessage } from "../hooks/useSendContactMessage";
import type { ContactMessageDto } from "../api/endpoints/contact";

const INFOS = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Adresse",
    lines: ["18 Rue Faidherbe", "59200 Tourcoing, France"],
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    title: "Téléphone",
    lines: ["+33 1 53 41 89 00"],
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: "Email",
    lines: ["adorationtourcoing@gmail.com"],
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Horaires",
    lines: ["Lun–Sam : 6h00 – 22h30", "Dim : 8h00 – 20h00"],
  },
];

const SOCIALS = [
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

/** Remplace `legacy-template/pages/Contact.tsx` — hero, cartes d'info, réseaux sociaux et
 *  carte OpenStreetMap repris à l'identique (coordonnées placeholder du gabarit, sans
 *  contrepartie API), seul le conteneur du formulaire devient un `Card` reconnecté à
 *  `useSendContactMessage`. */
export default function PageContact() {
  const [sentNom, setSentNom] = useState<string | null>(null);
  const sendContactMessage = useSendContactMessage();

  function handleSubmit(dto: ContactMessageDto): void {
    sendContactMessage.mutate(dto, {
      onSuccess: () => {
        setSentNom(dto.nom);
      },
    });
  }

  function handleNewMessage(): void {
    setSentNom(null);
  }

  return (
    <main>
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 bg-night-950 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(212,149,30,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold-400 text-xs tracking-[0.3em] uppercase">Nous contacter</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-ivory mt-4 mb-6">Contact</h1>
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="h-px w-16 bg-gold-400/50" />
            <span className="text-gold-400 text-lg">✦</span>
            <span className="h-px w-16 bg-gold-400/50" />
          </div>
          <p className="text-ivory/50 max-w-xl mx-auto leading-relaxed">
            Une question, une intention de prière, une demande d'information ? N'hésitez pas à nous écrire. Nous vous
            répondrons avec joie.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="space-y-6">
              {INFOS.map((info) => (
                <div key={info.title} className="bg-white rounded-2xl p-6 border border-pearl flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-600 flex-shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-night-900 mb-1">{info.title}</h3>
                    {info.lines.map((line) => (
                      <p key={line} className="text-night-500/70 text-sm">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              <div className="bg-white rounded-2xl p-6 border border-pearl">
                <h3 className="font-serif text-base font-semibold text-night-900 mb-4">Réseaux sociaux</h3>
                <div className="flex gap-3">
                  {SOCIALS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="w-10 h-10 rounded-full bg-pearl hover:bg-gold-500/10 flex items-center justify-center text-night-500 hover:text-gold-600 transition-all duration-300 hover:scale-110"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <Card title={sentNom === null ? "Envoyez-nous un message" : undefined} className="p-8 lg:p-12">
                {sentNom !== null ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold-500/20 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-gold-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <h2 className="font-serif text-2xl font-semibold text-night-900 mb-4">Message envoyé !</h2>
                    <p className="text-night-500 mb-8">
                      Merci {sentNom}. Nous vous répondrons dans les meilleurs délais.
                    </p>
                    <Button variant="gold-outline" onClick={handleNewMessage}>
                      Nouveau message
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-night-400 text-sm mb-8">Tous les champs sont obligatoires.</p>
                    <ContactForm isSubmitting={sendContactMessage.isPending} onSubmit={handleSubmit} />
                  </>
                )}
              </Card>
            </div>
          </div>

          <div className="mt-16 rounded-3xl overflow-hidden shadow-2xl shadow-night-950/10 border border-pearl h-80 lg:h-96">
            <iframe
              title="Localisation du Sanctuaire"
              src="https://www.openstreetmap.org/export/embed.html?bbox=2.3410%2C48.8857%2C2.3450%2C48.8882&amp;layer=mapnik&amp;marker=48.88695%2C2.3430"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
